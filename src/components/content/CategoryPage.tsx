import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { map } from 'lodash';

import State from '../../redux/State';
import { CategoryPageProps } from './types';

import Stuff from '../types/Stuff'; 

/* Category ID never will have 5 digits
   Subcategory ID will have 5 digits or more.
*/
class CategoryPage extends Component<CategoryPageProps, any> {
  render() {
    const { subcategories, location, products, match } = this.props;

    let id: string = match.params.id;
    let name = location.category || location.subcategory || '';
    let categoryId = id.length >= 5 ? parseInt(id[0]) : parseInt(id);

    // Subcategory Prep
    if (id.length >= 5) {
      categoryId = parseInt(id[0]);
      name = subcategories.find(s => s.id === parseInt(id))?.name;  
    }

    const stuff = products[categoryId]; 

    return (
      <div className="category-page">
        <h3>{ name }</h3>
        <hr />
        {!stuff.length && <div>No products</div>}
        <ul>
          {map(stuff, (object: Stuff) => {
            return (
              <li key={object.id}><Link to={`/product/${object.id}`}>{object.name}</Link></li>
            )
          })}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  products: state.products,
  categories: state.categories,
  subcategories: state.subcategories
});

export default connect(mapStateToProps, {})(CategoryPage);
