import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import TextField from '../shared/TextField';
import { loginStuffier } from '../services/stuffier';

class Login extends Component {
  state = {
    email: '',
    password: ''
  };

  componentDidUpdate() {
    if (!!localStorage.getItem('username'))
      return <Redirect to="/" />;
  }

  handleChange = event => {
    const target = event.target;
    this.setState({ [target.name]: target.value });
  }

  handleSubmitRestdbIO = event => {
    const { email, password } = this.state;
    event.preventDefault();

    loginStuffier(email, password)
      .then(res => {
        localStorage.setItem('username', email);
        alert("Login Successful using RestDBIO");
        this.props.history.push('/');
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
            hintText="Enter your Email"
            onChange={this.handleChange} />
          <TextField
            type="password"
            name="password"
            value={this.state.password}
            hintText="Enter your Password"
            onChange={event => this.handleChange(event)} />
          <input type="submit" value="Login" onClick={event => this.handleSubmitRestdbIO(event)} />
        </form>
      </div>
    );
  }
}

export default Login
