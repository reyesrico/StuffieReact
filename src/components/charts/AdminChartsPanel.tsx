import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAllUsers, usePendingProducts, useUserRequests, useCategories, useSubcategories, useApproveUser, useProposals } from '../../hooks/queries';
import Loading from '../shared/Loading';
import Button from '../shared/Button';
import type User from '../types/User';

import './AdminChartsPanel.scss';

// ── Colours ───────────────────────────────────────────────────────────────────
const AUTH_COLORS: Record<string, string> = {
  google:   '#4285F4',
  facebook: '#1877F2',
  apple:    '#1c1c1e',
  email:    '#6b7280',
};

const TOOLTIP_STYLE = {
  background: 'var(--background-elevated)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  fontSize: '12px',
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, alert }: { value: number; label: string; alert?: boolean }) => (
  <div className={`admin-charts__stat${alert && value > 0 ? ' admin-charts__stat--alert' : ''}`}>
    <span className="admin-charts__stat-value">{value}</span>
    <span className="admin-charts__stat-label">{label}</span>
  </div>
);

// ── Auth badge ────────────────────────────────────────────────────────────────
const AuthBadge = ({ provider }: { provider?: string }) => {
  const labels: Record<string, string> = { google: 'G', facebook: 'F', apple: '' };
  const label = provider ? (labels[provider] ?? provider[0].toUpperCase()) : 'E';
  const color = AUTH_COLORS[provider ?? 'email'];
  return (
    <span
      className="admin-charts__auth-badge"
      style={{ background: color }}
      title={provider ?? 'email'}
    >
      {label}
    </span>
  );
};

// ── Main panel ────────────────────────────────────────────────────────────────
const AdminChartsPanel = () => {
  const { t } = useTranslation();
  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();
  const { data: userRequests = [] } = useUserRequests();
  const { data: pendingProducts = [] } = usePendingProducts();
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const { data: proposals = [] } = useProposals('pending');
  const approveUser = useApproveUser();

  // ── Auth breakdown ───────────────────────────────────────────────────────
  const authData = useMemo(() => {
    const counts: Record<string, number> = { google: 0, facebook: 0, apple: 0, email: 0 };
    (allUsers as User[]).forEach(u => {
      const p = u.oauth_provider ?? 'email';
      counts[p] = (counts[p] ?? 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: t(`charts.admin.auth.${name}`), value, key: name }));
  }, [allUsers, t]);

  // ── Subcategories per category (top 12 by count) ─────────────────────────
  const subcatData = useMemo(() => {
    const map: Record<number, { name: string; count: number }> = {};
    (categories as any[]).forEach(c => { map[c.id] = { name: c.name, count: 0 }; });
    (subcategories as any[]).forEach(s => {
      if (map[s.category_id]) map[s.category_id].count++;
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [categories, subcategories]);

  // ── Users sorted: pending first, then alpha ───────────────────────────────
  const pendingIds = useMemo(() => new Set((userRequests as User[]).map(u => u._id ?? u.id)), [userRequests]);
  const sortedUsers = useMemo(() =>
    [...(allUsers as User[])].sort((a, b) => {
      const aPending = pendingIds.has(a._id ?? a.id) ? 0 : 1;
      const bPending = pendingIds.has(b._id ?? b.id) ? 0 : 1;
      if (aPending !== bPending) return aPending - bPending;
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    }),
  [allUsers, pendingIds]);

  if (usersLoading) return <Loading size="sm" />;

  const avgSubcats = categories.length
    ? (subcategories.length / categories.length).toFixed(1)
    : '0';

  return (
    <div className="admin-charts">

      {/* ── Stat strip ─────────────────────────────────────────────────────── */}
      <div className="admin-charts__stats">
        <StatCard value={allUsers.length}       label={t('charts.admin.totalUsers')} />
        <StatCard value={userRequests.length}   label={t('charts.admin.pendingApprovals')} alert />
        <StatCard value={pendingProducts.length} label={t('charts.admin.pendingImages')} alert />
        <StatCard value={(proposals as any[]).length} label={t('charts.admin.pendingProposals')} alert />
        <StatCard value={categories.length}     label={t('charts.admin.totalCategories')} />
        <StatCard value={Number(avgSubcats)}    label={t('charts.admin.avgSubcats')} />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="admin-charts__grid">

        {/* Pie: login method breakdown */}
        <div className="admin-charts__card">
          <h4 className="admin-charts__card-title">{t('charts.admin.authMethods')}</h4>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={authData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={38}>
                {authData.map((entry) => (
                  <Cell key={entry.key} fill={AUTH_COLORS[entry.key] ?? '#9ca3af'} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar: subcategories per category */}
        <div className="admin-charts__card">
          <h4 className="admin-charts__card-title">{t('charts.admin.subcatsPerCategory')}</h4>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={subcatData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, t('charts.admin.subcategories')]} />
              <Bar dataKey="count" fill="var(--color-primary-500)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── User table ─────────────────────────────────────────────────────── */}
      <div className="admin-charts__card">
        <h4 className="admin-charts__card-title">{t('charts.admin.allUsers')}</h4>
        <div className="admin-charts__table-wrap">
          <table className="admin-charts__table">
            <thead>
              <tr>
                <th>{t('charts.admin.col.name')}</th>
                <th>{t('charts.admin.col.email')}</th>
                <th>{t('charts.admin.col.auth')}</th>
                <th>{t('charts.admin.col.location')}</th>
                <th>{t('charts.admin.col.avatar')}</th>
                <th>{t('charts.admin.col.role')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u: User) => {
                const isPending = pendingIds.has(u._id ?? u.id);
                const hasAvatar = !!(u.oauth_avatar || u.picture);
                return (
                  <tr key={u._id ?? u.id} className={isPending ? 'admin-charts__row--pending' : ''}>
                    <td className="admin-charts__name">
                      {u.first_name} {u.last_name}
                      {isPending && <span className="admin-charts__pending-badge">{t('charts.admin.pending')}</span>}
                    </td>
                    <td className="admin-charts__email">{u.email}</td>
                    <td><AuthBadge provider={u.oauth_provider} /></td>
                    <td className={u.zip_code ? 'admin-charts__check' : 'admin-charts__cross'}>
                      {u.zip_code ? `📍 ${u.zip_code}` : '—'}
                    </td>
                    <td className={hasAvatar ? 'admin-charts__check' : 'admin-charts__cross'}>
                      {hasAvatar ? '✓' : '—'}
                    </td>
                    <td>
                      {u.is_admin
                        ? <span className="admin-charts__role-badge admin-charts__role-badge--admin">{t('charts.admin.role.admin')}</span>
                        : <span className="admin-charts__role-badge">{t('charts.admin.role.user')}</span>}
                    </td>
                    <td>
                      {isPending && (
                        <Button
                          text={t('charts.admin.approve')}
                          size="sm"
                          loading={approveUser.isPending}
                          onClick={() => approveUser.mutate(u)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminChartsPanel;
