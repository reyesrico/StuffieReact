import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { MenuProps, MenuState } from './types';
import Category from '../types/Category';
import './Menu.scss';

class Menu extends Component<MenuProps, MenuState> {
  renderCategories = () => {
    const { categories, products } = this.props;

    if (!categories) return;

    return categories
            .filter((category: Category) => products[category.id] && products[category.id].length)
            .map(category => {
              const newTo = { pathname: `/category/${category.id}`, category: category.name };
              return (<Link className="menu__category" key={category.id} to={newTo}>{category.name}</Link>);
            });
  }

  render() {
    return (
      <div className='barBlock barMenu'>
        <div className='menu__title'>Menu</div>
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
