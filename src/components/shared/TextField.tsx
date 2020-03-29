import React, { Component } from 'react';
import { TextFieldProps } from './types';
import './TextField.scss';

class TextField extends Component<TextFieldProps> {
  render() {
    const { name, placeholder, type, value, onChange } = this.props;

    return (
      <div className="textfield">
        { value !== null && !onChange &&
          <input
            type={type}
            name={name}
            placeholder={placeholder || ''}
            value={value}
          />
        }
        { onChange &&
          <input
            type={type}
            name={name}
            placeholder={placeholder || ''}
            onChange={event => onChange(event.target.value)}
          />
        }
      </div>
    );
  }
}

export default TextField;
