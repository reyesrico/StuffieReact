import React, { useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import Button from '../shared/Button';
import TextField from '../shared/TextField';
import Loading from '../shared/Loading';
import WarningMessage from '../shared/WarningMessage';
import UserContext from '../../context/UserContext';
import ThemeContext from '../../context/ThemeContext';
import { WarningMessageType } from '../shared/types';
import { useLogin } from '../../hooks/queries';

import './LoginPage.scss';

/**
 * Standalone Login Page
 * 
 * Features:
 * - Self-contained (no props required)
 * - Navigates to original destination after login
 * - Stores username in localStorage for auto-login
 * - Modern error handling with WarningMessage
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const loginMutation = useLogin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get the page they were trying to visit
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setMessage('');

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (userData) => {
          if (!userData || !userData.email) {
            setMessage('Invalid credentials. Please try again.');
            setIsLoading(false);
            return;
          }

          // Store in localStorage for auto-login on return visits
          localStorage.setItem('username', userData.email);
          
          // Update UserContext
          loginUser(userData);
          
          // Navigate to the page they were trying to visit, or home
          navigate(from, { replace: true });
        },
        onError: (err: any) => {
          setMessage(err?.message || "Error: Couldn't login. Try again.");
          setIsLoading(false);
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password) {
      handleLogin();
    }
  };

  const getMessageType = (msg: string): WarningMessageType => {
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
          <Loading size="xl" message="Logging in..." />
        </div>
      ) : (
        <div className="login-page__content">
          <div className="login">
            <h2>Login</h2>
            <form className="login__form" onSubmit={(e) => e.preventDefault()}>
              <TextField
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
              />
              <TextField
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onKeyPress={handleKeyPress}
                onChange={(e: any) => setPassword(e.target.value)}
              />
              <Button onClick={handleLogin} text="Login" />
            </form>
          </div>

          <div className="login-page__separator">
            <span>OR</span>
          </div>

          <div className="login-page__register-link">
            <p>Don't have an account?</p>
            <Link to="/register" className="login-page__link">
              Register here
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
