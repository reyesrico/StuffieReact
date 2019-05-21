import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './Menu.scss';

class Menu extends Component {
  render() {
    const { categories, products } = this.props;

    return (
      <div className='barBlock barMenu'>
        <div className='menu__title'>Menu</div>
        <hr />
        <div className="menu__list">
          { categories && categories.map(category => {
              if (products[category.id] && products[category.id].length) {
                return (<div className="menu__category" key={category.id}>
                          {category.name}
                        </div>);
                }
          })}
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
