import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { find, isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Share20Regular } from '@fluentui/react-icons';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import Media from '../shared/Media';
import TextField from '../shared/TextField';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { getProductFromProducts } from '../helpers/StuffHelper';
import { useCategories, useSubcategories, useProducts, useUpdateProductCost } from '../../hooks/queries';
import { getProduct } from '../../api/products.api';

import './Product.scss';

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const Product = (props: any) => {
  const { product } = props;
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation();

  // friendId in location state means we arrived from a friend's profile
  const friendId: number | undefined = (location.state as any)?.friendId;
  const productFromState: any = (location.state as any)?.product;
  const loanInfo: { borrowedFrom?: string; loanedTo?: string } | undefined = (location.state as any)?.loanInfo;
  const exchangeInfo: { tradingWith?: string; tradedWith?: string } | undefined = (location.state as any)?.exchangeInfo;
  const purchaseInfo: { boughtFrom?: string; cost?: number } | undefined = (location.state as any)?.purchaseInfo;
  const copiesInfo: { total: number; statuses: string[] } | undefined = (location.state as any)?.copiesInfo;
  const isFriendProduct = !!friendId;
  
  // React Query hooks
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const { data: products = {} } = useProducts();
  const updateProductCostMutation = useUpdateProductCost();
  
  const [cost, setCost] = useState(0.0);
  const [editingCost, setEditingCost] = useState(false);
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
  }, [categories, subcategories, productRendered, products, product, id, productFromState]);

  const startEditing = () => {
    setCost(productRendered?.cost ?? 0);
    setEditingCost(true);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}product/${productRendered?.id}`;
    const shareData = {
      title: productRendered?.name ?? 'Stuffie',
      text: t('product.shareText', { name: productRendered?.name }),
      url: shareUrl,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage(t('product.linkCopied'));
      setType(WarningMessageType.SUCCESSFUL);
    } catch {
      setMessage(t('product.shareFailed'));
      setType(WarningMessageType.ERROR);
    }
  };

  const updateCost = (clear: boolean = false) => {
    const updatedCost = clear ? 0 : Number(cost);
    updateProductCostMutation.mutate(
      { productId: productRendered?.id, cost: updatedCost },
      {
        onSuccess: () => {
          setProductRendered((prev: any) => prev ? { ...prev, cost: updatedCost } : prev);
          setEditingCost(false);
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
    const hasCost = (productRendered?.cost ?? 0) > 0;

    if (editingCost || !hasCost) {
      return (
        <div className="product__cost">
          <div className="product__cost-text">{t('product.sellPrompt')}</div>
          <div className="product__cost-elements">
            <span className="product__cost-prefix">$</span>
            <TextField type="number" name="costTF" value={cost.toString()}
              min={0} max={100} onChange={(e: any) => setCost(e.target.value)} />
            <Button text={t('product.sell')} onClick={() => updateCost()} size="sm"
              loading={updateProductCostMutation.isPending} />
            {hasCost && (
              <Button text={t('product.cancelEdit')} onClick={() => setEditingCost(false)}
                size="sm" variant="secondary" />
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="product__cost">
        <div className="product__cost-display">
          <div className="product__cost-value">{t('product.cost', { amount: productRendered?.cost })}</div>
          <div className="product__cost-actions">
            <button type="button" className="product__cost-edit-btn"
              onClick={startEditing} aria-label={t('product.editCost')}>
              <PencilIcon />
            </button>
            <Button text={t('product.stopOffer')} onClick={() => updateCost(true)}
              size="sm" variant="secondary" loading={updateProductCostMutation.isPending} />
          </div>
        </div>
      </div>
    );
  }

  if (!productRendered) return <Loading size="lg" message={t('product.loading')} />;

  const actionState = { product: productRendered, friend: friendId };

  const rawDate = productRendered.created_at ?? productRendered._created;
  const addedDate = rawDate
    ? new Date(rawDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="product">
      <WarningMessage message={message} type={type} />
      <div className="product__header">
        <h3>{ productRendered.name }</h3>
        <button type="button" className="product__share-btn" onClick={handleShare} aria-label={t('product.share')}>
          <Share20Regular />
        </button>
      </div>
      <hr />
      <div className="product__media">
        <Media
          fileName={productRendered.id}
          category={productRendered.category_id}
          subcategory={productRendered.subcategory_id}
          imageKey={productRendered.image_key}
          isProduct="true"
          height="200"
          width="100" />
      </div>
      <hr />

      <div className="product__info-card">
        {category && (
          <div className="product__info-row">
            <span className="product__info-label">{t('product.categoryLabel')}</span>
            <span className="product__info-value">{category.name}</span>
          </div>
        )}
        {subcategory && (
          <div className="product__info-row">
            <span className="product__info-label">{t('product.subcategoryLabel')}</span>
            <span className="product__info-value">{subcategory.name}</span>
          </div>
        )}
        {addedDate && (
          <div className="product__info-row">
            <span className="product__info-label">{t('product.addedLabel')}</span>
            <span className="product__info-value">{addedDate}</span>
          </div>
        )}
      </div>
      {loanInfo?.borrowedFrom && (
        <div className="product__borrowed-info">
          {t('products.borrowedFrom', { name: loanInfo.borrowedFrom })}
        </div>
      )}
      {loanInfo?.loanedTo && (
        <div className="product__borrowed-info">
          {t('products.loanedTo', { name: loanInfo.loanedTo })}
        </div>
      )}
      {exchangeInfo?.tradingWith && (
        <div className="product__borrowed-info">
          {t('products.tradingWith', { name: exchangeInfo.tradingWith })}
        </div>
      )}
      {exchangeInfo?.tradedWith && (
        <div className="product__borrowed-info">
          {t('products.tradedWith', { name: exchangeInfo.tradedWith })}
        </div>
      )}
      {purchaseInfo?.boughtFrom && (
        <div className="product__borrowed-info">
          {t('products.boughtFrom', { name: purchaseInfo.boughtFrom })}
        </div>
      )}
      {purchaseInfo?.cost != null && (
        <div className="product__borrowed-info">
          {t('products.boughtFor', { amount: purchaseInfo.cost })}
        </div>
      )}
      {copiesInfo && copiesInfo.total > 1 && (
        <div className="product__copies">
          <div className="product__copies-title">{t('products.copiesTitle', { count: copiesInfo.total })}</div>
          <div className="product__copies-list">
            {copiesInfo.statuses.map((status, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={`copy-${i}`} className={`product__copies-badge product__copies-badge--${status === t('products.available') ? 'available' : 'active'}`}>
                #{i + 1} {status}
              </span>
            ))}
          </div>
        </div>
      )}
      {!isFriendProduct && !loanInfo && !exchangeInfo && renderCost()}

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
                text={t('feedRow.buy', { price: productRendered.cost })}
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
