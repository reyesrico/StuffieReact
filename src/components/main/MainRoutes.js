import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import AddCategory from '../sections/AddCategory';
import AddProduct from '../sections/AddProduct';
import Content from '../sections/Content';
import Charts from '../apps/Charts';
import Support from '../apps/Support';
import Friends from '../sections/Friends';
import Products from '../sections/Products';
import Product from '../sections/Product';
import Tickets from '../apps/Tickets';
import Test from '../apps/Test';

class MainRoutes extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" render={() => <Content { ...this.props } />} />
        <Route path="/friends" render={() => <Friends { ...this.props } />} />
        <Route path="/products" render={() => <Products { ...this.props } />} />
        <Route path="/product/add" render={()=> <AddProduct { ...this.props } />} />
        <Route path="/product/:id" render={props => <Product { ...props } />} />
        <Route path="/category/add" render={()=> <AddCategory type='category' { ...this.props } />} />
        <Route path="/subcategory/add" render={()=> <AddCategory type='subcategory' { ...this.props } />} />
        <Route path="/charts" component={Charts} />
        <Route path="/support" component={Support} />
        <Route path="/tickets" component={Tickets} />
        <Route path="/test" component={Test} />        
      </Switch>
    );
  }
}

export default MainRoutes;
