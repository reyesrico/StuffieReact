import React from 'react';
import './EmptyState.scss';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`empty-state ${className}`}>
      {icon && (
        <div className="empty-state__icon">
          {icon}
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {action && (
        <div className="empty-state__action">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
