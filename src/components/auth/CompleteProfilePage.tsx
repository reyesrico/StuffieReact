/**
 * CompleteProfilePage
 *
 * Shown after social login (Google/Apple) when the user's profile is
 * incomplete — typically when Apple omits the name after the first sign-in,
 * or when the user used "Hide My Email".
 *
 * The user is already authenticated (JWT in localStorage) when they land here.
 * Submitting updates the user record via PATCH /users/:_id, then redirects to /.
 */
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PersonRegular, CheckmarkCircleRegular } from '@fluentui/react-icons';

import Button from '../shared/Button';
import TextField from '../shared/TextField';
import WarningMessage from '../shared/WarningMessage';
import Loading from '../shared/Loading';
import UserContext from '../../context/UserContext';
import ThemeContext from '../../context/ThemeContext';
import { updateUser } from '../../api/users.api';
import { WarningMessageType } from '../shared/types';

import './CompleteProfilePage.scss';

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [firstName,  setFirstName]  = useState(user?.first_name  || '');
  const [lastName,   setLastName]   = useState(user?.last_name   || '');
  const [isLoading,  setIsLoading]  = useState(false);
  const [isDone,     setIsDone]     = useState(false);
  const [message,    setMessage]    = useState('');

  // If profile is already complete, redirect immediately
  React.useEffect(() => {
    if (user && user.first_name && user.last_name) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setMessage(t('completeProfile.fillRequired'));
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const updated = await updateUser(String(user?._id), {
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
      });

      // Update UserContext + localStorage
      const merged = { ...user, ...updated, first_name: firstName.trim(), last_name: lastName.trim() };
      setUser(merged);
      localStorage.setItem('stuffie-user', JSON.stringify(merged));

      setIsDone(true);

      // Give the user a moment to see the success state, then navigate
      setTimeout(() => navigate('/', { replace: true }), 1400);
    } catch {
      setMessage(t('completeProfile.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  const logoSrc = theme === 'light'
    ? `${import.meta.env.BASE_URL}images/stuffie-logo-light.svg`
    : `${import.meta.env.BASE_URL}images/stuffie-logo-dark.svg`;

  return (
    <div className="complete-profile">
      <div className="complete-profile__header">
        <img src={logoSrc} alt={t('common.logoAlt')} width="52" height="52" className="complete-profile__logo" />
        <h1 className="complete-profile__title">
          <span className="complete-profile__stuffie">Stuffie</span>
        </h1>
      </div>

      <div className="complete-profile__card">
        {isDone ? (
          <div className="complete-profile__success">
            <CheckmarkCircleRegular className="complete-profile__success-icon" />
            <p className="complete-profile__success-text">{t('completeProfile.done')}</p>
          </div>
        ) : (
          <>
            <div className="complete-profile__icon-wrap">
              <PersonRegular className="complete-profile__person-icon" />
            </div>

            <h2 className="complete-profile__heading">{t('completeProfile.title')}</h2>
            <p className="complete-profile__sub">{t('completeProfile.subtitle')}</p>

            {message && (
              <WarningMessage message={message} type={WarningMessageType.WARNING} />
            )}

            {isLoading ? (
              <Loading size="md" message={t('completeProfile.saving')} />
            ) : (
              <form
                className="complete-profile__form"
                onSubmit={(e) => { e.preventDefault(); handleSave(); }}
              >
                <TextField
                  type="text"
                  name="firstName"
                  placeholder={t('register.firstNamePlaceholder')}
                  value={firstName}
                  onChange={(e: any) => setFirstName(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <TextField
                  type="text"
                  name="lastName"
                  placeholder={t('register.lastNamePlaceholder')}
                  value={lastName}
                  onChange={(e: any) => setLastName(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="submit"
                  text={t('completeProfile.saveButton')}
                  fullWidth
                  loading={isLoading}
                />
                <button
                  type="button"
                  className="complete-profile__skip"
                  onClick={() => navigate('/', { replace: true })}
                >
                  {t('completeProfile.skipForNow')}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CompleteProfilePage;
