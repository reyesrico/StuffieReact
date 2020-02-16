import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { map } from 'lodash';

import { CategoryPageProps } from './types';

import Stuff from '../types/Stuff'; 

class CategoryPage extends Component<CategoryPageProps, any> {
  render() {
    const { location, products, match } = this.props;

    const id = match.params.id;
    const name = location.category || '';

    return (
      <div className="category-page">
        <h4>{ name }</h4>
        <ul>
          {map(products[id], (object: Stuff) => {
            return (
              <li key={object.id}><Link to={`/product/${object.id}`}>{object.name}</Link></li>
            )
          })}
        </ul>
      </div>
    );
  }
}

export default CategoryPage;
