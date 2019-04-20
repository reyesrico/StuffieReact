import React, { Component } from 'react';

class TextField extends Component {
  render() {
    const { hintText, name, onChange, type, value } = this.props;

    return (
      <div>
        <input
          type={type}
          name={name}
          value={value}
          placeholder={hintText}
          onChange={onChange}
        />
      </div>
    );
  }
}

export default TextField;
