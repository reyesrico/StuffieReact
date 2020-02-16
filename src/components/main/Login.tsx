import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import TextField from '../shared/TextField';
import { loginStuffier } from '../../services/stuffier';

import { LoginProps } from './types';

class Login extends Component<LoginProps, any> {
  state = {
    email: '',
    password: ''
  };

  handleChange = (event: any, name: string) => {
    this.setState({ [name]: event });
  }

  onClick = (event: any) => {
    const { history } = this.props;
    const { email, password } = this.state;

    event.preventDefault();

    loginStuffier(email, password)
      .then(res => {
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
            value={this.state.email}
            onChange={(event: any) => this.handleChange(event, 'email')} />
          <TextField
            type="password"
            name="password"
            value={this.state.password}
            onChange={(event: any) => this.handleChange(event, 'password')} />
          <input type="submit" value="Login" onClick={this.onClick} />
        </form>
      </div>
    );
  }
}

export default withRouter<any, React.ComponentClass<any>>(Login);
