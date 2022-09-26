import React from 'react';
import { TextFieldProps } from './types';
import './TextField.scss';

const TextField = (props: TextFieldProps) => {
  const { placeholder, value, onChange, disabled, reference, min, max, containerStyle } = props;
  let range = null;

  if (min || max) {
    range = { min, max };
  }

  return (
    <div style={containerStyle}>
      {value !== null && !onChange &&
        <input
          placeholder={placeholder || ''}
          value={value}
          disabled={disabled}
          ref={reference}
          {...range}
          {...props}
        />
      }
      {onChange &&
        <input
          placeholder={placeholder || ''}
          disabled={disabled}
          ref={reference}
          value={value}
          {...range}
          {...props}
        />
      }
    </div>
  );
}

export default TextField;
