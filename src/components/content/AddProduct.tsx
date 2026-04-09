import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Category from '../types/Category';
import Modal from '../shared/Modal';
import Product from '../types/Product';
import Subcategory from '../types/Subcategory';
import TextField from '../shared/TextField';
import { getProductsByCategory } from '../../api/products.api';
import UserContext from '../../context/UserContext';
import { useCategories, useSubcategories, useProducts, useAddProduct, useAddExistingProduct } from '../../hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/queries/queryKeys';
import { getProductFromProducts } from '../helpers/StuffHelper';
import Media from '../shared/Media';

import './AddProduct.scss';

type Mode = 'catalog' | 'new';

// Auto-dismissing result overlay — shown after API call, no scroll needed
const ResultModal = ({ type, name, onDone, t }: {
  type: 'success' | 'error';
  name: string;
  onDone: () => void;
  t: (key: string) => string;
}) => {
  const title = `${type === 'success' ? '✅' : '❌'} ${type === 'success' ? t('addProduct.successTitle') : t('addProduct.errorTitle')}`;
  return (
    <Modal
      onClose={onDone}
      disableBackdropClose={type === 'success'}
      title={title}
      actions={
        <Button
          text={type === 'success' ? t('addProduct.goToProducts') : t('addProduct.confirmCancel')}
          onClick={onDone}
        />
      }
    >
      {type === 'success' ? (
        <p className="add-product__modal-meta"><strong>{name}</strong> {t('addProduct.addedSuccess')}</p>
      ) : (
        <p className="add-product__modal-meta">{t('addProduct.notAdded')}</p>
      )}
    </Modal>
  );
};

const AddProduct = () => {
  const navigate = useNavigate();
  useContext(UserContext);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Always fetch fresh categories/subcategories so new entries appear immediately
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.subcategories.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  }, []);

  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const { data: products = {} } = useProducts();
  const addProductMutation = useAddProduct();
  const addExistingProductMutation = useAddExistingProduct();

  const [mode, setMode] = useState<Mode>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [ownedProductIds, setOwnedProductIds] = useState<Set<number>>(new Set());
  const [name, setName] = useState('');

  // Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultState, setResultState] = useState<'idle' | 'success' | 'error'>('idle');
  const [resultName, setResultName] = useState('');
  const [isPending, setIsPending] = useState(false);

  // When category is chosen, reset subcategory + product selections
  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
    setSelectedProduct(null);
    setCatalogProducts([]);
    setOwnedProductIds(new Set());
  };

  // When subcategory is chosen, fetch catalog products
  const handleSubcategorySelect = (sub: Subcategory) => {
    setSelectedSubcategory(sub);
    setSelectedProduct(null);
    if (selectedCategory) {
      getProductsByCategory(selectedCategory.id, sub.id).then(prods => {
        setCatalogProducts(prods);
        const owned = new Set<number>(prods.filter((p: Product) => p.id && getProductFromProducts(p.id, products)).map((p: Product) => p.id as number));
        setOwnedProductIds(owned);
      });
    }
  };

  // Reset mode-specific state when switching tabs
  const handleModeSwitch = (m: Mode) => {
    setMode(m);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedProduct(null);
    setCatalogProducts([]);
    setOwnedProductIds(new Set());
    setName('');
    setResultState('idle');
  };

  const filteredSubcategories = selectedCategory
    ? subcategories.filter((s: Subcategory) => s.category_id === selectedCategory.id)
    : [];

  const canConfirmCatalog = !!(selectedProduct?.id);
  const canConfirmNew = !!(name.trim() && selectedCategory && selectedSubcategory);

  const handleConfirm = () => {
    setIsPending(true);
    if (mode === 'catalog' && selectedProduct) {
      addExistingProductMutation.mutate(selectedProduct, {
        onSuccess: () => {
          setIsPending(false);
          setConfirmOpen(false);
          setResultName(selectedProduct.name ?? '');
          setResultState('success');
        },
        onError: () => {
          setIsPending(false);
          setConfirmOpen(false);
          setResultState('error');
        },
      });
    } else if (mode === 'new' && selectedCategory && selectedSubcategory) {
      addProductMutation.mutate(
        { name: name.trim(), category_id: selectedCategory.id, subcategory_id: selectedSubcategory.id },
        {
          onSuccess: (newProduct: Product) => {
            setIsPending(false);
            setConfirmOpen(false);
            setResultName(newProduct.name ?? name.trim());
            setResultState('success');
          },
          onError: () => {
            setIsPending(false);
            setConfirmOpen(false);
            setResultState('error');
          },
        }
      );
    }
  };

  // Category emoji icons for visual flair
  const categoryIcon: Record<number, string> = {
    1: '👗', 2: '📚', 3: '🎮', 4: '💻', 5: '🏡',
    6: '🐾', 7: '🛒', 8: '💄', 9: '🧸', 10: '🤝',
    11: '⚽', 12: '🚗', 13: '💊',
  };

  return (
    <div className="add-product">
      <h3 className="add-product__title">{t('addProduct.title')}</h3>

      {/* Result modal (success or error) */}
      {(resultState === 'success' || resultState === 'error') && (
        <ResultModal
          type={resultState}
          name={resultName}
          onDone={resultState === 'success'
            ? () => navigate('/products')
            : () => setResultState('idle')
          }
          t={t}
        />
      )}

      {/* Mode tabs */}
      <div className="add-product__tabs">
        <button
          className={`add-product__tab ${mode === 'catalog' ? 'add-product__tab--active' : ''}`}
          onClick={() => handleModeSwitch('catalog')}
        >
          {t('addProduct.tabCatalog')}
        </button>
        <button
          className={`add-product__tab ${mode === 'new' ? 'add-product__tab--active' : ''}`}
          onClick={() => handleModeSwitch('new')}
        >
          {t('addProduct.tabNew')}
        </button>
      </div>

      <div className="add-product__body">

        {/* ── CATALOG MODE ─────────────────────────────────────── */}
        {mode === 'catalog' && (
          <>
            {/* STEP 1 — Category */}
            <section className="add-product__step">
              <p className="add-product__step-label">
                <span className="add-product__step-num">1</span>
                {t('addProduct.categoryLabel')}
              </p>
              <div className="add-product__category-grid">
                {categories.map((cat: Category) => (
                  <button
                    key={cat.id}
                    className={`add-product__cat-card ${selectedCategory?.id === cat.id ? 'add-product__cat-card--active' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span className="add-product__cat-icon">{categoryIcon[cat.id] ?? '📦'}</span>
                    <span className="add-product__cat-name">{cat.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* STEP 2 — Subcategory */}
            {selectedCategory && (
              <section className="add-product__step">
                <p className="add-product__step-label">
                  <span className="add-product__step-num">2</span>
                  {t('addProduct.subcategoryLabel')}
                  <span className="add-product__step-context"> — {selectedCategory.name}</span>
                </p>
                {filteredSubcategories.length === 0 ? (
                  <p className="add-product__empty">{t('addProduct.noSubcategories')}</p>
                ) : (
                  <div className="add-product__chip-row">
                    {filteredSubcategories.map((sub: Subcategory) => (
                      <button
                        key={sub.id}
                        className={`add-product__chip ${selectedSubcategory?.id === sub.id ? 'add-product__chip--active' : ''}`}
                        onClick={() => handleSubcategorySelect(sub)}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* STEP 3 — Product grid */}
            {selectedSubcategory && (
              <section className="add-product__step">
                <p className="add-product__step-label">
                  <span className="add-product__step-num">3</span>
                  {t('addProduct.productLabel')}
                  <span className="add-product__step-context"> — {selectedSubcategory.name}</span>
                </p>
                {catalogProducts.length === 0 ? (
                  <p className="add-product__empty">{t('addProduct.noProducts')}</p>
                ) : (
                  <div className="add-product__product-grid">
                    {catalogProducts.map((p: Product) => {
                      const alreadyOwned = p.id ? ownedProductIds.has(p.id) : false;
                      return (
                      <button
                        key={p.id}
                        className={`add-product__product-card ${selectedProduct?.id === p.id ? 'add-product__product-card--active' : ''} ${alreadyOwned ? 'add-product__product-card--owned' : ''}`}
                        onClick={() => !alreadyOwned && setSelectedProduct(p)}
                        disabled={alreadyOwned}
                        title={alreadyOwned ? t('addProduct.alreadyOwned') : undefined}
                      >
                        <div className="add-product__product-thumb">
                          <Media
                            fileName={p.id}
                            category={p.category_id}
                            subcategory={p.subcategory_id}
                            isProduct="true"
                            height="80"
                            width="100"
                          />
                        </div>
                        <span className="add-product__product-name">{p.name}</span>
                        {alreadyOwned && (
                          <span className="add-product__product-owned-badge">{t('addProduct.owned')}</span>
                        )}
                        {!alreadyOwned && selectedProduct?.id === p.id && (
                          <span className="add-product__product-check">✓</span>
                        )}
                      </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* ── NEW MODE ─────────────────────────────────────────── */}
        {mode === 'new' && (
          <>
            {/* STEP 1 — Product name */}
            <section className="add-product__step">
              <p className="add-product__step-label">
                <span className="add-product__step-num">1</span>
                {t('addProduct.nameLabel')}
              </p>
              <div className="add-product__name-row">
                <TextField
                  name="name"
                  type="text"
                  placeholder={t('addProduct.namePlaceholder')}
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                />
              </div>
            </section>

            {/* STEP 2 — Category */}
            <section className="add-product__step">
              <p className="add-product__step-label">
                <span className="add-product__step-num">2</span>
                {t('addProduct.categoryLabel')}
              </p>
              <div className="add-product__category-grid">
                {categories.map((cat: Category) => (
                  <button
                    key={cat.id}
                    className={`add-product__cat-card ${selectedCategory?.id === cat.id ? 'add-product__cat-card--active' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span className="add-product__cat-icon">{categoryIcon[cat.id] ?? '📦'}</span>
                    <span className="add-product__cat-name">{cat.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* STEP 3 — Subcategory */}
            {selectedCategory && (
              <section className="add-product__step">
                <p className="add-product__step-label">
                  <span className="add-product__step-num">3</span>
                  {t('addProduct.subcategoryLabel')}
                  <span className="add-product__step-context"> — {selectedCategory.name}</span>
                </p>
                {filteredSubcategories.length === 0 ? (
                  <p className="add-product__empty">{t('addProduct.noSubcategories')}</p>
                ) : (
                  <div className="add-product__chip-row">
                    {filteredSubcategories.map((sub: Subcategory) => (
                      <button
                        key={sub.id}
                        className={`add-product__chip ${selectedSubcategory?.id === sub.id ? 'add-product__chip--active' : ''}`}
                        onClick={() => setSelectedSubcategory(sub)}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* Add button */}
        {((mode === 'catalog' && canConfirmCatalog) || (mode === 'new' && canConfirmNew)) && (
          <div className="add-product__cta">
            <Button
              text={t('addProduct.addButton')}
              onClick={() => setConfirmOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <Modal
          onClose={() => setConfirmOpen(false)}
          disableBackdropClose={isPending}
          title={t('addProduct.confirmTitle')}
          actions={
            <>
              <Button text={t('addProduct.confirmCancel')} variant="secondary" onClick={() => setConfirmOpen(false)} disabled={isPending} />
              <Button text={isPending ? t('addProduct.confirmAdding') : t('addProduct.confirmAdd')} onClick={handleConfirm} disabled={isPending} />
            </>
          }
        >
          {mode === 'catalog' && selectedProduct && (
            <div className="add-product__modal-body">
              <div className="add-product__modal-thumb">
                <Media
                  fileName={selectedProduct.id}
                  category={selectedProduct.category_id}
                  subcategory={selectedProduct.subcategory_id}
                  isProduct="true"
                  height="100"
                  width="100"
                />
              </div>
              <p className="add-product__modal-name">{selectedProduct.name}</p>
            </div>
          )}
          {mode === 'new' && (
            <>
              <p className="add-product__modal-name">{name.trim()}</p>
              <p className="add-product__modal-meta">
                {selectedCategory?.name} › {selectedSubcategory?.name}
              </p>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

export default AddProduct;
