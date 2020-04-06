import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Auth from './Auth';
import Login from './Login';
import Register from './Register';

class Routes extends Component<any, any> {  
  render() {
    return (
      <Switch>
        <Route path="/" component={Auth} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }
}

export default withTranslation()<any>(Routes);
