import React, { Component } from 'react';
import { TextFieldProps } from './types';
import './TextField.scss';

class TextField extends Component<TextFieldProps> {
  render() {
    const { name, placeholder, type, value, onChange, disabled, reference, min, max } = this.props;
    let range = null;

    if (min || max) {
      range = { min, max };
    }

    return (
      <div className="textfield">
        { value !== null && !onChange &&
          <input
            type={type}
            name={name}
            placeholder={placeholder || ''}
            value={value}
            disabled={disabled}
            ref={reference}
            {...range}
          />
        }
        { onChange &&
          <input
            type={type}
            name={name}
            placeholder={placeholder || ''}
            disabled={disabled}
            onChange={event => onChange(event.target.value)}
            ref={reference}
            value={value}
            {...range}
          />
        }
      </div>
    );
  }
}

export default TextField;
