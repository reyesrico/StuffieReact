import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

class Logout extends Component {
  state = {
    email: '',
    password: ''
  };

  render() {
    localStorage.setItem('username', '');
    alert("Logging out");

    return (<Redirect to='/login' />);
  }
}

export default Logout;
