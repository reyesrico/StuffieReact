import React, { useState } from 'react';
import FacebookLogin from 'react-facebook-login';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../shared/Button';
import FacebookUser from '../types/FacebookUser';
import TextField from '../shared/TextField';
import config from '../../services/config';
import { LoginProps } from './types';
import { addUserPicture, fetchUser, loginUserHook } from '../../redux/user/actions';

import './Login.scss';
import State from '../../redux/State';

const Login = ({ setMessage }: LoginProps) => {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ loginFB, setLoginFB ] = useState(false);
  const user = useSelector((state: State) => state.user);
  const dispatch = useDispatch();

  const onClick = (e: any) => {
    if (email && password) {
      loginUserHook(email, password)
        .then((response: any) => {
          dispatch(fetchUser(response.data[0].email));
          localStorage.setItem('username', response.data[0].email);
          setMessage("Login successful");
        })
        .catch(() => setMessage("Error: Couldn't login. Try again."));
    }
  }

  const responseFacebook = (response: FacebookUser) => {
    if (response) {
      try {
        dispatch(fetchUser(response.email));
        const picture = response.picture.data.url;
        localStorage.setItem('username', (user.email || ''));
        dispatch(addUserPicture(user, picture));
        setMessage("Login successful");
      } catch(_) {
        setMessage("Error: Couldn't login. Try again.");
      }
    }
  }

  return (
    <div className="login">
      <h1>Login</h1>
      <form className="login__form">
        <TextField
          type="email"
          name="email"
          placeholder="Email"
          onChange={(email: string) => setEmail(email)} />
        <TextField
          type="password"
          name="password"
          placeholder="Password"
          onChange={(password: string) => setPassword(password)} />
        <Button onClick={onClick} text="Login" />
      </form>
      <hr className="login__hr" />
      <FacebookLogin
        appId={config.fb.appId}
        autoLoad={loginFB}
        fields="name,email,picture"
        scope="public_profile,user_friends"
        onClick={(event) => event && setLoginFB(true)}
        callback={responseFacebook} />
    </div>
  );
}

export default Login;
