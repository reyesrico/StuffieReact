import React, { useContext, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { find, isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import Media from '../shared/Media';
import TextField from '../shared/TextField';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { getProductFromProducts } from '../helpers/StuffHelper';
import UserContext from '../../context/UserContext';
import { useCategories, useSubcategories, useProducts, useUpdateProductCost } from '../../hooks/queries';
import { getProduct } from '../../api/products.api';

import './Product.scss';

const Product = (props: any) => {
  const { hideOfferButton, product, showCost } = props;
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  // friendId in location state means we arrived from a friend's profile
  const friendId: number | undefined = (location.state as any)?.friendId;
  const productFromState: any = (location.state as any)?.product;
  const isFriendProduct = !!friendId;
  
  // React Query hooks
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const { data: products = {} } = useProducts();
  const updateProductCostMutation = useUpdateProductCost();
  
  const [cost, setCost] = useState(0.0);
  const [message, setMessage] = useState('');
  const [type, setType] = useState(WarningMessageType.EMPTY);
  const [category, setCategory] = useState<any>(null);
  const [subcategory, setSubcategory] = useState<any>(null);
  const [productRendered, setProductRendered] = useState<any>(null);

  useEffect(() => {
    if (!productRendered) {
      const idP = id ? parseInt(id) : product ? product.id : NaN;
      if (isNaN(idP)) return;

      // If we came from a friend's profile, location state has the full product with cost
      if (productFromState?.id === idP) {
        setProductRendered(productFromState);
        return;
      }

      // Try user's own product map first (fast, cached)
      if (!isEmpty(products)) {
        const pRendered = getProductFromProducts(idP, products);
        if (pRendered) {
          setProductRendered(pRendered);
          return;
        }
      }

      // Not in user's map — fetch directly from catalog (friend's product)
      getProduct(idP).then(p => {
        if (p) setProductRendered(p);
      });
    }

    if (productRendered) {
      const cat = find(categories, c => c.id === productRendered.category_id);
      setCategory(cat);
      const subcat = find(subcategories, s => s.id === productRendered.subcategory_id);
      setSubcategory(subcat);
    }
  }, [categories, subcategories, productRendered, products, product, id]);

  const updateCost = (clear: boolean = false) => {
    const updatedCost = clear ? 0 : cost;
    updateProductCostMutation.mutate(
      { productId: productRendered?.id, cost: updatedCost },
      {
        onSuccess: () => {
          setMessage(clear ? t('product.offerStopped') : t('product.costUpdated'));
          setType(WarningMessageType.SUCCESSFUL);
        },
        onError: () => {
          setMessage(t('product.costUpdateFailed'));
          setType(WarningMessageType.ERROR);
        }
      }
    );
  }

  const renderCost = () => {
    if (product?.cost)
      return (
      <div className="product__cost">
        <div className="product__cost-value">{t('product.cost', { amount: productRendered?.cost })}</div>
        {!hideOfferButton && (<div className="product__cost-button">
            <Button text={t('product.stopOffer')} onClick={() => updateCost(true)} size="sm" variant="secondary" />
        </div>)}
      </div>);
    else {
    return (
      <div className="product__cost">
        <div className="product__cost-text">{t('product.sellPrompt')}</div>
        <div className="product__cost-elements">
          $<TextField type="number" name="costTF" value={cost.toString()}
            min={0} max={100} onChange={(e: any) => setCost(e.target.value)} />
          <Button text={t('product.sell')} onClick={() => updateCost()} size="sm" />
        </div>
      </div>);
    }
  }

  if (!productRendered) return <Loading size="lg" message={t('product.loading')} />;

  const actionState = { product: productRendered, friend: friendId };

  return (
    <div className="product">
      <WarningMessage message={message} type={type} />
      <h3>{ productRendered.name }</h3>
      <hr />
      <div className="product__media">
        <Media
          fileName={productRendered.id}
          category={productRendered.category_id}
          subcategory={productRendered.subcategory_id}
          isProduct="true"
          height="200"
          width="100" />
      </div>
      <hr />
      <div>{t('product.categoryLabel')}{ category && category.name }</div>
      <div>{t('product.subcategoryLabel')}{ subcategory && subcategory.name }</div>
      {showCost && renderCost()}

      {isFriendProduct && (
        <div className="product__actions">
          <span className="product__actions-label">{t('feedRow.askFor')}</span>
          <div className="product__actions-buttons">
            <Button
              variant="outline"
              size="sm"
              text={t('feedRow.borrow')}
              onClick={() => navigate('/loan', { state: actionState })}
            />
            <Button
              variant="outline"
              size="sm"
              text={t('feedRow.trade')}
              onClick={() => navigate('/exchange', { state: actionState })}
            />
            {(productRendered.cost ?? 0) > 0 && (
              <Button
                variant="primary"
                size="sm"
                text={t('feedRow.buy')}
                onClick={() => navigate('/buy', { state: actionState })}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
