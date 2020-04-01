import React, { Component } from 'react';
import { ButtonProps } from './types';
import './Button.scss';

class Button extends Component<ButtonProps, any> {
  render() {
    const { disabled, type, text, onClick } = this.props;

    if(onClick) {
      return (<button className="button" type={type || "button"} onClick={onClick()} disabled={disabled}>{text}</button>); 
    }

    return <button className="button" type={type || "button"} disabled={disabled}>{text}</button>
  }
}

export default Button;
