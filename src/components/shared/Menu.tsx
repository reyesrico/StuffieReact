import React, { useState } from 'react';
import { MenuProps } from './types';

import './Menu.scss';

const Menu = (props: MenuProps) => {
  const { label, children } = props;
  let [isOpen, setIsOpen] = useState(false);

  const handleClickOutside = () => {
    setIsOpen(false);
  }

  const open = () => {
    setIsOpen(true);
  }

  const toggle = () => {
    setIsOpen(!isOpen);
  }

  return (
    <div className="dropdown">
      <div className="dropdown__label" onClick={toggle}>
        {label(isOpen)}
      </div>
      <div className="dropdown__content-container">
        <div className={`dropdown__content ${isOpen ? 'dropdown--is-open' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Menu;
