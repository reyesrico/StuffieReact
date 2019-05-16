import React, { Component } from 'react';

class TextField extends Component {
  render() {
    const { name, onChange } = this.props;

    return (
      <div>
        <input
          type="text"
          name={name}
          onChange={event => onChange(event.target.value)}
        />
      </div>
    );
  }
}

export default TextField;
