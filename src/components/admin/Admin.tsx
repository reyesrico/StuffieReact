import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
  BugRegular,
  ImageSearch20Regular,
  ArrowUpload20Regular,
} from '@fluentui/react-icons';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import Modal from '../shared/Modal';
import AdminChartsPanel from '../charts/AdminChartsPanel';
import Product from '../types/Product';
import User from '../types/User';
import Category from '../types/Category';
import Subcategory from '../types/Subcategory';
import { getOrphanRows, deleteOrphanRow, deleteUser, OrphanRow } from '../../api/users.api';
import { updateProduct } from '../../api/products.api';
import { searchImages, ImageResult } from '../../api/external/imageSearch';
import config from '../../config/api';
import {
  useUserRequests, usePendingProducts, useApproveUser, useAllUsers,
  useCategories, useSubcategories,
  useAddCategory, useUpdateCategory, useDeleteCategory,
  useAddSubcategory, useUpdateSubcategory, useDeleteSubcategory,
  useProposals, useApproveProposal, useRejectProposal,
  useApproveProductImage, useRejectProductImage,
  queryKeys,
} from '../../hooks/queries';
import './Admin.scss';

// ─── Orphan repair panel ──────────────────────────────────────────────────────
const OrphanRepairPanel = () => {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [orphans, setOrphans] = useState<OrphanRow[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    setScanned(false);
    try {
      const result = await getOrphanRows();
      setOrphans(Array.isArray(result?.orphans) ? result.orphans : []);
      setScanned(true);
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteOrphanRow(id);
      setOrphans(prev => prev.filter(o => o._id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      await Promise.all(orphans.map(o => deleteOrphanRow(o._id)));
      setOrphans([]);
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="orphan-panel">
      <div className="orphan-panel__header">
        <BugRegular className="orphan-panel__icon" />
        <div>
          <div className="orphan-panel__title">{t('admin.orphans.title')}</div>
          <div className="orphan-panel__desc">{t('admin.orphans.description')}</div>
        </div>
      </div>

      <div className="orphan-panel__actions">
        <Button
          text={scanning ? t('admin.orphans.scanning') : t('admin.orphans.scan')}
          size="sm"
          variant="outline"
          loading={scanning}
          onClick={handleScan}
        />
        {scanned && orphans.length > 1 && (
          <Button
            text={t('admin.orphans.deleteAll')}
            size="sm"
            variant="secondary"
            loading={deletingAll}
            onClick={handleDeleteAll}
          />
        )}
      </div>

      {scanned && orphans.length === 0 && (
        <div className="orphan-panel__empty">{t('admin.orphans.none')}</div>
      )}

      {orphans.length > 0 && (
        <>
          <div className="orphan-panel__count">
            {t('admin.orphans.found', { count: orphans.length })}
          </div>
          <table className="orphan-panel__table">
            <thead>
              <tr>
                <th>{t('admin.orphans.userId')}</th>
                <th>{t('admin.orphans.itemId')}</th>
                <th>{t('admin.orphans.reason')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orphans.map(row => (
                <tr key={row._id}>
                  <td>{row.user_id}</td>
                  <td>{row.item_id}</td>
                  <td>
                    <span className={`orphan-panel__badge orphan-panel__badge--${row._reason}`}>
                      {row._reason === 'unknown_user'
                        ? t('admin.orphans.reasonUnknownUser')
                        : t('admin.orphans.reasonUnknownItem')}
                    </span>
                  </td>
                  <td>
                    <Button
                      text={t('common.delete')}
                      size="sm"
                      variant="secondary"
                      loading={deletingId === row._id}
                      onClick={() => handleDelete(row._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

// ─── Duplicate products panel ────────────────────────────────────────────────

interface DuplicateGroup {
  name: string;
  products: Product[];
  keepId: string | undefined;   // _id to keep
  ownedIds: Set<number>;        // item.id values that have user_items rows
}

const DuplicateProductsPanel = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const buildGroups = (products: Product[], ownedItemIds: Set<number>): DuplicateGroup[] => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const key = (p.name ?? '').trim().toLowerCase();
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    const result: DuplicateGroup[] = [];
    for (const [, group] of map) {
      if (group.length < 2) continue;
      const ownedIds = new Set(group.filter(p => ownedItemIds.has(p.id ?? -1)).map(p => p.id!));
      // Priority: 1) has owners, 2) has image, 3) lowest id
      const withOwners = group.find(p => ownedIds.has(p.id ?? -1));
      const withImage = group.find(p => !!p.image_key);
      const keepId = (withOwners ?? withImage ?? group.reduce((a, b) => ((a.id ?? 0) < (b.id ?? 0) ? a : b)))._id;
      result.push({ name: group[0].name ?? '', products: group, keepId, ownedIds });
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleScan = async () => {
    setScanning(true);
    setScanned(false);
    try {
      const { getProducts, getUserProducts } = await import('../../api/products.api');
      const [all, userItems] = await Promise.all([
        getProducts(),
        // Fetch all user_items to know which catalog ids have owners
        // We fetch for a synthetic "all" by using a direct API call
        fetch(`${(await import('../../config/api')).default.server}user_items?q={}`, {
          headers: { 'x-apikey': (await import('../../config/api')).default.headers['x-apikey'] },
        }).then(r => r.json()).catch(() => []),
      ]);
      const ownedItemIds = new Set<number>((userItems as Array<{item_id: number}>).map(u => u.item_id));
      setGroups(buildGroups(all, ownedItemIds));
      setScanned(true);
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async (_id: string, groupName: string) => {
    setDeletingId(_id);
    try {
      const { deleteProduct } = await import('../../api/products.api');
      await deleteProduct(_id);
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.pending() });
      setGroups(prev => {
        const next = prev
          .map(g =>
            g.name.toLowerCase() === groupName.toLowerCase()
              ? { ...g, products: g.products.filter(p => p._id !== _id) }
              : g
          )
          .filter(g => g.products.length > 1);
        return next;
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllDuplicates = async () => {
    setDeletingAll(true);
    try {
      const { deleteProduct } = await import('../../api/products.api');
      const toDelete: string[] = [];
      for (const g of groups) {
        for (const p of g.products) {
          if (p._id && p._id !== g.keepId) toDelete.push(p._id);
        }
      }
      await Promise.all(toDelete.map(id => deleteProduct(id)));
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.pending() });
      setGroups([]);
    } finally {
      setDeletingAll(false);
    }
  };

  const totalDuplicates = groups.reduce((acc, g) => acc + g.products.length - 1, 0);

  return (
    <div className="orphan-panel">
      <div className="orphan-panel__header">
        <BugRegular className="orphan-panel__icon" />
        <div>
          <div className="orphan-panel__title">{t('admin.duplicates.title')}</div>
          <div className="orphan-panel__desc">{t('admin.duplicates.description')}</div>
        </div>
      </div>

      <div className="orphan-panel__actions">
        <Button
          text={scanning ? t('admin.orphans.scanning') : t('admin.duplicates.scan')}
          size="sm"
          variant="outline"
          loading={scanning}
          onClick={handleScan}
        />
        {scanned && totalDuplicates > 0 && (
          <Button
            text={t('admin.duplicates.deleteAll', { count: totalDuplicates })}
            size="sm"
            variant="secondary"
            loading={deletingAll}
            onClick={handleDeleteAllDuplicates}
          />
        )}
      </div>

      {scanned && groups.length === 0 && (
        <div className="orphan-panel__empty">{t('admin.duplicates.none')}</div>
      )}

      {groups.length > 0 && (
        <>
          <div className="orphan-panel__count">
            {t('admin.duplicates.found', { groups: groups.length, count: totalDuplicates })}
          </div>
          {groups.map(group => (
            <div key={group.name} className="admin__dup-group">
              <div className="admin__dup-group-name">{group.name}</div>
              <table className="orphan-panel__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('admin.category')}</th>
                    <th>{t('admin.subcategory')}</th>
                    <th>{t('admin.duplicates.image')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {group.products.map(p => {
                    const isKeep = p._id === group.keepId;
                    const isOwned = group.ownedIds.has(p.id ?? -1);
                    return (
                      <tr key={p._id} className={isKeep ? 'admin__dup-row--keep' : ''}>
                        <td>{p.id}</td>
                        <td>{p.category_id}</td>
                        <td>{p.subcategory_id}</td>
                        <td>
                          {p.image_key
                            ? <span className="admin__dup-badge admin__dup-badge--yes">✓</span>
                            : <span className="admin__dup-badge admin__dup-badge--no">–</span>}
                        </td>
                        <td>
                          {isOwned && !isKeep && (
                            <span className="admin__dup-badge admin__dup-badge--owned" title={t('admin.duplicates.ownedWarning')}>
                              {t('admin.duplicates.owned')}
                            </span>
                          )}
                          {isKeep
                            ? <span className="admin__dup-badge admin__dup-badge--keep">{t('admin.duplicates.keep')}</span>
                            : !isOwned && (
                              <Button
                                text={t('common.delete')}
                                size="sm"
                                variant="secondary"
                                loading={deletingId === p._id}
                                onClick={() => handleDelete(p._id!, group.name)}
                              />
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// ─── Catalog panel ───────────────────────────────────────────────────────────
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

  const [catSearch, setCatSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingSubFor, setAddingSubFor] = useState<number | null>(null);
  const [newSubName, setNewSubName] = useState('');

  type EditTarget = { kind: 'category'; item: Category } | { kind: 'subcategory'; item: Subcategory };
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editName, setEditName] = useState('');

  type DeleteTarget = { kind: 'category'; item: Category } | { kind: 'subcategory'; item: Subcategory };
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleExpand = (id: number) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    return next;
  });

  const subsForCat = (catId: number) =>
    (subcategories as Subcategory[]).filter(s => s.category_id === catId);

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

  // ── Duplicate detection ───────────────────────────────────────────────────
  const isDuplicateCat = newCatName.trim() !== '' &&
    (categories as Category[]).some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase());

  const isDuplicateSub = newSubName.trim() !== '' && addingSubFor !== null &&
    subsForCat(addingSubFor).some(s => s.name.toLowerCase() === newSubName.trim().toLowerCase());

  const isDuplicateEdit = !!editTarget && editName.trim() !== '' && (() => {
    if (editTarget.kind === 'category') {
      return (categories as Category[]).some(
        c => c._id !== editTarget.item._id && c.name.toLowerCase() === editName.trim().toLowerCase()
      );
    }
    const sub = editTarget.item as Subcategory;
    return subsForCat(sub.category_id!).some(
      s => s._id !== sub._id && s.name.toLowerCase() === editName.trim().toLowerCase()
    );
  })();

  const filteredCats = catSearch.trim()
    ? (categories as Category[]).filter(c =>
        c.name.toLowerCase().includes(catSearch.trim().toLowerCase())
      )
    : (categories as Category[]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddCategory = () => {
    if (!newCatName.trim() || isDuplicateCat) return;
    addCategory.mutate(
      { id: nextCatId(), name: newCatName.trim() },
      { onSuccess: () => { setNewCatName(''); setShowAddCat(false); } }
    );
  };

  const handleAddSubcategory = (catId: number) => {
    if (!newSubName.trim() || isDuplicateSub) return;
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
    if (!editTarget || !editName.trim() || !editTarget.item._id || isDuplicateEdit) return;
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

      {/* ── Top bar ── */}
      <div className="catalog-panel__topbar">
        <input
          className="catalog-panel__search"
          type="text"
          placeholder={t('admin.catalog.searchPlaceholder')}
          value={catSearch}
          onChange={e => setCatSearch(e.target.value)}
        />
        <Button
          text={t('admin.catalog.addCategory')}
          icon={<Add20Regular />}
          size="sm"
          onClick={() => { setShowAddCat(true); setNewCatName(''); }}
        />
      </div>

      {/* ── Category tree ── */}
      <div className="catalog-panel__tree">
        {filteredCats.length === 0 && (
          <div className="catalog-panel__empty-msg">{t('admin.catalog.noResults')}</div>
        )}
        {filteredCats.map(cat => (
          <div key={cat.id} className="catalog-panel__cat-row">

            <div className="catalog-panel__cat-header" onClick={() => toggleExpand(cat.id)}>
              <button
                className="catalog-panel__expand-btn"
                aria-label={expanded.has(cat.id) ? t('common.collapse') : t('common.expand')}
                onClick={e => { e.stopPropagation(); toggleExpand(cat.id); }}
              >
                {expanded.has(cat.id) ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
              </button>
              <Folder20Regular className="catalog-panel__cat-icon" />
              <span className="catalog-panel__cat-name">{cat.name}</span>
              <span className="catalog-panel__cat-count-badge">{subsForCat(cat.id).length}</span>
              <div className="catalog-panel__row-actions" onClick={e => e.stopPropagation()}>
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

            {expanded.has(cat.id) && (
              <div className="catalog-panel__subs">
                {subsForCat(cat.id).length === 0 && addingSubFor !== cat.id && (
                  <div className="catalog-panel__subs-empty">{t('admin.catalog.noSubcategories')}</div>
                )}
                {subsForCat(cat.id).map(sub => (
                  <div key={sub.id} className="catalog-panel__sub-row">
                    <Tag20Regular className="catalog-panel__sub-icon" />
                    <span className="catalog-panel__sub-name">{sub.name}</span>
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

                {addingSubFor === cat.id ? (
                  <div className="catalog-panel__add-sub-form">
                    <div className="catalog-panel__name-input-wrap">
                      <input
                        className={`catalog-panel__name-input${isDuplicateSub ? ' catalog-panel__name-input--error' : ''}`}
                        autoFocus
                        placeholder={t('admin.catalog.subNamePlaceholder')}
                        value={newSubName}
                        onChange={e => setNewSubName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddSubcategory(cat.id);
                          if (e.key === 'Escape') { setAddingSubFor(null); setNewSubName(''); }
                        }}
                      />
                      {isDuplicateSub && (
                        <span className="catalog-panel__duplicate-warning">{t('admin.catalog.duplicateWarning')}</span>
                      )}
                    </div>
                    <div className="catalog-panel__add-sub-actions">
                      <Button
                        text={t('common.add')}
                        size="sm"
                        loading={addSubcategory.isPending}
                        disabled={!newSubName.trim() || isDuplicateSub}
                        onClick={() => handleAddSubcategory(cat.id)}
                      />
                      <Button
                        text={t('common.cancel')}
                        size="sm"
                        variant="ghost"
                        onClick={() => { setAddingSubFor(null); setNewSubName(''); }}
                      />
                    </div>
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

      {/* ── Add category modal ── */}
      {showAddCat && (
        <Modal
          title={t('admin.catalog.addCategory')}
          onClose={() => { setShowAddCat(false); setNewCatName(''); }}
          actions={<>
            <Button
              text={t('common.add')}
              loading={addCategory.isPending}
              disabled={!newCatName.trim() || isDuplicateCat}
              onClick={handleAddCategory}
            />
            <Button
              text={t('common.cancel')}
              variant="outline"
              onClick={() => { setShowAddCat(false); setNewCatName(''); }}
            />
          </>}
        >
          <div className="catalog-panel__modal-field">
            <input
              className={`catalog-panel__name-input${isDuplicateCat ? ' catalog-panel__name-input--error' : ''}`}
              autoFocus
              placeholder={t('admin.catalog.catNamePlaceholder')}
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }}
            />
            {isDuplicateCat && (
              <span className="catalog-panel__duplicate-warning">{t('admin.catalog.duplicateWarning')}</span>
            )}
          </div>
        </Modal>
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
              disabled={!editName.trim() || isDuplicateEdit}
              onClick={confirmEdit}
            />
            <Button text={t('common.cancel')} variant="outline" onClick={() => setEditTarget(null)} />
          </>}
        >
          <div className="catalog-panel__modal-field">
            <input
              className={`catalog-panel__name-input${isDuplicateEdit ? ' catalog-panel__name-input--error' : ''}`}
              autoFocus
              placeholder={t('admin.catalog.namePlaceholder')}
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); }}
            />
            {isDuplicateEdit && (
              <span className="catalog-panel__duplicate-warning">{t('admin.catalog.duplicateWarning')}</span>
            )}
          </div>
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

type AdminTab = 'products' | 'catalog' | 'charts' | 'actions' | 'proposals' | 'users';

// ─── Main Admin component ─────────────────────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: userRequests = [] } = useUserRequests();
  const { data: pendingProducts = [] } = usePendingProducts();
  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();

  const catName = (id?: number) => {
    if (!id) return String(id ?? '');
    const found = (categories as Category[]).find(c => c.id === id);
    return found ? `${found.name} (${id})` : String(id);
  };
  const subName = (id?: number) => {
    if (!id) return String(id ?? '');
    const found = (subcategories as Subcategory[]).find(s => s.id === id);
    return found ? `${found.name} (${id})` : String(id);
  };
  const approveUserMutation = useApproveUser();
  const approveImageMutation = useApproveProductImage();
  const rejectImageMutation = useRejectProductImage();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Bulk image approve
  const [bulkApproving, setBulkApproving] = useState(false);

  // Pending products filter
  const [pendingFilter, setPendingFilter] = useState('');

  // Image suggestion state per product (_id → state)
  type SuggestState = 'idle' | 'loading' | 'results' | 'uploading';
  const [suggestStates, setSuggestStates] = useState<Record<string, SuggestState>>({});
  const [suggestResults, setSuggestResults] = useState<Record<string, ImageResult[]>>({});
  const [suggestError, setSuggestError] = useState<Record<string, string>>({});
  const [pendingPickImage, setPendingPickImage] = useState<{ product: Product; img: ImageResult } | null>(null);

  const handleSuggestImage = async (product: Product) => {
    if (!product._id) return;
    setSuggestStates(s => ({ ...s, [product._id!]: 'loading' }));
    setSuggestError(e => ({ ...e, [product._id!]: '' }));
    try {
      const results = await searchImages(product.name ?? '');
      setSuggestResults(r => ({ ...r, [product._id!]: results }));
      setSuggestStates(s => ({ ...s, [product._id!]: 'results' }));
    } catch {
      setSuggestError(e => ({ ...e, [product._id!]: t('admin.suggestImageError') }));
      setSuggestStates(s => ({ ...s, [product._id!]: 'idle' }));
    }
  };

  const handlePickImage = async (product: Product, imageUrl: string) => {
    if (!product._id || !product.id || !product.category_id || !product.subcategory_id) return;
    setPendingPickImage(null);
    setSuggestStates(s => ({ ...s, [product._id!]: 'uploading' }));
    try {
      const formData = new FormData();
      formData.append('file', imageUrl);
      formData.append('folder', `products/${product.category_id}/${product.subcategory_id}`);
      formData.append('public_id', String(product.id));
      formData.append('upload_preset', config.cloudinary.uploadPreset);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`,
        formData,
        { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
      );
      const imageKey: string = res.data?.public_id;
      if (imageKey) {
        // Admin directly approves: set image_key, clear pending
        await updateProduct(product._id, { image_key: imageKey, pending_image_key: '' });
        approveImageMutation.mutate({ _id: product._id, pending_image_key: imageKey });
      }
      setSuggestStates(s => ({ ...s, [product._id!]: 'idle' }));
      setSuggestResults(r => ({ ...r, [product._id!]: [] }));
    } catch {
      setSuggestError(e => ({ ...e, [product._id!]: t('admin.suggestUploadError') }));
      setSuggestStates(s => ({ ...s, [product._id!]: 'results' }));
    }
  };

  const handleDirectUpload = async (product: Product, file: File) => {
    if (!product._id || !product.id || !product.category_id || !product.subcategory_id) return;
    setSuggestStates(s => ({ ...s, [product._id!]: 'uploading' }));
    setSuggestError(e => ({ ...e, [product._id!]: '' }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `products/${product.category_id}/${product.subcategory_id}`);
      formData.append('public_id', String(product.id));
      formData.append('upload_preset', config.cloudinary.uploadPreset);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`,
        formData,
        { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
      );
      const imageKey: string = res.data?.public_id;
      if (imageKey) {
        await updateProduct(product._id, { image_key: imageKey, pending_image_key: '' });
        approveImageMutation.mutate({ _id: product._id, pending_image_key: imageKey });
      }
      setSuggestStates(s => ({ ...s, [product._id!]: 'idle' }));
    } catch {
      setSuggestError(e => ({ ...e, [product._id!]: t('admin.suggestUploadError') }));
      setSuggestStates(s => ({ ...s, [product._id!]: 'idle' }));
    }
  };

  // Users tab search
  const [userSearch, setUserSearch] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);

  const productsWithPendingImage = pendingProducts.filter((p: Product) => !!p.pending_image_key);

  // Deduplicate by name (safety net for DB-level duplicates) — keep lowest numeric id
  const _seenProductNames = new Set<string>();
  const productsNeedingImage = (pendingProducts as Product[])
    .filter((p) => !p.pending_image_key)
    .slice()
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
    .filter((p) => {
      const key = (p.name ?? '').trim().toLowerCase();
      if (!key || _seenProductNames.has(key)) return false;
      _seenProductNames.add(key);
      return true;
    });

  const totalNotifications = userRequests.length + productsNeedingImage.length + productsWithPendingImage.length;

  // Bulk approve all pending images
  const handleBulkApprove = async () => {
    setBulkApproving(true);
    try {
      await Promise.all(
        productsWithPendingImage
          .filter((p: Product) => p._id && p.pending_image_key)
          .map((p: Product) =>
            approveImageMutation.mutateAsync({ _id: p._id!, pending_image_key: p.pending_image_key! })
          )
      );
    } finally {
      setBulkApproving(false);
    }
  };

  // Pending products (no image) filter
  const lowerPendingFilter = pendingFilter.trim().toLowerCase();
  const filteredPendingProducts = lowerPendingFilter
    ? productsNeedingImage.filter((p: Product) => p.name?.toLowerCase().includes(lowerPendingFilter))
    : productsNeedingImage;

  // Users tab
  const pendingUsers = (allUsers as User[]).filter((u: User) => u.status === 'pending');
  const lowerUserSearch = userSearch.trim().toLowerCase();
  const sortByPendingFirst = (a: User, b: User) =>
    (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1);
  const filteredUsers = (lowerUserSearch
    ? (allUsers as User[]).filter((u: User) =>
        `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(lowerUserSearch)
      )
    : (allUsers as User[])
  ).slice().sort(sortByPendingFirst);

  const { data: proposals = [] } = useProposals('pending');
  const approveProposalMutation = useApproveProposal();
  const rejectProposalMutation = useRejectProposal();
  const [pendingApproveId, setPendingApproveId] = useState<string | null>(null);
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
  const [pendingApproveImageId, setPendingApproveImageId] = useState<string | null>(null);
  const [pendingRejectImageId, setPendingRejectImageId] = useState<string | null>(null);

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
          <div className="admin__stat-value">{productsWithPendingImage.length}</div>
          <div className="admin__stat-label">{t('admin.pendingImageApprovals')}</div>
        </div>
        <div className="admin__stat-card">
          <div className="admin__stat-value">{productsNeedingImage.length}</div>
          <div className="admin__stat-label">{t('admin.pendingProducts')}</div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="admin__tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'products'}
          className={`admin__tab${activeTab === 'products' ? ' admin__tab--active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          {t('admin.products')}
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
        <button
          role="tab"
          aria-selected={activeTab === 'proposals'}
          className={`admin__tab${activeTab === 'proposals' ? ' admin__tab--active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          {t('admin.proposals')}
          {proposals.length > 0 && (
            <span className="admin__tab-badge">{proposals.length}</span>
          )}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'users'}
          className={`admin__tab${activeTab === 'users' ? ' admin__tab--active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          {t('admin.users')}
          {pendingUsers.length > 0 && (
            <span className="admin__tab-badge">{pendingUsers.length}</span>
          )}
        </button>
      </div>

      {/* ── Tab panels ── */}
      <section className="admin__section">

        {/* Products tab */}
        {activeTab === 'products' && (
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

            {/* Pending image approvals */}
            {productsWithPendingImage.length > 0 && (
              <div className="admin__subsection">
                <h4 className="admin__subsection-title">
                  {t('admin.pendingImageApprovals')}
                  <span className="admin__badge admin__badge--sm">{productsWithPendingImage.length}</span>
                  {productsWithPendingImage.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      text={t('admin.approveAllImages')}
                      loading={bulkApproving}
                      onClick={handleBulkApprove}
                    />
                  )}
                </h4>
                <ul className="admin__list">
                  {productsWithPendingImage.map((product: Product) => (
                    <li key={product._id} className="admin__request admin__image-approval">
                      <div className="admin__image-approval__thumb">
                        <img
                          src={`${config.cloudinary.urlSingle}/w_72,h_72,c_fill/${product.pending_image_key}`}
                          alt={product.name}
                        />
                      </div>
                      <div className="admin__request-info">
                        <span className="admin__request-name">{product.name}</span>
                        <span className="admin__request-meta">
                          ID: {product.id} &nbsp;·&nbsp; {t('admin.category')}: {catName(product.category_id)} &nbsp;·&nbsp; {t('admin.subcategory')}: {subName(product.subcategory_id)}
                        </span>
                      </div>
                      <div className="admin__request-buttons">
                        <Button
                          size="sm"
                          text={pendingApproveImageId === product._id ? '…' : t('admin.approveImage')}
                          loading={pendingApproveImageId === product._id}
                          disabled={!!pendingApproveImageId || !!pendingRejectImageId}
                          onClick={() => {
                            if (!product._id || !product.pending_image_key) return;
                            setPendingApproveImageId(product._id);
                            approveImageMutation.mutate(
                              { _id: product._id, pending_image_key: product.pending_image_key },
                              { onSettled: () => setPendingApproveImageId(null) },
                            );
                          }}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          text={pendingRejectImageId === product._id ? '…' : t('admin.rejectImage')}
                          loading={pendingRejectImageId === product._id}
                          disabled={!!pendingApproveImageId || !!pendingRejectImageId}
                          onClick={() => {
                            if (!product._id) return;
                            setPendingRejectImageId(product._id);
                            rejectImageMutation.mutate(
                              product._id,
                              { onSettled: () => setPendingRejectImageId(null) },
                            );
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Products missing images (no user upload) */}
            {productsNeedingImage.length > 0 && (
              <div className="admin__subsection">
                <h4 className="admin__subsection-title">
                  {t('admin.pendingProducts')}
                  <span className="admin__badge admin__badge--sm">{productsNeedingImage.length}</span>
                </h4>
                <input
                  className="admin__filter-input"
                  type="text"
                  placeholder={t('admin.filterProducts')}
                  value={pendingFilter}
                  onChange={e => setPendingFilter(e.target.value)}
                />
                <ul className="admin__list">
                  {filteredPendingProducts.map((product: Product) => {
                    const pid = product._id ?? String(product.id);
                    const state = suggestStates[pid] ?? 'idle';
                    const results = suggestResults[pid] ?? [];
                    const errMsg = suggestError[pid] ?? '';
                    return (
                      <li key={product.id} className="admin__product-suggest-item">
                        <div className="admin__request admin__request--product">
                          <div className="admin__request-info">
                            <span className="admin__request-name">{product.name}</span>
                            <span className="admin__request-meta">
                              <span className="admin__request-id">ID: {product.id}</span>
                              &nbsp;·&nbsp; {t('admin.category')}: {catName(product.category_id)} &nbsp;·&nbsp; {t('admin.subcategory')}: {subName(product.subcategory_id)}
                            </span>
                          </div>
                          <div className="admin__suggest-row-actions">
                            <Button
                              text={state === 'loading' ? '' : t('admin.suggestImage')}
                              icon={<ImageSearch20Regular />}
                              size="sm"
                              variant="outline"
                              loading={state === 'loading'}
                              disabled={state === 'loading' || state === 'uploading'}
                              onClick={() => handleSuggestImage(product)}
                            />
                            <Button
                              text={state === 'uploading' ? '' : t('admin.uploadImage')}
                              icon={<ArrowUpload20Regular />}
                              size="sm"
                              variant="outline"
                              loading={state === 'uploading'}
                              disabled={state === 'loading' || state === 'uploading'}
                              onClick={() => document.getElementById(`upload-${product.id}`)?.click()}
                            />
                            <input
                              id={`upload-${product.id}`}
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleDirectUpload(product, file);
                                e.target.value = '';
                              }}
                            />
                            <a
                              href={`https://cloudinary.com/console/media_library/search?q=products/${product.category_id}/${product.subcategory_id}/${product.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin__suggest-cloudinary-link"
                              title={t('admin.openCloudinary')}
                            >
                              <ArrowUpRight20Regular />
                            </a>
                          </div>
                        </div>
                        {errMsg && <p className="admin__suggest-error">{errMsg}</p>}
                        {state === 'results' && results.length > 0 && (
                          <div className="admin__suggest-grid">
                            {results.map((img) => (
                              <button
                                key={img.url}
                                className="admin__suggest-thumb"
                                title={img.title}
                                onClick={() => setPendingPickImage({ product, img })}
                                disabled={suggestStates[pid] === 'uploading'}
                              >
                                <img src={img.thumb} alt={img.title} />
                              </button>
                            ))}
                          </div>
                        )}
                        {state === 'uploading' && (
                          <div className="admin__suggest-uploading">
                            <Loading size="sm" /> {t('admin.suggestUploading')}
                          </div>
                        )}
                        {state === 'results' && results.length === 0 && (
                          <p className="admin__suggest-error">{t('admin.suggestNoResults')}</p>
                        )}
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

        {/* Image pick confirmation modal */}
        {pendingPickImage && (
          <Modal
            title={t('admin.suggestConfirmTitle')}
            onClose={() => setPendingPickImage(null)}
            actions={<>
              <Button
                text={t('admin.suggestConfirmApply')}
                onClick={() => handlePickImage(pendingPickImage.product, pendingPickImage.img.url)}
              />
              <Button
                text={t('common.cancel')}
                variant="outline"
                onClick={() => setPendingPickImage(null)}
              />
            </>}
          >
            <div className="admin__suggest-confirm">
              <img
                src={pendingPickImage.img.thumb}
                alt={pendingPickImage.img.title}
                className="admin__suggest-confirm-img"
              />
              <p className="admin__suggest-confirm-name">{pendingPickImage.product.name}</p>
              <p className="admin__suggest-confirm-hint">{t('admin.suggestConfirmHint')}</p>
            </div>
          </Modal>
        )}

        {/* Actions tab */}
        {activeTab === 'actions' && (
          <div className="admin__actions">
            <div className="admin__actions-buttons">
              <Button text={t('products.addProduct')} onClick={() => navigate('/product/add')} size="sm" />
              <Button text={t('admin.addCategory')} onClick={() => navigate('/category/add')} size="sm" variant="outline" />
              <Button text={t('admin.addSubcategory')} onClick={() => navigate('/subcategory/add')} size="sm" variant="outline" />
            </div>
            <OrphanRepairPanel />
            <DuplicateProductsPanel />
          </div>
        )}

        {/* Proposals tab */}
        {activeTab === 'proposals' && (
          <div className="admin__subsection">
            {proposals.length === 0 ? (
              <div className="admin__empty">{t('admin.proposals.empty')}</div>
            ) : (
              <ul className="admin__list">
                {proposals.map((p) => (
                  <li key={p._id} className="admin__request">
                    <div className="admin__request-info">
                      <span className="admin__request-name">{p.name}</span>
                      <span className="admin__request-meta">
                        {t('admin.category')}: {catName(p.category_id)} &nbsp;·&nbsp;
                        {t('admin.proposals.proposedBy')}: {p.proposed_by}
                      </span>
                    </div>
                    <div className="admin__request-buttons">
                      <Button
                        size="sm"
                        text={t('admin.proposals.approve')}
                        loading={pendingApproveId === p._id}
                        disabled={!!pendingApproveId || !!pendingRejectId}
                        onClick={() => {
                          setPendingApproveId(p._id);
                          approveProposalMutation.mutate(
                            { _id: p._id },
                            { onSettled: () => setPendingApproveId(null) },
                          );
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        text={t('admin.proposals.reject')}
                        loading={pendingRejectId === p._id}
                        disabled={!!pendingApproveId || !!pendingRejectId}
                        onClick={() => {
                          setPendingRejectId(p._id);
                          rejectProposalMutation.mutate(
                            { _id: p._id },
                            { onSettled: () => setPendingRejectId(null) },
                          );
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Users tab */}
        {activeTab === 'users' && (
          <div className="admin__users">
            <div className="admin__users-search-row">
              <input
                className="admin__filter-input"
                type="text"
                placeholder={t('admin.usersSearch')}
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              <span className="admin__users-count">{filteredUsers.length} {t('admin.usersTotal')}</span>
            </div>
            {usersLoading ? (
              <Loading />
            ) : (
              <ul className="admin__list">
                {filteredUsers.map((u: User) => (
                  <li key={u._id ?? u.id} className={`admin__request${u.status === 'pending' ? ' admin__request--pending' : ''}`}>
                    <div className="admin__request-info">
                      <span className="admin__request-name">
                        {u.first_name} {u.last_name}
                        {u.status === 'pending' && <span className="admin__request-pending-badge">{t('admin.statusPending')}</span>}
                      </span>
                      <span className="admin__request-meta">
                        {u.email} &nbsp;·&nbsp; ID: {u.id}
                        {u.zip_code && ` · ${u.zip_code}`}
                      </span>
                    </div>
                    <div className="admin__request-buttons">
                      <Button
                        size="sm"
                        variant="secondary"
                        text={t('common.delete')}
                        onClick={() => setConfirmDeleteUser(u)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </section>

      {/* Delete user confirm modal */}
      {confirmDeleteUser && (
        <Modal
          title={t('admin.deleteUserTitle')}
          onClose={() => !deletingUserId && setConfirmDeleteUser(null)}
          disableBackdropClose={!!deletingUserId}
          actions={
            <>
              <Button
                text={t('common.delete')}
                variant="secondary"
                loading={!!deletingUserId}
                onClick={async () => {
                  if (!confirmDeleteUser._id || !confirmDeleteUser.email) return;
                  setDeletingUserId(confirmDeleteUser._id);
                  try {
                    await deleteUser(String(confirmDeleteUser._id), confirmDeleteUser.email);
                    setConfirmDeleteUser(null);
                  } finally {
                    setDeletingUserId(null);
                  }
                }}
              />
              <Button
                text={t('common.cancel')}
                variant="outline"
                onClick={() => setConfirmDeleteUser(null)}
                disabled={!!deletingUserId}
              />
            </>
          }
        >
          <p>{t('admin.deleteUserBody', { name: `${confirmDeleteUser.first_name} ${confirmDeleteUser.last_name}`, email: confirmDeleteUser.email })}</p>
        </Modal>
      )}

    </div>
  );
};

export default Admin;
