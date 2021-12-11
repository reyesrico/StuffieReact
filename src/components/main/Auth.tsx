import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get, isEmpty } from 'lodash';

import Loading from '../shared/Loading';
import Login from './Login';
import FetchData from './FetchData';
import Media from '../shared/Media';
import Register from './Register';
import State from '../../redux/State';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { fetchUserHook } from '../../redux/user/actions';
import './Auth.scss';
import Main from './Main';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const user = useSelector((state: State) => state.user);
  const products:any = useSelector((state: State) => state.products);
  const dispatch = useDispatch();
  const stableDispatch = useCallback(dispatch, []) // assuming that it doesn't need to change

  useEffect(() => {
    let username = localStorage.getItem('username');
    if (username) {
      stableDispatch(fetchUserHook(username, setIsLoading));
    } else {
      setIsLoading(false);
    }
  }, [stableDispatch]);

  useEffect(() => {
    setMessage('');
  }, [user])

  const getMessageType = (message: string) => {
    if (message.toLowerCase().includes('Error')) {
      return WarningMessageType.ERROR;
    } else if (message.toLowerCase().includes('successful')) {
      return WarningMessageType.SUCCESSFUL;
    }

    return WarningMessageType.WARNING;
  }

  const request = get(user, 'request');
  let msg = request ? "User already registered, wait for authorization. Don't register again." : message;

  if (isLoading) {
    return (
      <div className="auth__loading">
        <Loading size="xl" message="Loading" />
      </div>
    );
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
        <div className="auth__content">
          <Register setMessage={(message: string) => setMessage(message)} />
          <div className="auth__line"></div>
          <Login setMessage={(message: string) => setMessage(message)} />
        </div>
      </div>
    );
  }

  if (user && products && products.length) {
    return (<Main />);
  } else {
    return <FetchData />
  }
};

export default Auth;
