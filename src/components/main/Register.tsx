import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import TextField from '../shared/TextField';
import User from '../types/User';
import { RegisterProps } from './types';
import { loginStuffier } from '../../services/stuffier';
import { registerStuffier } from '../../services/stuffier';

import './Register.scss';

class Register extends Component<RegisterProps, any> {
  state = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isLoading: false
  }

  enableButton() {
    const { email, password, firstName, lastName } = this.state;

    return email.length > 0 &&
      password.length > 0 &&
      firstName.length > 0 &&
      lastName.length > 0;
  }

  handleSubmit = (event: React.FormEvent<EventTarget>) => {
    const { setUser } = this.props;
    const { email, password, firstName, lastName } = this.state;
    const user: User = { email, password, first_name: firstName, last_name: lastName, admin: false };

    event.preventDefault();
    this.setState({ isLoading: true });
    registerStuffier(user)
    .then(() => loginStuffier(email, password))
    .then(res => {
      localStorage.setItem('username', res.data[0].email);
      alert("Register Successful");
      setUser({ ...res.data[0] });
    })
    .catch(error => console.log(error))
    .finally(() => this.setState({ isLoading: false }));
  }

  render() {
    const { isLoading } = this.state;

    return (
      <div className="register">
        <h1>Register</h1>
        <form className="register__form" onSubmit={event => this.handleSubmit(event)} >
          <div className="register__content">
            <div className="register__row">
              <div className="register__text">Email</div>
              <TextField
                type="text"
                name="email"
                placeholder="Email"
                disabled={isLoading}
                onChange={(email: string) => this.setState({ email })} />
            </div>
            <div className="register__row">
              <div className="register__text">Password</div>
              <TextField
                type="password"
                name="password"
                placeholder="Password"
                disabled={isLoading}
                onChange={(password: string) => this.setState({ password })} />
            </div>
            <div className="register__row">
              <div className="register__text">First Name</div>
              <TextField
                type="text"
                name="firstName"
                placeholder="First Name"
                disabled={isLoading}
                onChange={(firstName: string) => this.setState({ firstName })} />
            </div>
            <div className="register__row">
              <div className="register__text">Last Name</div>
              <TextField
                type="text"
                name="lastName"
                placeholder="Last Name"
                disabled={isLoading}
                onChange={(lastName: string) => this.setState({ lastName })} />
            </div>
          </div>
          <div className="register__button">
            <Button type="submit" text="Register" disabled={!this.enableButton() || isLoading}></Button>
            {isLoading && (<div className="register__loading"><Loading size="md" /></div>)}
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter<any, React.ComponentClass<any>>(Register);
