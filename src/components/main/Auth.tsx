import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';

import Loading from '../shared/Loading';
import Login from './Login';
import FetchData from './FetchData';
import Register from './Register';
import User from '../types/User';
import { loginUser, fetchUser, logout } from '../../redux/user/actions';
import './Auth.scss';

class Auth extends Component<any, any> {
  state = {
    error: null,
    isLoading: true,
    user: {}
  };

  componentDidMount() {
    const { fetchUser } = this.props;

    if(localStorage.getItem('username')) {
      fetchUser(localStorage.getItem('username'))
      .then((res: any) => this.setState({ user: res.data[0] }))
      .finally(() => this.setState({ isLoading: false }));
    } else {
      this.setState({ isLoading: false });
    }
  }

  setUser = (user: User) => {
    this.setState({ user });
  }

  render() {
    const { loginUser, fetchUser } = this.props;
    const { isLoading, user } = this.state;
    const request = get(user, 'request');

    if (isLoading) {
      return (
        <div className="auth__loading">
          <Loading size="xl" message="Loading" />
        </div>
      );
    }

    if (isEmpty(user) || request) {
      if (request) {
        alert("User registered, wait for authorization. Don't register again");
        logout();
      }
  
      return (
        <div className="auth">
          <Register setUser={this.setUser} />
          <div className="auth__line"></div>
          <Login loginUser={loginUser} fetchUser={fetchUser} setUser={this.setUser}/>
        </div>
      );
    }

    if (!isEmpty(user)) {
      return <FetchData user={user} setUser={this.setUser}/>
    }
  }
};

const mapDispatchProps = {
  loginUser,
  fetchUser,
};

export default connect(null, mapDispatchProps)(Auth);
