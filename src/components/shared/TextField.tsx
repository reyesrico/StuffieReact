import React, { Component } from 'react';
import { TextFieldProps } from './types';

class TextField extends Component<TextFieldProps> {
  render() {
    const { name, type, value, onChange } = this.props;

    return (
      <div>
        { value !== null && !onChange &&
          <input
            type={type}
            name={name}
            value={value}
          />
        }
        { onChange &&
          <input
            type={type}
            name={name}
            onChange={event => onChange(event.target.value)}
          />
        }
      </div>
    );
  }
}

export default TextField;
