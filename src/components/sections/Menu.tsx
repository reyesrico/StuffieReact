import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Category from '../types/Category';
import { useCategories, useProducts } from '../../hooks/queries';
import './Menu.scss';

const Menu = () => {
  const { data: categories, isPending: categoriesPending } = useCategories();
  const { data: products, isPending: productsPending } = useProducts();
  const { t } = useTranslation();
  const location = useLocation();

  // isPending is true when the query is disabled OR still fetching (no cached data yet).
  // isLoading (isPending && isFetching) is false for disabled queries, which causes
  // the empty state to flash before user.id is available. isPending is the correct flag.
  const isLoading = categoriesPending || productsPending;

  const totalProducts = products
    ? Object.values(products).reduce((sum, arr) => sum + (arr?.length ?? 0), 0)
    : 0;

  const filteredCategories = (categories ?? []).filter(
    (cat: Category) => products?.[cat.id]?.length
  );

  return (
    <div className="menu">
      <div className="menu__header">
        <span className="menu__title">{t('Summary')}</span>
        {!isLoading && totalProducts > 0 && (
          <span className="menu__total-badge">{totalProducts}</span>
        )}
      </div>

      <div className="menu__list">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="menu__skeleton" />
          ))
        ) : filteredCategories.length === 0 ? (
          <div className="menu__empty">{t('menu.noProducts')}</div>
        ) : (
          filteredCategories.map((cat: Category) => {
            const count = products?.[cat.id]?.length ?? 0;
            const isActive = location.pathname.startsWith(`/category/${cat.id}`);
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className={`menu__category-row${isActive ? ' menu__category-row--active' : ''}`}
              >
                <span className="menu__category-dot" />
                <span className="menu__category-name">{cat.name}</span>
                <span className="menu__category-badge">{count}</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Menu;
