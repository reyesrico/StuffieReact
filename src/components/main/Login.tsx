import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import { withRouter } from 'react-router-dom';

import FacebookUser from '../types/FacebookUser';
import TextField from '../shared/TextField';
import config from '../../services/config';
import { loginStuffier } from '../../services/stuffier';
import { LoginProps } from './types';
import './Login.scss';

class Login extends Component<LoginProps, any> {
  state = {
    email: null,
    password: null,
    loginFB: false
  }

  handleChange = (event: any, name: string) => {
    if (name === 'email') {
      this.setState({ email: event });
    } else if( name === 'password') {
      this.setState({ password: event });
    }
  }

  onClick = (event: any) => {
    const { history } = this.props;
    const { email, password } = this.state;

    event.preventDefault();

    loginStuffier(email, password)
      .then(res => {
        console.log(res);
        const user = res.data[0].email;
        localStorage.setItem('username', user);
        alert("Login Successful using RestDBIO");
        history.push('/');
      })
      .catch(error => {
        console.log(error);
      });
  }

  responseFacebook = (response: FacebookUser) => {
    const { history } = this.props;

    console.log(response);
    localStorage.setItem('username', response.email);
    localStorage.setItem('picture', response.picture.data.url);
    history.push('/');
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
            onChange={(event: any) => this.handleChange(event, 'email')} />
          <TextField
            type="password"
            name="password"
            onChange={(event: any) => this.handleChange(event, 'password')} />
          <div className="login__submit"><input type="submit" value="Login" onClick={this.onClick} /></div>
          <hr className="login__hr" />
          <FacebookLogin
            appId={config.fb.appId}
            autoLoad={loginFB}
            fields="name,email,picture"
            scope="public_profile,user_friends"
            onClick={(event) => event && this.setState({ loginFB: true })}
            callback={this.responseFacebook} />          
        </form>
      </div>
    );
  }
}

export default withRouter<any, React.ComponentClass<any>>(Login);
