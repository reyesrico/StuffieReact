import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import AddProduct from '../sections/AddProduct';
import Content from '../sections/Content';
import Charts from '../apps/Charts';
import Chat from '../apps/Chat';
import Friends from '../sections/Friends';
import Products from '../sections/Products';
import Product from '../sections/Product';
import Tickets from '../apps/Tickets';

class MainRoutes extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" render={() => <Content {...this.props } />} />
        <Route path="/friends" render={() => <Friends {...this.props } />} />
        <Route path="/products" render={() => <Products {...this.props } />} />
        <Route path="/product/add" render={props => <AddProduct { ...props } />} />
        <Route path="/product/:id" render={props => <Product { ...props } />} />
        <Route path="/charts" component={Charts} />
        <Route path="/chat" component={Chat} />
        <Route path="/tickets" component={Tickets} />
      </Switch>
    );
  }
}

export default MainRoutes;
