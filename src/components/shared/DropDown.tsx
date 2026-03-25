import React, { useState } from 'react';
import { find } from 'lodash';
import './DropDown.scss';

export interface DropDownProps {
  onChange: (value: any) => void;
  values: any[];
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

const DropDown = ({
  onChange,
  values,
  placeholder,
  disabled = false,
  size = 'md',
  fullWidth = false,
  className = '',
}: DropDownProps) => {
  const [valueSelected, setValueSelected] = useState<number>();

  const updateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(event.target.value);
    const object = find(values, value => value.id === id);

    setValueSelected(id);
    onChange(object);
  };

  const value = values ? values[0]?.id : null;
  const objectSelected = valueSelected ?? value;

  const classes = [
    'stuffie-dropdown',
    `stuffie-dropdown--${size}`,
    fullWidth && 'stuffie-dropdown--full-width',
    disabled && 'stuffie-dropdown--disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <select
        className="stuffie-dropdown__select"
        onChange={updateChange}
        value={objectSelected ?? ''}
        disabled={disabled}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {values?.map((object: any, index: number) => (
          // eslint-disable-next-line react/no-array-index-key
          <option key={index} value={object.id}>
            {object.name}
          </option>
        ))}
      </select>
      <span className="stuffie-dropdown__icon">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </span>
    </div>
  );
};

export default DropDown;
