import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { get, isEmpty } from 'lodash';

import Loading from '../shared/Loading';
import Login from './Login';
import FetchData from './FetchData';
import Main from './Main';
import Media from '../shared/Media';
import Register from './Register';
import State from '../../redux/State';
import UserContext from '../../context/UserContext';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { useUserInfoWithCache } from '../../hooks/useDataWithCache';
import './Auth.scss';

const getMessageType = (message: string) => {
  if (message.toLowerCase().includes('Error')) {
    return WarningMessageType.ERROR;
  } else if (message.toLowerCase().includes('successful')) {
    return WarningMessageType.SUCCESSFUL;
  }

  return WarningMessageType.WARNING;
}


const Auth = () => {
  const { user, loginUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const products: any = useSelector((state: State) => state.products);

  // Get username from localStorage to check if user should auto-login
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedUserName = localStorage.getItem('username');
    setUserName(storedUserName);
  }, []);

  // Use cached user hook only if username exists (auto-login scenario)
  const { data: cachedUser, isLoading: isFetchingUser } = useUserInfoWithCache(userName || '');

  // Update UserContext when cached user is loaded
  useEffect(() => {
    if (cachedUser && !user) {
      loginUser(cachedUser);
    }
  }, [cachedUser, user, loginUser]);

  // Show loading state during initial user fetch
  useEffect(() => {
    if (userName && isFetchingUser) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [userName, isFetchingUser]);

  const request = get(user, 'request');
  let msg = request ? "User already registered, wait for authorization. Don't register again." : message;

  const renderPage = () => {
    if (isLoading) {
      return (<div className="auth__loading"><Loading size="xl" message="Loading" /></div>);
    } else {
      return (
        <div className="auth__content">
          <Register
            setMessage={(message: string) => setMessage(message)}
            setIsLoading={(isLoading: boolean) => setIsLoading(isLoading)} />
          <div className="auth__line"></div>
          <Login
            setMessage={(message: string) => setMessage(message)}
            setIsLoading={(isLoading: boolean) => setIsLoading(isLoading)} />
        </div>
      );
    }
  }

  if (isEmpty(user) || request) {
    return (
      <div className="auth">
        <div className="auth__header">
          <Media fileName="logo_2020_2" format="jpg" height="50" width="50" />
          <h1 className="auth__title">
            <span className="auth__stuffie">Stuffie</span>
            <span className="auth__slogan">Connecting Life</span>
          </h1>
        </div>
        <div className="auth__horizontal-line"></div>
        <WarningMessage message={msg} type={getMessageType(msg)} />
        {isLoading && (<div className="auth__loading"><Loading size="xl" message="Loading" /></div>)}
        {!userName && renderPage()}
      </div>
    );
  }

  if (user && products && products.length) {
    return (<Main />);
  } else {
    return <FetchData />
  }

  // return (<Chat />);
};

export default Auth;
