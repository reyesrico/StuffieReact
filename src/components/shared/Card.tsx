import React from 'react';
import './Card.scss';

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Card = ({
  children,
  variant = 'elevated',
  padding = 'md',
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  header,
  footer,
}: CardProps) => {
  const classes = [
    'stuffie-card',
    `stuffie-card--${variant}`,
    `stuffie-card--padding-${padding}`,
    hoverable && 'stuffie-card--hoverable',
    clickable && 'stuffie-card--clickable',
    className,
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={classes}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {header && (
        <div className="stuffie-card__header">
          {header}
        </div>
      )}
      <div className="stuffie-card__content">
        {children}
      </div>
      {footer && (
        <div className="stuffie-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
