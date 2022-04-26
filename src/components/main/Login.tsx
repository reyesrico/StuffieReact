import React, { useState } from 'react';
import FacebookLogin from 'react-facebook-login';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../shared/Button';
import FacebookUser from '../types/FacebookUser';
import TextField from '../shared/TextField';
import config from '../../services/config';
import { addUserPicture, fetchUser, fetchUserHookWithMessage, loginUserHook } from '../../redux/user/actions';

import './Login.scss';
import State from '../../redux/State';

const Login = ({ setMessage, setIsLoading }: any) => {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ loginFB, setLoginFB ] = useState(false);
  const user = useSelector((state: State) => state.user);
  const dispatch = useDispatch();

  const onClick = (e: any) => {
    if (email && password) {
      loginUserHook(email, password)
        .then((response: any) => {
          fetchUserHookWithMessage(response.data[0].email, setIsLoading, setMessage, dispatch);
          localStorage.setItem('username', response.data[0].email);
        })
        .catch(() => setMessage("Error: Couldn't login. Try again."))
    }
  }

  const handleKeypress = (e: any) => {
    if (email && password && e.key === 'Enter') {
      onClick(e);
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

  // if (isLoading) return <Loading size="md" />

  return (
    <div className="login">
      <h1>Login</h1>
      <form className="login__form">
        <TextField
          type="email"
          name="email"
          placeholder="Email"
          onChange={(e: any) => setEmail(e.target.value)} />
        <TextField
          type="password"
          name="password"
          placeholder="Password"
          onKeyPress={handleKeypress}
          onChange={(e: any) => setPassword(e.target.value)} />
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
