import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { map } from 'lodash';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import TextField from '../shared/TextField';
import AdminChartsPanel from '../charts/AdminChartsPanel';
import Product from '../types/Product';
import User from '../types/User';
import {
  useUserRequests, usePendingProducts, useApproveUser,
  useCategories, useSubcategories, useAddCategory, useAddSubcategory,
} from '../../hooks/queries';
import './Admin.scss';

// ─── Inline Add-Category/Subcategory panel ────────────────────────────────────
const CatalogPanel = () => {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const addCategoryMutation = useAddCategory();
  const addSubcategoryMutation = useAddSubcategory();

  const [catId, setCatId] = useState('');
  const [catName, setCatName] = useState('');
  const [subId, setSubId] = useState('');
  const [subName, setSubName] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [catMsg, setCatMsg] = useState('');
  const [subMsg, setSubMsg] = useState('');

  const addCategory = () => {
    if (!catId || !catName) return;
    setCatLoading(true);
    addCategoryMutation.mutate(
      { id: Number(catId), name: catName },
      {
        onSuccess: () => { setCatId(''); setCatName(''); setCatMsg(t('admin.catalog.added')); },
        onSettled: () => setCatLoading(false),
      }
    );
  };

  const addSubcategory = () => {
    if (!subId || !subName) return;
    setSubLoading(true);
    addSubcategoryMutation.mutate(
      { id: Number(subId), name: subName },
      {
        onSuccess: () => { setSubId(''); setSubName(''); setSubMsg(t('admin.catalog.added')); },
        onSettled: () => setSubLoading(false),
      }
    );
  };

  return (
    <div className="admin__catalog-grid">
      {/* Categories column */}
      <div className="admin__catalog-col">
        <h4 className="admin__catalog-col-title">{t('admin.addCategory')}</h4>
        <ul className="admin__catalog-list">
          {map(categories, (c: any) => (
            <li key={c.id} className="admin__catalog-item">
              <span className="admin__catalog-id">({c.id})</span> {c.name}
            </li>
          ))}
        </ul>
        <div className="admin__catalog-form">
          <TextField name="catId" type="number" placeholder={t('admin.catalog.idPlaceholder')}
            value={catId} onChange={(e: any) => setCatId(e.target.value)} />
          <TextField name="catName" type="text" placeholder={t('admin.catalog.namePlaceholder')}
            value={catName} onChange={(e: any) => setCatName(e.target.value)} />
          <Button text={catLoading ? t('common.loading') : t('admin.catalog.add')}
            onClick={addCategory} size="sm" disabled={catLoading || !catId || !catName} />
        </div>
        {catMsg && <div className="admin__catalog-msg">{catMsg}</div>}
      </div>

      {/* Subcategories column */}
      <div className="admin__catalog-col">
        <h4 className="admin__catalog-col-title">{t('admin.addSubcategory')}</h4>
        <ul className="admin__catalog-list">
          {map(subcategories, (s: any) => (
            <li key={s.id} className="admin__catalog-item">
              <span className="admin__catalog-id">({s.id})</span> {s.name}
            </li>
          ))}
        </ul>
        <div className="admin__catalog-form">
          <TextField name="subId" type="number" placeholder={t('admin.catalog.idPlaceholder')}
            value={subId} onChange={(e: any) => setSubId(e.target.value)} />
          <TextField name="subName" type="text" placeholder={t('admin.catalog.namePlaceholder')}
            value={subName} onChange={(e: any) => setSubName(e.target.value)} />
          <Button text={subLoading ? t('common.loading') : t('admin.catalog.add')}
            onClick={addSubcategory} size="sm" disabled={subLoading || !subId || !subName} />
        </div>
        {subMsg && <div className="admin__catalog-msg">{subMsg}</div>}
      </div>
    </div>
  );
};

type AdminTab = 'notifications' | 'catalog' | 'charts' | 'actions';

// ─── Main Admin component ─────────────────────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: userRequests = [] } = useUserRequests();
  const { data: pendingProducts = [] } = usePendingProducts();
  const approveUserMutation = useApproveUser();
  const [activeTab, setActiveTab] = useState<AdminTab>('notifications');

  const totalNotifications = userRequests.length + pendingProducts.length;

  const approveUser = (user: User) => approveUserMutation.mutate(user);

  return (
    <div className="admin">
      {/* ── Header ── */}
      <div className="admin__header">
        <h2 className="admin__page-title">{t('Admin')}</h2>
      </div>

      {/* ── Stats strip ── */}
      <div className="admin__stats">
        <div className="admin__stat-card">
          <div className="admin__stat-value">{userRequests.length}</div>
          <div className="admin__stat-label">{t('admin.userRequests')}</div>
        </div>
        <div className="admin__stat-card">
          <div className="admin__stat-value">{pendingProducts.length}</div>
          <div className="admin__stat-label">{t('admin.pendingProducts')}</div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="admin__tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'notifications'}
          className={`admin__tab${activeTab === 'notifications' ? ' admin__tab--active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          {t('admin.notifications')}
          {totalNotifications > 0 && (
            <span className="admin__tab-badge">{totalNotifications}</span>
          )}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'catalog'}
          className={`admin__tab${activeTab === 'catalog' ? ' admin__tab--active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          {t('admin.catalog')}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'charts'}
          className={`admin__tab${activeTab === 'charts' ? ' admin__tab--active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          {t('admin.charts')}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'actions'}
          className={`admin__tab${activeTab === 'actions' ? ' admin__tab--active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          {t('admin.actions')}
        </button>
      </div>

      {/* ── Tab panels ── */}
      <section className="admin__section">

        {/* Notifications tab */}
        {activeTab === 'notifications' && (
          <>
            {totalNotifications === 0 && (
              <div className="admin__empty">{t('admin.noNotifications')}</div>
            )}

            {userRequests.length > 0 && (
              <div className="admin__subsection">
                <h4 className="admin__subsection-title">
                  {t('admin.userRequests')}
                  <span className="admin__badge admin__badge--sm">{userRequests.length}</span>
                </h4>
                <ul className="admin__list">
                  {userRequests.map((user: User, index: number) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={index} className="admin__request">
                      <div className="admin__request-info">
                        <span className="admin__request-name">{user.first_name} {user.last_name}</span>
                        <span className="admin__request-email">{user.email}</span>
                      </div>
                      <div className="admin__request-buttons">
                        <Button onClick={() => approveUser(user)} text={t('common.accept')} size="sm" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pendingProducts.length > 0 && (
              <div className="admin__subsection">
                <h4 className="admin__subsection-title">
                  {t('admin.pendingProducts')}
                  <span className="admin__badge admin__badge--sm">{pendingProducts.length}</span>
                </h4>
                <ul className="admin__list">
                  {pendingProducts.map((product: Product) => {
                    const cloudinaryUrl = `https://cloudinary.com/console/media_library/search?q=products/${product.category}/${product.subcategory}/${product.id}`;
                    return (
                      <li key={product.id}>
                        <a
                          href={cloudinaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin__request admin__request--product admin__request--clickable"
                        >
                          <div className="admin__request-info">
                            <span className="admin__request-name">{product.name}</span>
                            <span className="admin__request-meta">
                              ID: {product.id} &nbsp;·&nbsp; {t('admin.category')}: {product.category} &nbsp;·&nbsp; {t('admin.subcategory')}: {product.subcategory}
                            </span>
                          </div>
                          <span className="admin__request-arrow">↗</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Catalog tab */}
        {activeTab === 'catalog' && <CatalogPanel />}

        {/* Charts tab */}
        {activeTab === 'charts' && <AdminChartsPanel />}

        {/* Actions tab */}
        {activeTab === 'actions' && (
          <div className="admin__actions">
            <Button text={t('products.addProduct')} onClick={() => navigate('/product/add')} size="sm" />
            <Button text={t('admin.addCategory')} onClick={() => navigate('/category/add')} size="sm" variant="outline" />
            <Button text={t('admin.addSubcategory')} onClick={() => navigate('/subcategory/add')} size="sm" variant="outline" />
          </div>
        )}

      </section>
    </div>
  );
};

export default Admin;
