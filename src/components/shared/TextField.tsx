import React, { Component } from 'react';
import { TextFieldProps } from './types';
import './TextField.scss';

class TextField extends Component<TextFieldProps> {
  render() {
    const { name, placeholder, type, value, onChange, disabled, ref } = this.props;

    return (
      <div className="textfield">
        { value !== null && !onChange &&
          <input
            type={type}
            name={name}
            placeholder={placeholder || ''}
            value={value}
            disabled={disabled}
            ref={ref ? ref : null}
          />
        }
        { onChange &&
          <input
            type={type}
            name={name}
            placeholder={placeholder || ''}
            disabled={disabled}
            onChange={event => onChange(event.target.value)}
            ref={ref ? ref : null}
          />
        }
      </div>
    );
  }
}

export default TextField;
