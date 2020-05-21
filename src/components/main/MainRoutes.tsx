import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import AddCategory from '../content/AddCategory';
import AddProduct from '../content/AddProduct';
import Admin from '../admin/Admin';
import Buy from '../apps/Buy';
import CategoryPage from '../content/CategoryPage';
import Content from '../content/Content';
import Charts from '../apps/Charts';
import Exchange from '../apps/Exchange';
import Friends from '../content/Friends';
import Loan from '../apps/Loan';
import Products from '../content/Products';
import Product from '../content/Product';
import Support from '../apps/Support';
import Tickets from '../apps/Tickets';
import Test from '../apps/Test';
import Covid from '../apps/Covid';

import { MainRoutesProps } from './types';

class MainRoutes extends Component<MainRoutesProps, any> {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Content} />
        <Route exact path="/StuffieReact" component={Content} />
        <Route path="/admin" component={Admin} />
        <Route path="/friends" component={Friends} />
        <Route path="/products" component={Products} />
        <Route path="/product/add" component={AddProduct} />
        <Route path="/product/:id" render={props => <Product { ...props } />} />
        <Route path="/category/add" render={()=> <AddCategory type='category' />} />
        <Route path="/category/:id" render={props => <CategoryPage { ...props } { ...this.props } />} />
        <Route path="/subcategory/add" render={()=> <AddCategory type='subcategory' />} />
        <Route path="/subcategory/:id" render={props => <CategoryPage { ...props } { ...this.props } />} />
        <Route path="/exchange" render={props => <Exchange { ...props } {...this.props } />} />
        <Route path="/loan" render={props => <Loan { ...props } {...this.props } />} />
        <Route path="/buy" render={props => <Buy { ...props } {...this.props } />} />
        <Route path="/charts" component={Charts} />
        <Route path="/support" component={Support} />
        <Route path="/tickets" component={Tickets} />
        <Route path="/test" component={Test} />
        <Route path="/covid" component={Covid} />
      </Switch>
    );
  }
}

export default MainRoutes;
