import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import TextField from '../shared/TextField';
import User from '../types/User';
import { RegisterProps } from './types';
import { registerUserHook } from '../../redux/user/actions';

import './Register.scss';

const Register = ({ setMessage }: RegisterProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const enableButton = () => {
    return email.length > 0 &&
      password.length > 0 &&
      firstName.length > 0 &&
      lastName.length > 0;
  }

  const handleSubmit = (event: React.FormEvent<EventTarget>) => {
    const user: User = { email, password, first_name: firstName, last_name: lastName, admin: false };
    event.preventDefault();
    dispatch(registerUserHook(user, setIsLoading, setMessage));
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
              disabled={isLoading}
              onChange={(email: string) => setEmail(email)} />
          </div>
          <div className="register__row">
            <div className="register__text">Password</div>
            <TextField
              type="password"
              name="password"
              placeholder="Password"
              disabled={isLoading}
              onChange={(password: string) => setPassword(password)} />
          </div>
          <div className="register__row">
            <div className="register__text">First Name</div>
            <TextField
              type="text"
              name="firstName"
              placeholder="First Name"
              disabled={isLoading}
              onChange={(firstName: string) => setFirstName(firstName)} />
          </div>
          <div className="register__row">
            <div className="register__text">Last Name</div>
            <TextField
              type="text"
              name="lastName"
              placeholder="Last Name"
              disabled={isLoading}
              onChange={(lastName: string) => setLastName(lastName)} />
          </div>
        </div>
        <div className="register__button">
          <Button type="submit" text="Register" disabled={!enableButton() || isLoading}></Button>
          {isLoading && (<div className="register__loading"><Loading size="md" /></div>)}
        </div>
      </form>
    </div>
  );
}

export default Register;
