import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Category from '../types/Category';
import State from '../../redux/State';
import { MenuProps, MenuState } from './types';
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

const mapStateToProps = (state: State) => ({
  user: state.user,
  categories: state.categories,
  products: state.products
});

export default connect(mapStateToProps, {})(withTranslation()<any>(Menu));
