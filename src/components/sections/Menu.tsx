import React, { Component } from 'react';

import { MenuProps, MenuState } from './types';
import './Menu.scss';

class Menu extends Component<MenuProps, MenuState> {
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
        <div className='searchBarGroup'>
          {/* <SearchBar categories={categories} /> */}
        </div>
      </div>
    );
  }
};

export default Menu;
