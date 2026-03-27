import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Category from '../types/Category';
import { useCategories, useProducts } from '../../hooks/queries';
import { CircleSmallFilled } from "@fluentui/react-icons"; 
import './Menu.scss';

const Menu = () => {
  const { data: categories } = useCategories();
  const { data: products } = useProducts();
  const { t } = useTranslation();

  const renderCategories = () => {
    if (!categories || !Array.isArray(categories)) return null;
    if (!products) return null;

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
                <CircleSmallFilled />
                <span className='menu__category-name'>{cat.name}</span>
              </div>
            </Link>
          </div>);
      });
  }

  return (
    <div>
      <div className='menu__title'>{t('Summary')}</div>
      {/* {isProductsEmpty(products) && <div>No products</div>} */}
      <div className="menu__list">
        {renderCategories()}
      </div>
    </div>
  );
};

export default Menu;
