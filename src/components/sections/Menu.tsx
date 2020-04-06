import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { MenuProps, MenuState } from './types';
import Category from '../types/Category';
import './Menu.scss';

class Menu extends Component<MenuProps, MenuState> {
  renderCategories = () => {
    const { categories, products } = this.props;

    if (!categories) return;

    if (!products) return;

    return categories
            .filter((category: Category) => products[category.id] && products[category.id].length)
            .map(category => {
              const newTo = { pathname: `/category/${category.id}`, category: category.name };
              return (
              <div key={category.id} className="menu__category">
                <Link className="" key={category.id} to={newTo}>{category.name}</Link>
              </div>);
            });
  }

  render() {
    const { products, t } = this.props;

    return (
      <div>
        <div className='menu__title'>{t('Summary')}</div>
        {!products && <div>No products</div>}
        <div className="menu__list">
          { this.renderCategories() }
        </div>
      </div>
    );
  }
};

export default withTranslation()<any>(Menu);
