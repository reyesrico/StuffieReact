import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { map } from 'lodash';

import { ProductsProps } from './types';
import './Products.scss';
import Stuff from '../types/Stuff';

class Products extends Component<ProductsProps, any> {
  generateReport = (event: any) => {
    // event.preventDefault();
    alert("finished");
  }

  render() {
    const { categories, products, user } = this.props;

    if (!products) {
      return <div>No Stuff! Add Products!</div>
    }

    return (
      <div>
        <div className="products__title">
          <h3>{user.first_name} Stuff</h3>
          <div className="products__add-product">
            <Link to={`/product/add`}>Add Product</Link>
          </div>
        </div>
        <hr />
        {
          categories.map(category => {
            if (!products[category.id] || !products[category.id].length) return (<div key={category.id}></div>);

            return (
              <div key={category.id}>
                <h4>{category.name}</h4>
                <ul>
                  {map(products[category.id], (object: Stuff) => {
                    return (
                      <li key={object.id}><Link to={`/product/${object.id}`}>{object.name}</Link></li>
                    )
                  })}
                </ul>
              </div>
            )
          })
        }
        <hr />
        <button onClick={event => this.generateReport(event)}>Generate Report</button>
      </div>
    );
  }
};

export default Products;
