import React from 'react';
import './Tabs.scss';

export interface TabItem {
  key: string;
  label: string;
  badge?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

const Tabs = ({ tabs, activeTab, onChange, className }: TabsProps) => (
  <div
    className={`tabs${className ? ` ${className}` : ''}`}
    role="tablist"
  >
    {tabs.map(({ key, label, badge, icon }) => (
      <button
        key={key}
        type="button"
        role="tab"
        aria-selected={activeTab === key}
        className={`tabs__tab${activeTab === key ? ' tabs__tab--active' : ''}`}
        onClick={() => onChange(key)}
      >
        {icon}
        {label}
        {badge !== undefined && badge > 0 && (
          <span className="tabs__badge">{badge}</span>
        )}
      </button>
    ))}
  </div>
);

export default Tabs;
