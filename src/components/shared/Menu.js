import React, { Component } from 'react';
// import enhanceWithClickOutside from 'react-click-outside';
import './Menu.scss';

class Menu extends Component {
  state = {
    isOpen: false,
  };

  handleClickOutside() {
    this.setState({ isOpen: false });
  }

  open = () => {
    this.setState({ isOpen: true });
  }

  toggle = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    const isOpen = this.state.isOpen ? 'dropdown--is-open' : '';

    return (
      <div className="dropdown">
        <div className="dropdown__label" onClick={this.toggle}>
          {this.props.label(this.state.isOpen)}
        </div>
        <div className="dropdown__content-container">
          <div className={`dropdown__content ${isOpen}`}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export default Menu;
