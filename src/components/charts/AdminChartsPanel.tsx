import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAllUsers, usePendingProducts, useUserRequests } from '../../hooks/queries';
import Loading from '../shared/Loading';

import './AdminChartsPanel.scss';

const COLORS_PIE = ['var(--color-primary-500)', '#e5e7eb'];
const COLORS_ACTIONS = ['#ef4444', '#f59e0b'];

const AdminChartsPanel = () => {
  const { t } = useTranslation();
  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();
  const { data: userRequests = [] } = useUserRequests();
  const { data: pendingProducts = [] } = usePendingProducts();

  if (usersLoading) return <Loading size="sm" />;

  const approvedUsers = allUsers.length - userRequests.length;

  // Pie: approved vs pending users
  const usersPieData = [
    { name: t('charts.admin.approvedUsers'), value: Math.max(0, approvedUsers) },
    { name: t('charts.admin.pendingApprovals'), value: userRequests.length },
  ];

  // Bar: actionable items for admin
  const actionableData = [
    { name: t('charts.admin.userRequests'), count: userRequests.length },
    { name: t('charts.admin.pendingImages'), count: pendingProducts.length },
  ];

  return (
    <div className="admin-charts">

      {/* Stat strip */}
      <div className="admin-charts__stats">
        <div className="admin-charts__stat">
          <span className="admin-charts__stat-value">{allUsers.length}</span>
          <span className="admin-charts__stat-label">{t('charts.admin.totalUsers')}</span>
        </div>
        <div className="admin-charts__stat">
          <span className="admin-charts__stat-value">{userRequests.length}</span>
          <span className="admin-charts__stat-label">{t('charts.admin.pendingApprovals')}</span>
        </div>
        <div className="admin-charts__stat">
          <span className="admin-charts__stat-value">{pendingProducts.length}</span>
          <span className="admin-charts__stat-label">{t('charts.admin.pendingImages')}</span>
        </div>
      </div>

      <div className="admin-charts__grid">
        {/* Pie: user registration health */}
        <div className="admin-charts__card">
          <h4 className="admin-charts__card-title">{t('charts.admin.userRegistration')}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={usersPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={72}
                innerRadius={36}
              >
                {usersPieData.map((_entry, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--background-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar: actionable items */}
        <div className="admin-charts__card">
          <h4 className="admin-charts__card-title">{t('charts.admin.actionableItems')}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={actionableData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--background-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [value, t('charts.items')]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {actionableData.map((_entry, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Cell key={i} fill={COLORS_ACTIONS[i % COLORS_ACTIONS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Future charts note */}
      <p className="admin-charts__future-note">{t('charts.admin.futureNote')}</p>
    </div>
  );
};

export default AdminChartsPanel;
