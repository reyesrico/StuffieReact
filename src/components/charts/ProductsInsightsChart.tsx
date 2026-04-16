import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type Category from '../types/Category';
import type Product from '../types/Product';
import type ProductsMap from '../types/ProductsMap';

import './ProductsInsightsChart.scss';

// Brand palette — picks a color per category index
const COLORS = [
  'var(--color-primary-500)',
  '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1',
];

interface Props {
  products: ProductsMap;
  categories: Category[];
}

const ProductsInsightsChart = ({ products, categories }: Props) => {
  const { t } = useTranslation();

  // Build chart data — only categories that have at least one product
  const data = categories
    .filter((c: Category) => (products[c.id]?.length ?? 0) > 0)
    .map((c: Category) => {
      const items: Product[] = products[c.id] || [];
      const totalCost = items.reduce((sum, p) => sum + (p.cost ?? 0), 0);
      return {
        name: c.name,
        count: items.length,
        cost: Math.round(totalCost * 100) / 100,
      };
    });

  const hasCostData = data.some(d => d.cost > 0);

  if (data.length === 0) return null;

  return (
    <div className="products-insights">
      <div className="products-insights__charts">
        {/* Bar chart — items per category, horizontal so all names are readable */}
        <div className="products-insights__card">
          <h4 className="products-insights__card-title">{t('charts.itemsByCategory')}</h4>
          <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36 + 24)}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={96}
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
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — spend by category (only when cost data exists) */}
        {hasCostData && (
          <div className="products-insights__card">
            <h4 className="products-insights__card-title">{t('charts.spendByCategory')}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.filter(d => d.cost > 0)}
                  dataKey="cost"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={72}
                  innerRadius={36}
                >
                  {data.filter(d => d.cost > 0).map((_entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--background-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, t('charts.spend')]}
                />
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsInsightsChart;
