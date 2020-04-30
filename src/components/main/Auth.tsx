import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';

import Loading from '../shared/Loading';
import Login from './Login';
import FetchData from './FetchData';
import Media from '../shared/Media';
import Register from './Register';
import State from '../../redux/State';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { fetchUser } from '../../redux/user/actions';
import './Auth.scss';

class Auth extends Component<any, any> {
  state = {
    isLoading: true,
    message: ''
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

  componentDidUpdate(prevProps: any, prevState: any) {
    if (prevProps.user !== this.props.user) {
      this.setState({ message: '' });
    }
  }

  getMessageType = (message: string) => {
    if (message.toLowerCase().includes('Error')) {
      return WarningMessageType.ERROR;
    } else if(message.toLowerCase().includes('successful')) {
      return WarningMessageType.SUCCESSFUL;
    }

    return WarningMessageType.WARNING;
  }

  render() {
    const { user } = this.props;
    const { isLoading, message } = this.state;
    const request = get(user, 'request');
    let msg = request ? "User already registered, wait for authorization. Don't register again." : message;

    if (isLoading) {
      return (
        <div className="auth__loading">
          <Loading size="xl" message="Loading" />
        </div>
      );
    }

    if (isEmpty(user) || request) {  
      return (
        <div className="auth">
          <div className="auth__header">
            <Media fileName="logo_2020_2" format="jpg" height="50" width="50" />
            <h1 className="auth__title">
              <span className="auth__stuffie">Stuffie</span>
              <span className="auth__slogan">Connecting Life</span>
            </h1>
          </div>
          <div className="auth__horizontal-line"></div>
          <WarningMessage message={msg} type={this.getMessageType(msg)} />
          <div className="auth__content">
            <Register setMessage={(message: string) => this.setState({ message })} />
            <div className="auth__line"></div>
            <Login setMessage={(message: string) => this.setState({ message })} />
          </div>
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
