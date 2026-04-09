import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight20Regular,
  ChevronDown20Regular,
  ChevronRight20Regular,
  Add20Regular,
  Edit20Regular,
  Delete20Regular,
  Tag20Regular,
  Folder20Regular,
} from '@fluentui/react-icons';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import TextField from '../shared/TextField';
import Modal from '../shared/Modal';
import AdminChartsPanel from '../charts/AdminChartsPanel';
import Product from '../types/Product';
import User from '../types/User';
import Category from '../types/Category';
import Subcategory from '../types/Subcategory';
import {
  useUserRequests, usePendingProducts, useApproveUser,
  useCategories, useSubcategories,
  useAddCategory, useUpdateCategory, useDeleteCategory,
  useAddSubcategory, useUpdateSubcategory, useDeleteSubcategory,
} from '../../hooks/queries';
import './Admin.scss';

// ─── Catalog panel: accordion category tree with full CRUD ───────────────────
const CatalogPanel = () => {
  const { t } = useTranslation();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: subcategories = [], isLoading: subsLoading } = useSubcategories();

  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const addSubcategory = useAddSubcategory();
  const updateSubcategory = useUpdateSubcategory();
  const deleteSubcategory = useDeleteSubcategory();

  // expanded category rows
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // ── Add category form ───────────────────────────────
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  // ── Add subcategory form (per category) ─────────────
  const [addingSubFor, setAddingSubFor] = useState<number | null>(null);
  const [newSubName, setNewSubName] = useState('');

  // ── Edit modal ───────────────────────────────────────
  type EditTarget = { kind: 'category'; item: Category } | { kind: 'subcategory'; item: Subcategory };
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editName, setEditName] = useState('');

  // ── Delete modal ─────────────────────────────────────
  type DeleteTarget = { kind: 'category'; item: Category } | { kind: 'subcategory'; item: Subcategory };
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // helpers
  const toggleExpand = (id: number) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const subsForCat = (catId: number) =>
    (subcategories as Subcategory[]).filter(s => s.category_id === catId);

  // next suggested ID = max existing + 1
  const nextCatId = () => {
    const ids = (categories as Category[]).map(c => c.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
  };
  const nextSubId = (catId: number) => {
    const base = catId * 100;
    const existing = (subcategories as Subcategory[])
      .filter(s => s.category_id === catId)
      .map(s => s.id);
    if (!existing.length) return base + 1;
    return Math.max(...existing) + 1;
  };

  // ── Handlers ────────────────────────────────────────
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory.mutate(
      { id: nextCatId(), name: newCatName.trim() },
      { onSuccess: () => { setNewCatName(''); setShowAddCat(false); } }
    );
  };

  const handleAddSubcategory = (catId: number) => {
    if (!newSubName.trim()) return;
    addSubcategory.mutate(
      { id: nextSubId(catId), name: newSubName.trim(), category_id: catId },
      { onSuccess: () => { setNewSubName(''); setAddingSubFor(null); } }
    );
  };

  const openEdit = (target: EditTarget) => {
    setEditTarget(target);
    setEditName(target.item.name);
  };

  const confirmEdit = () => {
    if (!editTarget || !editName.trim() || !editTarget.item._id) return;
    if (editTarget.kind === 'category') {
      updateCategory.mutate(
        { _id: editTarget.item._id, data: { name: editName.trim() } },
        { onSuccess: () => setEditTarget(null) }
      );
    } else {
      updateSubcategory.mutate(
        { _id: editTarget.item._id, data: { name: editName.trim() } },
        { onSuccess: () => setEditTarget(null) }
      );
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget || !deleteTarget.item._id) return;
    if (deleteTarget.kind === 'category') {
      deleteCategory.mutate(deleteTarget.item._id, { onSuccess: () => setDeleteTarget(null) });
    } else {
      deleteSubcategory.mutate(deleteTarget.item._id, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  if (catsLoading || subsLoading) return <Loading />;

  return (
    <div className="catalog-panel">

      {/* ── Category tree ── */}
      <div className="catalog-panel__tree">
        {(categories as Category[]).map(cat => (
          <div key={cat.id} className="catalog-panel__cat-row">

            {/* Category header row */}
            <div className="catalog-panel__cat-header">
              <button
                className="catalog-panel__expand-btn"
                onClick={() => toggleExpand(cat.id)}
                aria-label={expanded.has(cat.id) ? t('common.collapse') : t('common.expand')}
              >
                {expanded.has(cat.id) ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
              </button>
              <Folder20Regular className="catalog-panel__cat-icon" />
              <span className="catalog-panel__cat-name">{cat.name}</span>
              <span className="catalog-panel__cat-id">#{cat.id}</span>
              <span className="catalog-panel__cat-count">{subsForCat(cat.id).length} {t('admin.catalog.subcategories')}</span>
              <div className="catalog-panel__row-actions">
                <button
                  className="catalog-panel__action-btn"
                  onClick={() => openEdit({ kind: 'category', item: cat })}
                  title={t('common.edit')}
                ><Edit20Regular /></button>
                <button
                  className="catalog-panel__action-btn catalog-panel__action-btn--danger"
                  onClick={() => setDeleteTarget({ kind: 'category', item: cat })}
                  title={t('common.delete')}
                ><Delete20Regular /></button>
              </div>
            </div>

            {/* Subcategory rows (expanded) */}
            {expanded.has(cat.id) && (
              <div className="catalog-panel__subs">
                {subsForCat(cat.id).map(sub => (
                  <div key={sub.id} className="catalog-panel__sub-row">
                    <Tag20Regular className="catalog-panel__sub-icon" />
                    <span className="catalog-panel__sub-name">{sub.name}</span>
                    <span className="catalog-panel__sub-id">#{sub.id}</span>
                    <div className="catalog-panel__row-actions">
                      <button
                        className="catalog-panel__action-btn"
                        onClick={() => openEdit({ kind: 'subcategory', item: sub })}
                        title={t('common.edit')}
                      ><Edit20Regular /></button>
                      <button
                        className="catalog-panel__action-btn catalog-panel__action-btn--danger"
                        onClick={() => setDeleteTarget({ kind: 'subcategory', item: sub })}
                        title={t('common.delete')}
                      ><Delete20Regular /></button>
                    </div>
                  </div>
                ))}

                {/* Add subcategory inline */}
                {addingSubFor === cat.id ? (
                  <div className="catalog-panel__add-sub-form">
                    <TextField
                      name="newSubName"
                      placeholder={t('admin.catalog.subNamePlaceholder')}
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      size="sm"
                    />
                    <span className="catalog-panel__suggested-id">→ #{nextSubId(cat.id)}</span>
                    <Button
                      text={t('common.add')}
                      size="sm"
                      loading={addSubcategory.isPending}
                      disabled={!newSubName.trim()}
                      onClick={() => handleAddSubcategory(cat.id)}
                    />
                    <Button
                      text={t('common.cancel')}
                      size="sm"
                      variant="ghost"
                      onClick={() => { setAddingSubFor(null); setNewSubName(''); }}
                    />
                  </div>
                ) : (
                  <button
                    className="catalog-panel__add-sub-btn"
                    onClick={() => { setAddingSubFor(cat.id); setNewSubName(''); }}
                  >
                    <Add20Regular /> {t('admin.catalog.addSubcategory')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Add category ── */}
      {showAddCat ? (
        <div className="catalog-panel__add-cat-form">
          <TextField
            name="newCatName"
            placeholder={t('admin.catalog.catNamePlaceholder')}
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            size="sm"
          />
          <span className="catalog-panel__suggested-id">→ #{nextCatId()}</span>
          <Button
            text={t('common.add')}
            size="sm"
            loading={addCategory.isPending}
            disabled={!newCatName.trim()}
            onClick={handleAddCategory}
          />
          <Button
            text={t('common.cancel')}
            size="sm"
            variant="ghost"
            onClick={() => { setShowAddCat(false); setNewCatName(''); }}
          />
        </div>
      ) : (
        <Button
          text={t('admin.catalog.addCategory')}
          icon={<Add20Regular />}
          size="sm"
          variant="outline"
          onClick={() => setShowAddCat(true)}
        />
      )}

      {/* ── Edit modal ── */}
      {editTarget && (
        <Modal
          title={editTarget.kind === 'category' ? t('admin.catalog.editCategory') : t('admin.catalog.editSubcategory')}
          onClose={() => setEditTarget(null)}
          actions={<>
            <Button
              text={t('common.save')}
              loading={updateCategory.isPending || updateSubcategory.isPending}
              disabled={!editName.trim()}
              onClick={confirmEdit}
            />
            <Button text={t('common.cancel')} variant="outline" onClick={() => setEditTarget(null)} />
          </>}
        >
          <TextField
            name="editName"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            label={t('admin.catalog.namePlaceholder')}
          />
        </Modal>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <Modal
          title={deleteTarget.kind === 'category' ? t('admin.catalog.deleteCategory') : t('admin.catalog.deleteSubcategory')}
          onClose={() => setDeleteTarget(null)}
          actions={<>
            <Button
              text={t('common.delete')}
              variant="secondary"
              loading={deleteCategory.isPending || deleteSubcategory.isPending}
              onClick={confirmDelete}
            />
            <Button text={t('common.cancel')} variant="outline" onClick={() => setDeleteTarget(null)} />
          </>}
        >
          <p className="catalog-panel__delete-msg">
            {t('admin.catalog.deleteConfirm', { name: deleteTarget.item.name })}
          </p>
        </Modal>
      )}
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
                    const cloudinaryUrl = `https://cloudinary.com/console/media_library/search?q=products/${product.category_id}/${product.subcategory_id}/${product.id}`;
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
                              ID: {product.id} &nbsp;·&nbsp; {t('admin.category')}: {product.category_id} &nbsp;·&nbsp; {t('admin.subcategory')}: {product.subcategory_id}
                            </span>
                          </div>
                          <span className="admin__request-arrow"><ArrowUpRight20Regular /></span>
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
