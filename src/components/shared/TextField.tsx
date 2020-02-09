import React, { Component } from 'react';
import { TextFieldProps } from './types';

class TextField extends Component<TextFieldProps> {
  state = {
    value: ''
  }

  render() {
    const { name, type, value, onChange } = this.props;

    return (
      <div>
        { value &&
          <input
            type={type}
            name={name}
            value={value}
            onChange={event => onChange(event.target.value)}
          />
        }
        { !value &&
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
