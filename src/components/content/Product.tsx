import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

import './Product.scss';

const Product = (props: any) => {
  const { hideOfferButton, product, showCost } = props;
  const { id } = useParams();
  // User context needed for updateProductCost mutation
  useContext(UserContext);
  const { t } = useTranslation();
  
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
    if (!isEmpty(products) && !productRendered) {
      const idP = id ? parseInt(id) : product ? product.id : NaN;
      const pRendered = getProductFromProducts(idP, products);
      setProductRendered(pRendered);
    }

    if (!isEmpty(products) && productRendered) {
      const cat = find(categories, c => c.id === productRendered.category);
      setCategory(cat);
      const subcat = find(subcategories, s => s.id === productRendered.subcategory);
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

  return (
    <div className="product">
      <WarningMessage message={message} type={type} />
      <h3>{ productRendered.name }</h3>
      <hr />
      <div className="product__media">
        <Media
          fileName={productRendered.id}
          category={productRendered.category}
          subcategory={productRendered.subcategory}
          isProduct="true"
          height="200"
          width="100" />
      </div>
      <hr />
      <div>{t('product.categoryLabel')}{ category && category.name }</div>
      <div>{t('product.subcategoryLabel')}{ subcategory && subcategory.name }</div>
      {showCost && renderCost()}
    </div>
  );
};

export default Product;
