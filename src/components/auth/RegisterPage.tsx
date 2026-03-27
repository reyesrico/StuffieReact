import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
      setMessage('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
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
      setMessage('Registration successful! Please wait for admin approval, then login.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setMessage(err?.message || "Error: Couldn't register. Try again.");
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
        <img src={logoSrc} alt="Stuffie Logo" width="60" height="60" className="login-page__logo" />
        <h1 className="login-page__title">
          <span className="login-page__stuffie">Stuffie</span>
          <span className="login-page__slogan">Connecting Life</span>
        </h1>
      </div>

      <div className="login-page__divider" />

      {message && <WarningMessage message={message} type={getMessageType(message)} />}

      {isLoading ? (
        <div className="login-page__loading">
          <Loading size="xl" message="Registering..." />
        </div>
      ) : isSuccess ? (
        <div className="login-page__success">
          <p>Redirecting to login...</p>
        </div>
      ) : (
        <div className="login-page__content">
          <div className="login">
            <h2>Register</h2>
            <form className="login__form" onSubmit={(e) => e.preventDefault()}>
              <TextField
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={updateField('firstName')}
              />
              <TextField
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={updateField('lastName')}
              />
              <TextField
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={updateField('email')}
              />
              <TextField
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={updateField('password')}
              />
              <TextField
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onKeyPress={handleKeyPress}
                onChange={updateField('confirmPassword')}
              />
              <Button onClick={handleRegister} text="Register" />
            </form>
          </div>

          <div className="login-page__separator">
            <span>OR</span>
          </div>

          <div className="login-page__register-link">
            <p>Already have an account?</p>
            <Link to="/login" className="login-page__link">
              Login here
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;
