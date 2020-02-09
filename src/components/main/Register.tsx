import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { registerStuffier } from '../../services/stuffier';

import TextField from '../shared/TextField';

class Register extends Component {
  state = {
    user: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    },
    redirectToNewPage: false
  }

  validateForm() {
    const { user } = this.state;

    return user.email.length > 0 &&
      user.password.length > 0 &&
      user.first_name.length > 0 &&
      user.last_name.length > 0;
  }

  handleChange = (event: React.FormEvent<EventTarget>) => {    
    const target = event.target as HTMLTextAreaElement;
    const name = target.name;
    const value = target.value;
    this.setState({
      user: {
        ...this.state.user,
        [name]: value
      }
    });
  }

  handleSubmit = (event: React.FormEvent<EventTarget>) => {
    const { user } = this.state;
    event.preventDefault();
    registerStuffier(user);
    alert("User Registered!");
    
    // registerStuffier(user)
    //   .then(res => {
    //     alert("User Registered!");
    //     res.data[0] && this.setState({ redirectToNewPage: true });
    //   })
    //   .catch(err => {
    //     console.error(err);
    //   });
  }

  render() {
    const { redirectToNewPage, user } = this.state;
    if (redirectToNewPage) {
      return (<Redirect to='/' />);
    }
    return (
      <div className='stuffieRegister'>
        <h1>Register</h1>
        <form onSubmit={this.handleSubmit}>
          <div className='registerMail'>
            <TextField
              type="text"
              name="email"
              value={user.email}
              // hintText="Email"
              onChange={this.handleChange} />
          </div>
          <div className='registerPass'>
            <TextField
              type="password"
              name="password"
              value={user.password}
              // hintText="New Password"
              onChange={this.handleChange} />
          </div>
          <div className='registerFirstName'>
            <TextField
              type="text"
              name="first_name"
              value={user.first_name}
              // hintText="First Name"
              onChange={this.handleChange} />
          </div>
          <div className='registerLastName'>
            <TextField
              type="text"
              name="last_name"
              value={user.last_name}
              // hintText="Last Name"
              onChange={this.handleChange} />
          </div>
          <input type="submit" value="Register" />
        </form>
      </div>
    );
  }
}

export default Register;
