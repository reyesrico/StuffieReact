import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Button from '../shared/Button';
import TextField from '../shared/TextField';
import User from '../types/User';
import { registerUserHook } from '../../redux/user/actions';

import './Register.scss';

const Register = ({ setMessage, setIsLoading }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const dispatch = useDispatch();

  const enableButton = () => {
    return email.length > 0 &&
      password.length > 0 &&
      firstName.length > 0 &&
      lastName.length > 0;
  }

  const handleKeypress = (e: any) => {
    if (enableButton() && e.key === 'Enter') {
      handleSubmit(e);
    }
  }

  const handleSubmit = (event: any) => {
    const user: User = { email, password, first_name: firstName, last_name: lastName, admin: false };
    event.preventDefault();
    dispatch(registerUserHook(user, setIsLoading, setMessage));
    setIsLoading(true);
  }

  return (
    <div className="register">
      <h1>Register</h1>
      <form className="register__form" onSubmit={handleSubmit} >
        <div className="register__content">
          <div className="register__row">
            <div className="register__text">Email</div>
            <TextField
              type="text"
              name="email"
              placeholder="Email"
              onChange={(e: any) => setEmail(e.target.value)} />
          </div>
          <div className="register__row">
            <div className="register__text">Password</div>
            <TextField
              type="password"
              name="password"
              placeholder="Password"
              onChange={(e: any) => setPassword(e.target.value)} />
          </div>
          <div className="register__row">
            <div className="register__text">First Name</div>
            <TextField
              type="text"
              name="firstName"
              placeholder="First Name"
              onChange={(e: any) => setFirstName(e.target.value)} />
          </div>
          <div className="register__row">
            <div className="register__text">Last Name</div>
            <TextField
              type="text"
              name="lastName"
              placeholder="Last Name"
              onKeyPress={handleKeypress}
              onChange={(e: any) => setLastName(e.target.value)} />
          </div>
        </div>
        <div className="register__button">
          <Button type="submit" text="Register" disabled={!enableButton()}></Button>
        </div>
      </form>
    </div>
  );
}

export default Register;
