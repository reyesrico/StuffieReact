import React, { Component } from 'react';
import { isEmpty } from 'lodash';

import Login from './Login';
import FetchData from './FetchData';
import Loading from '../shared/Loading';
import Register from './Register';
import { getStuffier } from '../../services/stuffier';
import './Auth.scss';

class Auth extends Component<any, any> {
  state = {
    error: null,
    user: {}
  };

  componentDidMount() {
    this.getUser();
  }

  componentDidUpdate() {
    this.getUser();
  }

  isActiveUser = () => {
    return localStorage && 
    localStorage.getItem('username') &&
    localStorage.getItem('username') !== '';
  }

  getUser = () => {
    const { user } = this.state;

    if (isEmpty(user) && this.isActiveUser() ) {
      getStuffier(localStorage.getItem('username')).then(res => {
        const picture = localStorage.getItem('picture');
        this.setState({ user: { picture, ...res.data[0] } });
      }).catch(err => {
        this.setState({ error: String(err) });
      });      
    }
  }

  render() {
    const { error, user } = this.state;

    if (error) return <div>Error: {error} </div>

    if (!this.isActiveUser()) {
      return (
        <div className="auth">
          <Register />
          <div className="auth__line"></div>
          <Login />
        </div>
      );
    }

    if (isEmpty(user)) {
      return (
      <div className="auth__loading">
        <Loading size="xl" message="Loading user info..." />
      </div>);
    }

    return <FetchData user={user} />  
  }
};

export default Auth;
