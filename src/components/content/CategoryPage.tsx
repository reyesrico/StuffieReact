import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight20Regular } from '@fluentui/react-icons';

import { useProducts, useCategories } from '../../hooks/queries';
import type Product from '../types/Product';
import Media from '../shared/Media';
import './CategoryPage.scss';

const CategoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: products = {} } = useProducts();
  const { data: categories = [] } = useCategories();
  const { id } = useParams();
  const categoryId = id ? parseInt(id) : -1;
  const category = categories.find(c => c.id === categoryId);

  if (!category) return <div className="category-page">{t('NoProducts')}</div>;

  const stuff: Product[] = products[category.id] ?? [];
  const name = category.name;

  return (
    <div className="category-page">
      <h3>{t('Category')} {name}</h3>
      <hr />
      {stuff.length === 0 && <div>{t('NoProducts')}</div>}
      <ul>
        {stuff.map((product: Product) => (
          <li
            key={product.id}
            className="category-page__row"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/product/${product.id}`)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/product/${product.id}`)}
          >
            <div className="category-page__header">
              <Media
                fileName={product.id}
                category={product.category_id}
                subcategory={product.subcategory_id}
                imageKey={product.image_key}
                isProduct="true"
                height="200"
                width="100"
              />
              <div className="category-page__header-text">
                <h3>{product.name}</h3>
                <div>{t('Category')}: {name}</div>
              </div>
            </div>
            <div className="category-page__icon">
              <ChevronRight20Regular />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryPage;
