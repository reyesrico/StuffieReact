import React, { useContext, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import Button from '../shared/Button';
import TextField from '../shared/TextField';
import Loading from '../shared/Loading';
import WarningMessage from '../shared/WarningMessage';
import SocialAuthButtons from './SocialAuthButtons';
import ThemeContext from '../../context/ThemeContext';
import { WarningMessageType } from '../shared/types';
import { registerUser } from '../../api/users.api';
import config from '../../config/api';
import type User from '../types/User';

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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const uploadToCloudinary = async (userId: number) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'stuffiers');
    formData.append('public_id', String(userId));
    formData.append('upload_preset', config.cloudinary.uploadPreset);
    await axios.post(
      `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`,
      formData,
      { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
    );
  };

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
      const user = await registerUser({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      // Upload profile photo to Cloudinary if one was selected
      if (file && user?.id) {
        try {
          await uploadToCloudinary(user.id);
        } catch {
          // Photo upload failure is non-fatal — registration already succeeded
        }
      }
      
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
              {/* Avatar upload */}
              <div className="register__avatar">
                <div
                  className="register__avatar-circle"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label={t('register.photoLabel')}
                >
                  {preview
                    ? <img src={preview} alt="preview" className="register__avatar-img" />
                    : <span className="register__avatar-placeholder">&#128100;</span>
                  }
                </div>
                <label className="register__avatar-label" htmlFor="register-photo">
                  {preview ? t('register.changePhoto') : t('register.addPhoto')}
                </label>
                <input
                  id="register-photo"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="register__avatar-input"
                  onChange={handleFileChange}
                />
              </div>
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

          <SocialAuthButtons
            onSuccess={(userData: User) => {
              if (!userData.first_name || !userData.last_name) {
                navigate('/complete-profile', { replace: true });
              } else {
                navigate('/', { replace: true });
              }
            }}
            onError={(msg) => setMessage(msg)}
          />
        </div>
      )}
    </div>
  );
}

export default RegisterPage;
