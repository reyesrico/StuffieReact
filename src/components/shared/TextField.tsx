import React, { Component } from 'react';
import { TextFieldProps } from './types';
import './TextField.scss';

class TextField extends Component<TextFieldProps> {
  render() {
    const { name, placeholder, type, value, onChange, disabled } = this.props;

    return (
      <div className="textfield">
        { value !== null && !onChange &&
          <input
            type={type}
            name={name}
            placeholder={placeholder || ''}
            value={value}
            disabled={disabled}
          />
        }
        { onChange &&
          <input
            type={type}
            name={name}
            placeholder={placeholder || ''}
            disabled={disabled}
            onChange={event => onChange(event.target.value)}
          />
        }
      </div>
    );
  }
}

export default TextField;
