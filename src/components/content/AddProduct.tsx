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
import { useCategories, useSubcategories, useProducts, useAddProduct, useAddExistingProduct, useCreateProposal } from '../../hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/queries/queryKeys';
import {
  CheckmarkCircle20Regular, DismissCircle20Regular,
  ClothesHanger20Regular, Book20Regular, MusicNote120Regular, Laptop20Regular,
  BuildingHome20Regular, AnimalPawPrint20Regular, Cart20Regular, HeartPulse20Regular,
  Balloon20Regular, Gift20Regular, SportSoccer20Regular, VehicleCar20Regular,
  Pill20Regular, Box20Regular, Checkmark20Regular, Search20Regular, Warning20Regular,
  Sparkle20Regular,
} from '@fluentui/react-icons';
import { getProductFromProducts } from '../helpers/StuffHelper';
import Media from '../shared/Media';
import config from '../../config/api';

import './AddProduct.scss';

type Mode = 'catalog' | 'new';

// Auto-dismissing result overlay — shown after API call, no scroll needed
const ResultModal = ({ type, name, onDone, t }: {
  type: 'success' | 'error';
  name: string;
  onDone: () => void;
  t: (key: string) => string;
}) => {
  const TitleIcon = type === 'success' ? CheckmarkCircle20Regular : DismissCircle20Regular;
  const title = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <TitleIcon />
      {type === 'success' ? t('addProduct.successTitle') : t('addProduct.errorTitle')}
    </span>
  );
  return (
    <Modal
      onClose={onDone}
      disableBackdropClose={type === 'success'}
      title={title as any}
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
  }, [queryClient]);

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

  // Subcategory search state
  const [subSearch, setSubSearch] = useState('');

  // Deduplication warning
  const [dupCandidates, setDupCandidates] = useState<Product[]>([]);

  // AI suggestion state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Subcategory proposal state
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalName, setProposalName] = useState('');
  const [proposalSubmitted, setProposalSubmitted] = useState(false);
  const createProposalMutation = useCreateProposal();

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
    setSubSearch('');
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
    setSubSearch('');
    setDupCandidates([]);
    setAiError('');
    setShowProposalForm(false);
    setProposalName('');
    setProposalSubmitted(false);
    setResultState('idle');
  };

  const filteredSubcategories = selectedCategory
    ? subcategories.filter((s: Subcategory) => s.category_id === selectedCategory.id)
    : [];

  // Cross-category subcategory search results (max 8, sorted by name)
  const subSearchTrimmed = subSearch.trim().toLowerCase();
  const subSearchResults: Array<{ sub: Subcategory; cat: Category }> = subSearchTrimmed.length >= 2
    ? subcategories
        .filter((s: Subcategory) => s.name.toLowerCase().includes(subSearchTrimmed))
        .map((s: Subcategory) => ({ sub: s, cat: categories.find((c: Category) => c.id === s.category_id) as Category }))
        .filter(r => r.cat)
        .sort((a, b) => a.sub.name.localeCompare(b.sub.name))
        .slice(0, 8)
    : [];

  // New mode: select subcategory, fetch catalog for that subcat, then run dedup against current name
  const handleSubcategorySelectNew = (sub: Subcategory, cat: Category) => {
    setSelectedSubcategory(sub);
    getProductsByCategory(cat.id, sub.id).then(prods => {
      setCatalogProducts(prods);
      // Run dedup immediately — user may have already typed the name
      const currentName = name.trim();
      if (!currentName) { setDupCandidates([]); return; }
      const words = currentName.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
      if (words.length === 0) { setDupCandidates([]); return; }
      const matches = prods.filter((p: Product) => {
        const pName = (p.name ?? '').toLowerCase();
        return words.some(w => pName.includes(w));
      });
      setDupCandidates(matches.slice(0, 3));
    });
  };

  // Handle subcategory search selection (auto-selects parent category)
  const handleSubSearchSelect = (sub: Subcategory, cat: Category) => {
    handleCategorySelect(cat); // also resets subSearch via handleCategorySelect
    if (mode === 'catalog') {
      handleSubcategorySelect(sub);
    } else {
      handleSubcategorySelectNew(sub, cat);
    }
  };

  // Deduplication: check for similar products in the loaded catalog after name+subcategory set
  const checkDuplicates = (productName: string, subcatId: number | undefined) => {
    if (!productName.trim() || !subcatId) { setDupCandidates([]); return; }
    const words = productName.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
    if (words.length === 0) { setDupCandidates([]); return; }
    const matches = catalogProducts.filter((p: Product) => {
      const pName = (p.name ?? '').toLowerCase();
      return words.some(w => pName.includes(w));
    });
    setDupCandidates(matches.slice(0, 3));
  };

  // AI-powered categorization — sends product name to /ai-chat, pre-fills category + subcategory
  const suggestWithAI = async () => {
    const trimmed = name.trim();
    if (!trimmed || aiLoading) return;
    setAiLoading(true);
    setAiError('');
    try {
      const catList = (categories as Category[]).map((c: Category) => ({ id: c.id, name: c.name }));
      const subList = (subcategories as Subcategory[]).map((s: Subcategory) => ({ id: s.id, category_id: s.category_id, name: s.name }));
      const systemPrompt = [
        'You are a product categorization assistant for a personal inventory app.',
        'Given a product name, return ONLY a JSON object (no markdown, no explanation) with:',
        '  category_id: number — the best matching category id from the provided list',
        '  subcategory_id: number — the best matching subcategory id (must belong to the chosen category)',
        '  suggested_name: string — a clean, title-case standardized product name',
        '',
        'Categories: ' + JSON.stringify(catList),
        'Subcategories: ' + JSON.stringify(subList),
      ].join('\n');
      const res = await fetch(`${config.server}ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-apikey': config.headers['x-apikey'] },
        body: JSON.stringify({
          model: 'gpt-5-nano',
          systemPrompt,
          messages: [{ role: 'user', content: `Categorize this product: ${trimmed}` }],
        }),
      });
      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      const raw = (data.content ?? '').replace(/```[^\n]*\n?/g, '').trim();
      const parsed = JSON.parse(raw) as { category_id: number; subcategory_id: number; suggested_name: string };
      const cat = (categories as Category[]).find((c: Category) => c.id === parsed.category_id);
      const sub = (subcategories as Subcategory[]).find((s: Subcategory) => s.id === parsed.subcategory_id);
      if (cat) {
        handleCategorySelect(cat);
        if (sub) handleSubcategorySelectNew(sub, cat);
      }
      if (parsed.suggested_name) setName(parsed.suggested_name);
    } catch {
      setAiError(t('addProduct.aiError'));
    } finally {
      setAiLoading(false);
    }
  };

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

  // Category icons — Fluent UI icons keyed by category id
  const categoryIcon: Record<number, React.ReactElement> = {
    1: <ClothesHanger20Regular />,
    2: <Book20Regular />,
    3: <MusicNote120Regular />,
    4: <Laptop20Regular />,
    5: <BuildingHome20Regular />,
    6: <AnimalPawPrint20Regular />,
    7: <Cart20Regular />,
    8: <HeartPulse20Regular />,
    9: <Balloon20Regular />,
    10: <Gift20Regular />,
    11: <SportSoccer20Regular />,
    12: <VehicleCar20Regular />,
    13: <Pill20Regular />,
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
                    <span className="add-product__cat-icon">{categoryIcon[cat.id] ?? <Box20Regular />}</span>
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

                {/* Cross-category subcategory search */}
                <div className="add-product__sub-search">
                  <Search20Regular className="add-product__sub-search-icon" />
                  <input
                    type="text"
                    className="add-product__sub-search-input"
                    placeholder={t('addProduct.searchSubcategories')}
                    value={subSearch}
                    onChange={e => setSubSearch(e.target.value)}
                  />
                </div>

                {subSearchTrimmed.length >= 2 ? (
                  subSearchResults.length === 0 ? (
                    <p className="add-product__empty">{t('addProduct.noSubcategories')}</p>
                  ) : (
                    <div className="add-product__chip-row">
                      {subSearchResults.map(({ sub, cat: resCat }) => (
                        <button
                          key={sub.id}
                          className={`add-product__chip ${selectedSubcategory?.id === sub.id ? 'add-product__chip--active' : ''}`}
                          onClick={() => handleSubSearchSelect(sub, resCat)}
                        >
                          {sub.name}
                          {resCat.id !== selectedCategory?.id && (
                            <span className="add-product__chip-cat"> · {resCat.name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )
                ) : filteredSubcategories.length === 0 ? (
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
                            imageKey={p.image_key}
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
                          <span className="add-product__product-check"><Checkmark20Regular /></span>
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
                  onBlur={() => checkDuplicates(name, selectedSubcategory?.id)}
                />
                <button
                  className={`add-product__ai-btn ${aiLoading ? 'add-product__ai-btn--loading' : ''}`}
                  onClick={suggestWithAI}
                  disabled={!name.trim() || aiLoading}
                  title={t('addProduct.aiSuggest')}
                >
                  <Sparkle20Regular />
                </button>
              </div>
              {aiError && <p className="add-product__ai-error">{aiError}</p>}

              {/* Deduplication warning */}
              {dupCandidates.length > 0 && (
                <div className="add-product__dup-warning">
                  <Warning20Regular className="add-product__dup-icon" />
                  <div>
                    <p className="add-product__dup-title">{t('addProduct.similarProducts')}</p>
                    <div className="add-product__dup-list">
                      {dupCandidates.map((p: Product) => (
                        <button
                          key={p.id}
                          className="add-product__dup-item"
                          onClick={() => {
                            handleModeSwitch('catalog');
                            // Pre-navigate into that product's subcategory in catalog mode
                            const cat = categories.find((c: Category) => c.id === p.category_id);
                            if (cat) handleCategorySelect(cat);
                          }}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                    <button className="add-product__dup-dismiss" onClick={() => setDupCandidates([])}>
                      {t('addProduct.createAnyway')}
                    </button>
                  </div>
                </div>
              )}
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
                    <span className="add-product__cat-icon">{categoryIcon[cat.id] ?? <Box20Regular />}</span>
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

                {/* Cross-category subcategory search */}
                <div className="add-product__sub-search">
                  <Search20Regular className="add-product__sub-search-icon" />
                  <input
                    type="text"
                    className="add-product__sub-search-input"
                    placeholder={t('addProduct.searchSubcategories')}
                    value={subSearch}
                    onChange={e => setSubSearch(e.target.value)}
                  />
                </div>

                {subSearchTrimmed.length >= 2 ? (
                  subSearchResults.length === 0 ? (
                    <p className="add-product__empty">{t('addProduct.noSubcategories')}</p>
                  ) : (
                    <div className="add-product__chip-row">
                      {subSearchResults.map(({ sub, cat: resCat }) => (
                        <button
                          key={sub.id}
                          className={`add-product__chip ${selectedSubcategory?.id === sub.id ? 'add-product__chip--active' : ''}`}
                          onClick={() => handleSubSearchSelect(sub, resCat)}
                        >
                          {sub.name}
                          {resCat.id !== selectedCategory?.id && (
                            <span className="add-product__chip-cat"> · {resCat.name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )
                ) : filteredSubcategories.length === 0 ? (
                  <p className="add-product__empty">{t('addProduct.noSubcategories')}</p>
                ) : (
                  <div className="add-product__chip-row">
                    {filteredSubcategories.map((sub: Subcategory) => (
                      <button
                        key={sub.id}
                        className={`add-product__chip ${selectedSubcategory?.id === sub.id ? 'add-product__chip--active' : ''}`}
                        onClick={() => selectedCategory && handleSubcategorySelectNew(sub, selectedCategory)}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggest a new subcategory */}
                {!showProposalForm && !proposalSubmitted && (
                  <button className="add-product__suggest-link" onClick={() => setShowProposalForm(true)}>
                    {t('addProduct.suggestSubcategory')}
                  </button>
                )}
                {proposalSubmitted && (
                  <p className="add-product__suggest-done">{t('addProduct.proposalSent')}</p>
                )}
                {showProposalForm && !proposalSubmitted && (
                  <div className="add-product__proposal-form">
                    <input
                      type="text"
                      className="add-product__proposal-input"
                      placeholder={t('addProduct.proposalPlaceholder')}
                      value={proposalName}
                      onChange={e => setProposalName(e.target.value)}
                    />
                    <Button
                      size="sm"
                      text={createProposalMutation.isPending ? '…' : t('addProduct.proposalSubmit')}
                      disabled={!proposalName.trim() || createProposalMutation.isPending}
                      onClick={() => {
                        if (!selectedCategory || !proposalName.trim()) return;
                        createProposalMutation.mutate(
                          { name: proposalName.trim(), category_id: selectedCategory.id },
                          { onSuccess: () => { setProposalSubmitted(true); setShowProposalForm(false); } },
                        );
                      }}
                    />
                    <button className="add-product__suggest-link" onClick={() => setShowProposalForm(false)}>
                      {t('common.cancel')}
                    </button>
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
                  imageKey={selectedProduct.image_key}
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
