import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Category from '../types/Category';
import EmptyState from '../shared/EmptyState';
import Loading from '../shared/Loading';
import ProductCard from './ProductCard';
import { downloadCSV } from '../helpers/DownloadHelper';
import { isProductsEmpty } from '../helpers/StuffHelper';
import { default as ProductType } from '../types/Product';
import UserContext from '../../context/UserContext';
import { useCategories, useProducts } from '../../hooks/queries';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';

import './Products.scss';

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const Products = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  const { data: categories = [] } = useCategories();
  const { data: products = {}, refetch: refreshProductsQuery, isFetching: isRefreshing } = useProducts();

  usePullToRefresh(refreshProductsQuery);

  const generateReport = () => {
    downloadCSV(products, categories, `${user?.first_name || 'user'}_inventory`);
  };

  return (
    <div className="products">
      {isRefreshing && (
        <div className="products__refresh-spinner" role="status" aria-live="polite">
          <Loading size="sm" className="products__refresh-spinner-icon" />
        </div>
      )}
      <div className="products__title">
        <h2>{user?.first_name || t('products.myStuff')} Stuff</h2>
        {!isProductsEmpty(products) && (
          <div className="products__add-product">
            <Button text={t('products.addProduct')} onClick={() => navigate('/product/add')} size="sm" />
            <Button
              icon={<DownloadIcon />}
              text={t('products.exportCsv')}
              onClick={generateReport}
              size="sm"
              variant="secondary"
            />
            <Button
              icon={<RefreshIcon />}
              onClick={() => refreshProductsQuery()}
              size="sm"
              variant="secondary"
              aria-label={t('products.refresh')}
            />
          </div>
        )}
      </div>
      {isProductsEmpty(products) && (
        <div className="products__empty">
          <EmptyState
            icon={<span>📦</span>}
            title={t('products.noStuffTitle')}
            description={t('products.noStuffDesc')}
            action={
              <Button
                text={t('products.addProduct')}
                onClick={() => navigate('/product/add')}
              />
            }
          />
        </div>
      )}
      {!isProductsEmpty(products) && (
        <div>
          {categories.map((category: Category, index: number) => {
            if (!products[category.id] || !products[category.id].length) return <div key={`${category.id}_${index}`} />;

            return (
              <div key={category.id}>
                <h4 className="products__subheader">{category.name}</h4>
                <div className="products__grid">
                  {map(products[category.id as number], (product: ProductType) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { Products as ProductsComponent };
export default Products;
