import React, { Component } from 'react';
import { isEmpty } from 'lodash';

import Login from './Login';
import FetchData from './FetchData';
import Loading from '../shared/Loading';
import { AuthState } from './types';
import { getStuffier } from '../../services/stuffier';

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

    if (!this.isActiveUser()) return <Login />;

    if (error) return <div>Error: {error} </div>

    if (isEmpty(user)) {
      return (<Loading size="xl" message="Loading user info..." />);
    }

    return <FetchData user={user} />  
  }
};

export default Auth;
