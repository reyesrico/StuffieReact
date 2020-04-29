import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Button from '../shared/Button';
import FacebookUser from '../types/FacebookUser';
import TextField from '../shared/TextField';
import config from '../../services/config';
import { LoginProps } from './types';
import { addUserPicture, loginUser, fetchUser } from '../../redux/user/actions';

import './Login.scss';

class Login extends Component<LoginProps, any> {
  state = {
    email: null,
    password: null,
    loginFB: false
  }

  onClick = () => {
    const { fetchUser, loginUser, setMessage } = this.props;
    const { email, password } = this.state;

    if (email && password) {
      loginUser(email, password)
      .then((response: any) => fetchUser(response.data[0].email))
      .then((res: any) => {
        localStorage.setItem('username', res.data[0].email);
        setMessage("Login successful");
      })
      .catch((err: any) => setMessage("Error: Couldn't login. Try again."));
    }
  }

  responseFacebook = (response: FacebookUser) => {
    const { addUserPicture, fetchUser, setMessage } = this.props;

    if (response) {
      fetchUser(response.email)
      .then((res: any) => {
        const picture = response.picture.data.url;
        localStorage.setItem('username', res.data[0].email);
        addUserPicture(res.data[0], picture);
        setMessage("Login successful");
      })
      .catch(() => setMessage("Error: Couldn't login. Try again."));
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
            placeholder="Email"
            onChange={(email: string) => this.setState({ email })} />
          <TextField
            type="password"
            name="password"
            placeholder="Password"
            onChange={(password: string) => this.setState({ password })} />
          <Button onClick={() => this.onClick()} text="Login" />
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

const mapDispatchProps = {
  addUserPicture,
  loginUser,
  fetchUser
};

export default connect(null, mapDispatchProps)(withRouter<any, React.ComponentClass<any>>(Login));
