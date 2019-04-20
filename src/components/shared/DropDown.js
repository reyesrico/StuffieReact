import React, { Component } from 'react';

class DropDown extends Component {
  render() {
    const { values } = this.props;

    return (
      <select>
        { 
          values.map(object => {
            return <option key={object.id}>{object.name}</option>;
          })
        }
      </select>
    );
  }
}

export default DropDown;
