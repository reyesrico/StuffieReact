import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import TextField from '../shared/TextField';
import { loginStuffier } from '../services/stuffier';

class Login extends Component {
  state = {
    email: '',
    password: ''
  };

  handleChange = event => {
    const target = event.target;
    this.setState({ [target.name]: target.value });
  }

  onClick = event => {
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
            hintText="Enter your Email"
            onChange={this.handleChange} />
          <TextField
            type="password"
            name="password"
            value={this.state.password}
            hintText="Enter your Password"
            onChange={event => this.handleChange(event)} />
          <input type="submit" value="Login" onClick={this.onClick} />
        </form>
      </div>
    );
  }
}

export default withRouter(Login);
