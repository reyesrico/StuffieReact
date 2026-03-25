import React from 'react';
import './Button.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  type?: 'submit' | 'reset' | 'button';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  text?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const Button = ({
  disabled = false,
  type = 'button',
  text,
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
}: ButtonProps) => {
  const classes = [
    'stuffie-button',
    `stuffie-button--${variant}`,
    `stuffie-button--${size}`,
    fullWidth && 'stuffie-button--full-width',
    disabled && 'stuffie-button--disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="stuffie-button__icon">{icon}</span>}
      {text || children}
    </button>
  );
};

export default Button;
