import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { isEmpty } from 'lodash';

import Login from './Login';
import Main from './Main';
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
        this.setState({ user: res.data[0] });
      }).catch(err => {
        this.setState({ error: String(err) });
      });      
    }
  }

  render() {
    const { error, user } = this.state;

    if (!this.isActiveUser()) return <Login />;

    if (error) return <div>Error: {error} </div>

    if (isEmpty(user)) return <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={250} width={250} />;

    return <Main user={user} />  
  }
};

export default Auth;
