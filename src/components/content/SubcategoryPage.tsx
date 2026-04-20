import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight20Regular } from '@fluentui/react-icons';

import Media from '../shared/Media';
import { useProducts, useSubcategories } from '../../hooks/queries';
import type Product from '../types/Product';
import type Subcategory from '../types/Subcategory';
import './CategoryPage.scss';

const SubcategoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: products = {} } = useProducts();
  const { data: subcategories = [] } = useSubcategories();
  const { id } = useParams();
  const subcategoryId = id ? parseInt(id) : -1;
  const subcategory: Subcategory | undefined = subcategories.find(c => c.id === subcategoryId);

  const stuff: Product[] = Object.keys(products)
    .filter((categoryId: string) => id?.startsWith(categoryId))
    .reduce((ps: Product[], categoryId: string) => {
      const psBySub = products[parseInt(categoryId)].filter(
        (p: Product) => p.subcategory_id === subcategoryId
      );
      return ps.concat(psBySub);
    }, []);

  const name = subcategory?.name;

  return (
    <div className="category-page">
      <h3>{t('Subcategory')} {name}</h3>
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

export default SubcategoryPage;
