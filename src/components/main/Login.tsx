import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import { withRouter } from 'react-router-dom';

import FacebookUser from '../types/FacebookUser';
import TextField from '../shared/TextField';
import config from '../../services/config';
import { LoginProps } from './types';
import './Login.scss';

class Login extends Component<LoginProps, any> {
  state = {
    email: null,
    password: null,
    loginFB: false
  }

  onClick = (event: any) => {
    const { fetchUser, loginUser, setUser } = this.props;
    const { email, password } = this.state;

    event.preventDefault();

    if (email && password) {
      loginUser(email, password)
      .then((response: any) => fetchUser(response.data[0].email))
      .then((res: any) => {
        const picture = localStorage.getItem('picture');
        localStorage.setItem('username', res.data[0].email);
        alert("Login Successful using RestDBIO");
        setUser({ picture, ...res.data[0] });
      })
      .catch((err: any) => this.setState({ error: String(err) }));
    }
  }

  responseFacebook = (response: FacebookUser) => {
    const { fetchUser, setUser } = this.props;

    if (response) {
      fetchUser(response.email)
      .then((res: any) => {
        const picture = response.picture.data.url;
        localStorage.setItem('picture', picture);
        localStorage.setItem('username', res.data[0].email);
        alert("Login Successful using RestDBIO");
        setUser({ picture, ...res.data[0] });
      })
      .catch((err: any) => this.setState({ error: String(err) }));
    }
  }

  render() {
    const { loginFB } = this.state;

    return (
      <div className="login">
        <h1>Login</h1>
        <form className="login__form">
          <TextField
            type="email"
            name="email"
            onChange={(email: string) => this.setState({ email })} />
          <TextField
            type="password"
            name="password"
            onChange={(password: string) => this.setState({ password })} />
          <div className="login__submit"><input type="submit" value="Login" onClick={this.onClick} /></div>
        </form>
        <hr className="login__hr" />
          <FacebookLogin
            appId={config.fb.appId}
            autoLoad={loginFB}
            fields="name,email,picture"
            scope="public_profile,user_friends"
            onClick={(event) => event && this.setState({ loginFB: true })}
            callback={this.responseFacebook} />
      </div>
    );
  }
}

export default withRouter<any, React.ComponentClass<any>>(Login);
