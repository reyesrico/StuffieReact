import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './Menu.scss';

class Menu extends Component {
  renderCategories = () => {
    const { categories, products } = this.props;

    if (!categories) return;

    return categories
            .filter(category => products[category.id] && products[category.id].length)
            .map(category => (<div className="menu__category" key={category.id}>{category.name}</div>));
  }

  render() {
    return (
      <div className='barBlock barMenu'>
        <div className='menu__title'>Menu</div>
        <hr />
        <div className="menu__list">
          { this.renderCategories() }
        </div>
        <hr />
        <Link to={`/category/add`}>+ Add Category</Link>
        <hr />
        <Link to={`/subcategory/add`}>+ Add SubCategory</Link>
        <hr />

        <div className='searchBarGroup'>
          {/* <SearchBar categories={categories} /> */}
        </div>
      </div>
    );
  }
};

export default Menu;
