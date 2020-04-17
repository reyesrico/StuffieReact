import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import AddCategory from '../content/AddCategory';
import AddProduct from '../content/AddProduct';
import Admin from '../admin/Admin';
import CategoryPage from '../content/CategoryPage';
import Content from '../content/Content';
import Charts from '../apps/Charts';
import Friends from '../content/Friends';
import Products from '../content/Products';
import Product from '../content/Product';
import Support from '../apps/Support';
import Tickets from '../apps/Tickets';
import Test from '../apps/Test';
import { MainRoutesProps } from './types';

class MainRoutes extends Component<MainRoutesProps, any> {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Content} />
        <Route path="/admin" component={Admin} />
        <Route path="/friends" render={() => <Friends { ...this.props } />} />
        <Route path="/products" render={() => <Products { ...this.props } />} />
        <Route path="/product/add" component={AddProduct} />
        <Route path="/product/:id" render={props => <Product { ...props } />} />
        <Route path="/category/add" render={()=> <AddCategory type='category' />} />
        <Route path="/category/:id" render={props => <CategoryPage { ...props } { ...this.props } />} />
        <Route path="/subcategory/add" render={()=> <AddCategory type='subcategory' />} />
        <Route path="/charts" component={Charts} />
        <Route path="/support" component={Support} />
        <Route path="/tickets" component={Tickets} />
        <Route path="/test" component={Test} />        
      </Switch>
    );
  }
}

export default MainRoutes;
