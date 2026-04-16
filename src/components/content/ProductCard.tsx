import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import Media from '../shared/Media';
import { useCategories, useUpdateProductCost } from '../../hooks/queries';
import { default as ProductType } from '../types/Product';

import { BreadcrumbItem } from '../shared/Breadcrumb';

import './ProductCard.scss';

interface ProductCardProps {
  product: ProductType;
  tag?: string;
  copies?: number;
  allowSetCost?: boolean;
  navigationState?: { friendId?: number; product?: ProductType; breadcrumb?: BreadcrumbItem[]; loanInfo?: { borrowedFrom?: string; loanedTo?: string }; exchangeInfo?: { tradingWith?: string; tradedWith?: string }; purchaseInfo?: { boughtFrom?: string; cost?: number }; copiesInfo?: { total: number; statuses: string[] } };
}

const ProductCard = ({ product, tag, copies, allowSetCost, navigationState }: ProductCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();
  const updateCostMutation = useUpdateProductCost();

  const [settingPrice, setSettingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [displayCost, setDisplayCost] = useState<number>(product.cost ?? 0);

  const category = find(categories, (c: any) => c.id === product.category_id);

  const handleClick = () => navigate(`/product/${product.id}`, { state: navigationState });
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  };

  const handleSetPriceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingPrice(true);
    setPriceInput('');
  };

  const handlePriceSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const val = parseFloat(priceInput);
    if (isNaN(val) || val < 0 || !product.id) return;
    updateCostMutation.mutate(
      { productId: product.id, cost: val },
      {
        onSuccess: () => {
          setDisplayCost(val);
          setSettingPrice(false);
        },
      }
    );
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') handlePriceSave(e as any);
    if (e.key === 'Escape') setSettingPrice(false);
  };

  const showNoCost = allowSetCost && displayCost === 0 && !settingPrice;

  return (
    <div
      className="product-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={product.name}
    >
      <div className="product-card__image">
        <Media
          fileName={product.id}
          category={product.category_id}
          subcategory={product.subcategory_id}
          imageKey={product.image_key}
          isProduct="true"
          height="120"
          width="100"
        />
        {copies && copies > 1 && (
          <span className="product-card__count" aria-label={`${copies} copies`}>×{copies}</span>
        )}
      </div>
      <div className="product-card__info">
        {tag && <span className="product-card__tag">{tag}</span>}
        <div className="product-card__name">{product.name}</div>
        {category && (
          <div className="product-card__category">{category.name}</div>
        )}
        {displayCost > 0 && (
          <div className="product-card__cost">{t('product.cost', { amount: displayCost })}</div>
        )}
        {showNoCost && (
          <button
            className="product-card__set-price"
            onClick={handleSetPriceClick}
            tabIndex={0}
            type="button"
          >
            {t('product.setPrice')}
          </button>
        )}
        {settingPrice && (
          <div className="product-card__price-form" onClick={e => e.stopPropagation()}>
            <input
              className="product-card__price-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              onKeyDown={handlePriceKeyDown}
              autoFocus
            />
            <button
              className="product-card__price-save"
              onClick={handlePriceSave}
              disabled={updateCostMutation.isPending}
              type="button"
            >
              {updateCostMutation.isPending ? '…' : t('product.save')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
