import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Checkmark20Regular, ArrowLeft20Regular, ArrowSwap20Regular } from '@fluentui/react-icons';

import Button from '../shared/Button';
import Media from '../shared/Media';
import Modal from '../shared/Modal';
import { getProductsList } from '../helpers/StuffHelper';
import { getUsersByIds } from '../../api/users.api';
import UserContext from '../../context/UserContext';
import { useCategories, useSubcategories, useProducts, useCreateExchange } from '../../hooks/queries';
import type Category from '../types/Category';
import type Subcategory from '../types/Subcategory';
import type Product from '../types/Product';

import './Exchange.scss';

// ── Selectable product row ─────────────────────────────────────────────────────

type ProductRowProps = {
  product: Product;
  isSelected: boolean;
  onSelect: (p: Product) => void;
  categories: Category[];
  subcategories: Subcategory[];
};

const ProductRow = ({ product, isSelected, onSelect, categories, subcategories }: ProductRowProps) => {
  const category = categories.find((c: Category) => c.id === product.category_id);
  const subcategory = subcategories.find((s: Subcategory) => s.id === product.subcategory_id);

  return (
    <div
      className={`exchange-row${isSelected ? ' exchange-row--selected' : ''}`}
      onClick={() => onSelect(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(product)}
      aria-pressed={isSelected}
    >
      <div className="exchange-row__media">
        <Media
          fileName={product.id}
          category={product.category_id}
          subcategory={product.subcategory_id}
          imageKey={product.image_key}
          format="jpg"
          height="48"
          width="48"
          isProduct="true"
        />
      </div>
      <div className="exchange-row__info">
        <span className="exchange-row__name">{product.name}</span>
        <span className="exchange-row__meta">
          {category?.name}{subcategory ? ` · ${subcategory.name}` : ''}
        </span>
      </div>
      <div className="exchange-row__check" aria-hidden="true">
        {isSelected ? <Checkmark20Regular /> : null}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const Exchange = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const { data: products = {} } = useProducts();
  const createExchangeMutation = useCreateExchange();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterText, setFilterText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [friend, setFriend] = useState<{ first_name: string } | null>(null);

  const targetProduct: Product = (location.state as any)?.['product'];
  const friendId: number = (location.state as any)?.['friend'];

  useEffect(() => {
    if (!targetProduct) {
      navigate('/');
      return;
    }
    if (friendId) {
      getUsersByIds([{ id: friendId }]).then((users) => setFriend(users[0] as any));
    }
  }, [targetProduct, friendId, navigate]);

  // Build two lists: same-category first, then everything else
  const allProducts = getProductsList(products);
  const lowerFilter = filterText.toLowerCase();
  const filtered = filterText
    ? allProducts.filter((p) => p.name?.toLowerCase().includes(lowerFilter))
    : allProducts;

  const sameCategory = filtered.filter((p) => p.category_id === targetProduct?.category_id);
  const otherProducts = filtered.filter((p) => p.category_id !== targetProduct?.category_id);

  const targetCategory = categories.find((c: Category) => c.id === targetProduct?.category_id);
  const targetSubcategory = subcategories.find((s: Subcategory) => s.id === targetProduct?.subcategory_id);

  const handleSelect = useCallback((p: Product) => {
    setSelectedProduct((prev) => (prev?.id === p.id ? null : p));
  }, []);

  const requestExchange = useCallback(() => {
    setShowConfirm(false);
    if (!friendId || !targetProduct?.id || !user?.id || !selectedProduct?.id) return;

    createExchangeMutation.mutate(
      {
        id_stuffier: friendId,
        id_stuff: targetProduct.id,
        id_friend: user.id,
        id_friend_stuff: selectedProduct.id,
      },
      {
        onSuccess: () => setShowSuccess(true),
        onError: () => setShowError(true),
      }
    );
  }, [createExchangeMutation, friendId, targetProduct?.id, user?.id, selectedProduct]);

  if (!targetProduct) return null;

  return (
    <div className="exchange">
      {/* Header */}
      <div className="exchange__page-header">
        <button className="exchange__back" onClick={() => navigate(-1)} aria-label={t('common.back')}>
          <ArrowLeft20Regular />
        </button>
        <h2>{t('exchange.friendProduct', { name: friend?.first_name ?? '…' })}</h2>
      </div>

      {/* Target card — what they're trading for */}
      <div className="exchange__target-card">
        <div className="exchange__target-media">
          <Media
            fileName={targetProduct.id}
            category={targetProduct.category_id}
            subcategory={targetProduct.subcategory_id}
            imageKey={targetProduct.image_key}
            format="jpg"
            height="56"
            width="56"
            isProduct="true"
          />
        </div>
        <div className="exchange__target-info">
          <span className="exchange__target-chip">{t('exchange.requesting')}</span>
          <span className="exchange__target-name">{targetProduct.name}</span>
          <span className="exchange__target-meta">
            {targetCategory?.name}{targetSubcategory ? ` · ${targetSubcategory.name}` : ''}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <p className="exchange__instructions">{t('exchange.instructions')}</p>

      {/* Offer section */}
      <div className="exchange__offer-section">
        <div className="exchange__offer-header">
          <span className="exchange__offer-label">{t('exchange.offerSection')}</span>
          <input
            className="exchange__filter"
            type="text"
            placeholder={t('exchange.filterPlaceholder')}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {allProducts.length === 0 && (
          <p className="exchange__empty">{t('exchange.noProducts')}</p>
        )}

        {allProducts.length > 0 && filtered.length === 0 && (
          <p className="exchange__empty">{t('exchange.noFilterResults')}</p>
        )}

        {sameCategory.length > 0 && (
          <>
            <p className="exchange__section-label">{t('exchange.sameCategoryLabel')}</p>
            {sameCategory.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                isSelected={selectedProduct?.id === p.id}
                onSelect={handleSelect}
                categories={categories}
                subcategories={subcategories}
              />
            ))}
          </>
        )}

        {otherProducts.length > 0 && (
          <>
            <p className="exchange__section-label">{t('exchange.otherItemsLabel')}</p>
            {otherProducts.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                isSelected={selectedProduct?.id === p.id}
                onSelect={handleSelect}
                categories={categories}
                subcategories={subcategories}
              />
            ))}
          </>
        )}
      </div>

      {/* Sticky confirm bar */}
      {selectedProduct && (
        <div className="exchange__confirm-bar">
          <div className="exchange__confirm-summary">
            <span className="exchange__confirm-item">{selectedProduct.name}</span>
            <span className="exchange__confirm-arrow"><ArrowSwap20Regular /></span>
            <span className="exchange__confirm-item">{targetProduct.name}</span>
          </div>
          <Button
            variant="primary"
            text={t('exchange.requestButton')}
            onClick={() => setShowConfirm(true)}
          />
        </div>
      )}

      {showConfirm && (
        <Modal
          title={t('exchange.confirmTitle')}
          onClose={() => setShowConfirm(false)}
          disableBackdropClose={createExchangeMutation.isPending}
          actions={
            <>
              <Button
                variant="secondary"
                text={t('common.cancel')}
                onClick={() => setShowConfirm(false)}
                disabled={createExchangeMutation.isPending}
              />
              <Button
                variant="primary"
                text={t('exchange.requestButton')}
                onClick={requestExchange}
                loading={createExchangeMutation.isPending}
              />
            </>
          }
        >
          <div className="exchange__confirm-preview">
            <div className="exchange__confirm-preview-side">
              <Media
                fileName={selectedProduct?.id}
                category={selectedProduct?.category_id}
                subcategory={selectedProduct?.subcategory_id}
                imageKey={selectedProduct?.image_key}
                format="jpg"
                height="64"
                width="64"
                isProduct="true"
              />
              <span className="exchange__confirm-preview-name">{selectedProduct?.name}</span>
            </div>
            <span className="exchange__confirm-preview-arrow"><ArrowSwap20Regular /></span>
            <div className="exchange__confirm-preview-side">
              <Media
                fileName={targetProduct.id}
                category={targetProduct.category_id}
                subcategory={targetProduct.subcategory_id}
                imageKey={targetProduct.image_key}
                format="jpg"
                height="64"
                width="64"
                isProduct="true"
              />
              <span className="exchange__confirm-preview-name">{targetProduct.name}</span>
            </div>
          </div>
          <p>{t('exchange.confirmBody', { mine: selectedProduct?.name, theirs: targetProduct.name })}</p>
        </Modal>
      )}

      {showSuccess && (
        <Modal
          title={t('exchange.successTitle')}
          actions={
            <Button
              variant="primary"
              text={t('common.accept')}
              onClick={() => navigate('/products')}
            />
          }
        >
          <p>{t('exchange.successMessage')}</p>
        </Modal>
      )}

      {showError && (
        <Modal
          title={t('exchange.errorTitle')}
          onClose={() => setShowError(false)}
          actions={
            <Button
              variant="secondary"
              text={t('common.cancel')}
              onClick={() => setShowError(false)}
            />
          }
        >
          <p>{t('exchange.errorMessage')}</p>
        </Modal>
      )}
    </div>
  );
};

export default Exchange;
