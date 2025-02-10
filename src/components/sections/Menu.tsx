import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Category from '../types/Category';
import State from '../../redux/State';
import { Icon } from '@fluentui/react/lib/Icon';
import { isProductsEmpty } from '../../components/helpers/StuffHelper';
import './Menu.scss';

const Menu = () => {
  let categories = useSelector((state: State) => state.categories);
  let products = useSelector((state: State) => state.products);
  const { t } = useTranslation();

  const renderCategories = () => {
    if (!categories) return;
    if (!products) return;

    return categories
      .filter((category: Category) => products[category.id] && products[category.id].length)
      .map(cat => {
        const newTo = { pathname: `/category/${cat.id}`, state: { category: cat.name } };
        return (
          <div key={cat.id} className="menu__category">
            <Link
              key={cat.id}
              to={newTo}
              style={{ color: 'inherit', textDecoration: 'inherit' }}
            >
              <div className='menu__category-row'>
                <Icon iconName="ArrowEnter"></Icon>
                <span className='menu__category-name'>{cat.name}</span>
              </div>
            </Link>
          </div>);
      });
  }

  return (
    <div>
      <div className='menu__title'>{t('Summary')}</div>
      {isProductsEmpty(products) && <div>No products</div>}
      <div className="menu__list">
        {renderCategories()}
      </div>
    </div>
  );
};

export default Menu;
