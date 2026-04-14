import React from 'react';
import { useNavigate } from 'react-router-dom';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import Media from '../shared/Media';
import { useCategories } from '../../hooks/queries';
import { default as ProductType } from '../types/Product';

import { BreadcrumbItem } from '../shared/Breadcrumb';

import './ProductCard.scss';

interface ProductCardProps {
  product: ProductType;
  tag?: string;
  navigationState?: { friendId?: number; product?: ProductType; breadcrumb?: BreadcrumbItem[]; loanInfo?: { borrowedFrom?: string; loanedTo?: string }; exchangeInfo?: { tradingWith?: string; tradedWith?: string }; purchaseInfo?: { boughtFrom?: string; cost?: number } };
}

const ProductCard = ({ product, tag, navigationState }: ProductCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();

  const category = find(categories, (c: any) => c.id === product.category_id);

  const handleClick = () => navigate(`/product/${product.id}`, { state: navigationState });
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  };

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
      </div>
      <div className="product-card__info">
        {tag && <span className="product-card__tag">{tag}</span>}
        <div className="product-card__name">{product.name}</div>
        {category && (
          <div className="product-card__category">{category.name}</div>
        )}
        {(product.cost ?? 0) > 0 && (
          <div className="product-card__cost">{t('product.cost', { amount: product.cost })}</div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
