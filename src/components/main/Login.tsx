import React, { useContext, useState } from 'react';
import FacebookLogin from 'react-facebook-login';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../shared/Button';
import FacebookUser from '../types/FacebookUser';
import State from '../../redux/State';
import TextField from '../shared/TextField';
import UserContext from '../../context/UserContext';
import config from '../../services/config';
import { addUserFBPicture, fetchUser, fetchUserHookWithMessage, loginUserHook } from '../../redux/user/actions';

import './Login.scss';

const Login = ({ setMessage, setIsLoading }: any) => {
  const { loginUser } = useContext(UserContext);

  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ loginFB, setLoginFB ] = useState(false);
  const user = useSelector((state: State) => state.user);
  const dispatch = useDispatch();

  const onClick = (email: string, password: string) => {
    if (email && password) {
      loginUserHook(email, password)
        .then((response: any) => {
          // console.log({ data: response.data });
          loginUser(response.data[0]);
          fetchUserHookWithMessage(response.data[0].email, setIsLoading, setMessage, dispatch);
          localStorage.setItem('username', response.data[0].email);
        })
        .catch((err: any) => {
          console.log({ err });
          setMessage(err && err["message"] || "Error: Couldn't login. Try again.");
        })
    }
  }

  const handleKeypress = (e: any) => {
    if (email && password && e.key === 'Enter') {
      onClick(email, password);
    }
  }

  const responseFacebook = (response: FacebookUser) => {
    if (response) {
      try {
        dispatch(fetchUser(response.email));
        const picture = response.picture.data.url;
        localStorage.setItem('username', (user.email || ''));
        dispatch(addUserFBPicture(user, picture));
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
        <Button onClick={() => onClick(email, password)} text="Login" />
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
