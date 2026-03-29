import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Category from '../types/Category';
import Media from '../shared/Media';
import Product from '../types/Product';
import Subcategory from '../types/Subcategory';
import SearchBar from '../shared/SearchBar';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { getProductsList } from '../helpers/StuffHelper';
import { getUsersByIds } from '../../api/users.api';
import UserContext from '../../context/UserContext';
import { useCategories, useSubcategories, useProducts, useCreateExchange } from '../../hooks/queries';

import './Exchange.scss';

const Exchange = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);

  // React Query hooks
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const { data: products = {} } = useProducts();
  const createExchangeMutation = useCreateExchange();
  
  const [userProducts, setUserProducts] = useState<any>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product>({});
  const [message, setMessage] = useState('');
  const [friend, setFriend] = useState({ first_name: '' });
  const [type, setType] = useState(WarningMessageType.EMPTY);
  const { t } = useTranslation();

  const product: Product = (location.state as any)?.["product"];
  const friendId = (location.state as any)?.["friend"];

  useEffect(() => {
    if (!product) {
      navigate('/');
      return;
    }

    // Filter user's products by same category/subcategory
    const uProducts = getProductsList(products)
      .filter(p => p.category === product.category || p.subcategory === product.subcategory);
    setUserProducts(uProducts);

    // Fetch friend info
    if (friendId) {
      getUsersByIds([{ id: friendId }])
        .then((users) => setFriend(users[0] as any));
    }
  }, [product, friendId, products, navigate]);

  const requestExchange = useCallback(() => {
    if (!friendId || !product?.id || !user?.id || !selectedProduct?.id) return;
    
    createExchangeMutation.mutate(
      {
        id_stuffier: friendId,
        id_stuff: product.id,
        id_friend: user.id,
        id_friend_stuff: selectedProduct.id,
      },
      {
        onSuccess: () => {
          setMessage(t('exchange.successMessage'));
          setType(WarningMessageType.SUCCESSFUL);
          navigate('/products');
        },
        onError: () => {
          setMessage(t('exchange.errorMessage'));
          setType(WarningMessageType.ERROR);
        },
      }
    );
  }, [createExchangeMutation, friendId, product?.id, user?.id, selectedProduct, navigate]);

  const selectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const renderProduct = useCallback((product: Product) => {
    const category: Category = categories.filter(c => c.id === product.category)[0];
    const subcategory: Subcategory = subcategories.filter(s => s.id === product.subcategory)[0];

    return (
      <div className="exchange__product">
        <Media
          fileName={product.id}
          category={product.category}
          subcategory={product.subcategory}
          format="jpg"
          height="100"
          width="100"
          isProduct="true"
        />
        <div className="exchange__product-info">
          <div>{product.name}</div>
          <div>{category.name}</div>
          <div>{subcategory.name}</div>
        </div>
      </div>
    );
  }, [categories, subcategories]);

  if (!product) {
    return null;
  }

  if (!userProducts.length) {
    return <div className="exchange exchange--empty">{t('exchange.noProducts')}</div>;
  }

  return (
    <div className="exchange">
      <div className="exchange__page-header">
        <h2>{t('exchange.friendProduct', { name: friend?.first_name })}</h2>
      </div>
      <WarningMessage message={message} type={type} />
      <div className="exchange__search-header">
        <SearchBar products={userProducts} selectProduct={(p: Product) => selectProduct(p)} />
      </div>
      { !isEmpty(selectedProduct) &&
        <div className="exchange__content">
          <div className="exchange__compare">
            <div className="exchange__compare-info">
              <h4>{t('exchange.myProduct')}</h4>
              {renderProduct(selectedProduct)}
            </div>
            <div className="exchange__line" />
            <div className="exchange__compare-info">
              <h4>{t('exchange.friendProduct', { name: friend?.first_name })}</h4>
              {renderProduct(product)}
            </div>
          </div>
          <Button
            type="submit"
            onClick={requestExchange}
            text={t('exchange.requestButton')}
          />
        </div>
      }
    </div>
  );
}

export default Exchange;
