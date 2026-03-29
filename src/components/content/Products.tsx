import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Category from '../types/Category';
import ProductCard from './ProductCard';
import { downloadExcel } from '../helpers/DownloadHelper';
import { isProductsEmpty } from '../helpers/StuffHelper';
import { default as ProductType } from '../types/Product';
import UserContext from '../../context/UserContext';
import { useCategories, useProducts } from '../../hooks/queries';

import './Products.scss';

const Products = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  // React Query hooks
  const { data: categories = [] } = useCategories();
  const { data: products = {}, refetch: refreshProductsQuery, isFetching: isRefreshing } = useProducts();

  const refreshProducts = () => {
    refreshProductsQuery();
  };

  const generateReport = () => {
    downloadExcel(products, `${user?.first_name || 'user'}_products`);
  };

  return (
    <div className="products">
      <div className="products__title">
        <h2>{user?.first_name || t('products.myStuff')} Stuff</h2>
        <div className="products__add-product">
          <Button text={t('products.addProduct')} onClick={() => navigate('/product/add')} size="sm" />
          <Button
            text={isRefreshing ? t('products.refreshing') : t('products.refresh')}
            onClick={refreshProducts}
            disabled={isRefreshing}
            size="sm"
            variant="secondary"
          />
        </div>
      </div>
      {isProductsEmpty(products) && (<div>{t('products.noStuff')}</div>)}
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
          <hr />
          <Button onClick={() => generateReport()} text={t('products.generateReport')} size="sm" variant="secondary" />
        </div>
      )}
    </div>
  );
};

export { Products as ProductsComponent };
export default Products;
