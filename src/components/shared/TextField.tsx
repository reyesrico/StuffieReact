import React from 'react';
import './TextField.scss';

export type TextFieldSize = 'sm' | 'md' | 'lg';

export interface TextFieldProps {
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  disabled?: boolean;
  reference?: React.Ref<HTMLInputElement>;
  min?: number;
  max?: number;
  children?: React.ReactNode;
  containerStyle?: React.CSSProperties;
  size?: TextFieldSize;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  className?: string;
}

const TextField = ({
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onKeyPress,
  onBlur,
  disabled = false,
  reference,
  min,
  max,
  containerStyle,
  size = 'md',
  error = false,
  errorMessage,
  label,
  helperText,
  fullWidth = false,
  className = '',
}: TextFieldProps) => {
  const range = min !== undefined || max !== undefined ? { min, max } : {};

  const containerClasses = [
    'stuffie-textfield',
    `stuffie-textfield--${size}`,
    error && 'stuffie-textfield--error',
    disabled && 'stuffie-textfield--disabled',
    fullWidth && 'stuffie-textfield--full-width',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={containerStyle}>
      {label && (
        <label className="stuffie-textfield__label" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="stuffie-textfield__wrapper">
        <input
          className="stuffie-textfield__input"
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onBlur={onBlur}
          disabled={disabled}
          ref={reference}
          {...range}
        />
      </div>
      {(errorMessage || helperText) && (
        <span className={`stuffie-textfield__helper ${error ? 'stuffie-textfield__helper--error' : ''}`}>
          {error ? errorMessage : helperText}
        </span>
      )}
    </div>
  );
};

export default TextField;
