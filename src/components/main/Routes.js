import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Auth from './Auth';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';

class Routes extends Component {
  render() {
    return (
      <Switch>
        <Route path="/" component={Auth} />
        <Route path="/login" component={Login} />
        <Route path="/logout" component={Logout} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }
}

export default Routes;
