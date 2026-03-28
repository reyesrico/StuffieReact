import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import TextField from '../shared/TextField';
import Loading from '../shared/Loading';
import WarningMessage from '../shared/WarningMessage';
import ThemeContext from '../../context/ThemeContext';
import { WarningMessageType } from '../shared/types';
import { registerUser } from '../../api/users.api';

import './RegisterPage.scss';

/**
 * Standalone Register Page
 * 
 * Features:
 * - Self-contained registration
 * - Navigates to login after successful registration
 * - User must wait for admin approval before login works
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = (field: string) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      setMessage(t('register.fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setMessage(t('register.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      setMessage(t('register.passwordTooShort'));
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      await registerUser({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      
      setIsSuccess(true);
      setMessage(t('register.successMessage'));
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setMessage(err?.message || t('register.registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  const getMessageType = (msg: string): WarningMessageType => {
    if (isSuccess) return WarningMessageType.SUCCESSFUL;
    if (msg.toLowerCase().includes('error')) return WarningMessageType.ERROR;
    return WarningMessageType.WARNING;
  };

  const logoSrc = theme === "light" 
    ? `${import.meta.env.BASE_URL}images/stuffie-logo-light.svg` 
    : `${import.meta.env.BASE_URL}images/stuffie-logo-dark.svg`;

  return (
    <div className="login-page">
      <div className="login-page__header">
        <img src={logoSrc} alt={t('common.logoAlt')} width="60" height="60" className="login-page__logo" />
        <h1 className="login-page__title">
          <span className="login-page__stuffie">Stuffie</span>
          <span className="login-page__slogan">{t('common.slogan')}</span>
        </h1>
      </div>

      <div className="login-page__divider" />

      {message && <WarningMessage message={message} type={getMessageType(message)} />}

      {isLoading ? (
        <div className="login-page__loading">
          <Loading size="xl" message={t('register.registering')} />
        </div>
      ) : isSuccess ? (
        <div className="login-page__success">
          <p>{t('register.redirecting')}</p>
        </div>
      ) : (
        <div className="login-page__content">
          <div className="login">
            <h2>{t('register.title')}</h2>
            <form className="login__form" onSubmit={(e) => e.preventDefault()}>
              <TextField
                type="text"
                name="firstName"
                placeholder={t('register.firstNamePlaceholder')}
                value={formData.firstName}
                onChange={updateField('firstName')}
              />
              <TextField
                type="text"
                name="lastName"
                placeholder={t('register.lastNamePlaceholder')}
                value={formData.lastName}
                onChange={updateField('lastName')}
              />
              <TextField
                type="email"
                name="email"
                placeholder={t('register.emailPlaceholder')}
                value={formData.email}
                onChange={updateField('email')}
              />
              <TextField
                type="password"
                name="password"
                placeholder={t('register.passwordPlaceholder')}
                value={formData.password}
                onChange={updateField('password')}
              />
              <TextField
                type="password"
                name="confirmPassword"
                placeholder={t('register.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onKeyPress={handleKeyPress}
                onChange={updateField('confirmPassword')}
              />
              <Button onClick={handleRegister} text={t('register.button')} />
            </form>
          </div>

          <div className="login-page__separator">
            <span>{t('common.or')}</span>
          </div>

          <div className="login-page__register-link">
            <p>{t('register.hasAccount')}</p>
            <Link to="/login" className="login-page__link">
              {t('register.loginLink')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;
