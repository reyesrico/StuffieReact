import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import TextField from '../shared/TextField';
import { loginStuffier } from '../../services/stuffier';

import { LoginProps, LoginState } from './types';

class Login extends Component<LoginProps, LoginState> {
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

  render() {
    return (
      <div className='stuffieLogin'>
        <h1>Login</h1>
        <form>
          <TextField
            type="email"
            name="email"
            onChange={(event: any) => this.handleChange(event, 'email')} />
          <TextField
            type="password"
            name="password"
            onChange={(event: any) => this.handleChange(event, 'password')} />
          <input type="submit" value="Login" onClick={this.onClick} />
        </form>
      </div>
    );
  }
}

export default withRouter<any, React.ComponentClass<any>>(Login);
