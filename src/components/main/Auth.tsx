import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';

import Loading from '../shared/Loading';
import Login from './Login';
import FetchData from './FetchData';
import Register from './Register';
import State from '../../redux/State';
import { fetchUser, logout } from '../../redux/user/actions';
import './Auth.scss';

class Auth extends Component<any, any> {
  state = {
    error: null,
    isLoading: true
  };

  componentDidMount() {
    const { fetchUser } = this.props;

    if(localStorage.getItem('username')) {
      fetchUser(localStorage.getItem('username'))
      .finally(() => this.setState({ isLoading: false }));
    } else {
      this.setState({ isLoading: false });
    }
  }

  render() {
    const { user } = this.props;
    const { isLoading } = this.state;
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
          <Register />
          <div className="auth__line"></div>
          <Login />
        </div>
      );
    }

    if (!isEmpty(user)) {
      return <FetchData />
    }
  }
};

const mapStateToProps = (state: State) => ({
  user: state.user
});

const mapDispatchProps = {
  fetchUser
};

export default connect(mapStateToProps, mapDispatchProps)(Auth);
