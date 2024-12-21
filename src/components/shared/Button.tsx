import React from 'react';
import { ButtonProps } from './types';
import './Button.scss';

const Button = (props: ButtonProps) => {
  const { disabled, type, text, onClick } = props;

  if (onClick) {
    return (<button className="button" type={type || "button"} onClick={onClick} disabled={disabled}>{text}</button>); 
  }

  return <button className="button" type={type || "button"} disabled={disabled}>{text}</button>
}

export default Button;
