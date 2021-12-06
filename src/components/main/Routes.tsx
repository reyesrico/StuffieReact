import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Auth from './Auth';
import Login from './Login';
import Register from './Register';

const Routes = () => {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Switch>
  );
}

export default Routes;
