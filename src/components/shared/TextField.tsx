import React from 'react';
import { TextFieldProps } from './types';
import './TextField.scss';

const TextField = (props: TextFieldProps) => {
  const { placeholder, value, onChange, disabled, reference, min, max, containerStyle } = props;
  let range = null;

  if (min || max) {
    range = { min, max };
  }

  const style = React.useMemo(() => {
    return {
      ...containerStyle,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }
  }, [containerStyle]);

  return (
    <div style={style}>
      {value !== null && !onChange &&
        <input
          placeholder={placeholder || ''}
          value={value}
          disabled={disabled}
          ref={reference}
          onChange={onChange}
          {...range}
        />
      }
      {onChange &&
        <input
          placeholder={placeholder || ''}
          disabled={disabled}
          ref={reference}
          value={value}
          onChange={onChange}
          {...range}
        />
      }
    </div>
  );
}

export default TextField;
