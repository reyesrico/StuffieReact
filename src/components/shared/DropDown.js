import React, { Component } from 'react';
import { find } from 'lodash';

class DropDown extends Component {
  state = {
    valueSelected: null,
  };

  updateChange = event => {
    const { onChange, values } = this.props;

    const id = Number(event.target.value);
    const object = find(values, value=> value.id === id);

    this.setState({ valueSelected: id });
    onChange(object);
  }

  render() {
    const { values } = this.props;
    const { valueSelected } = this.state;

    const objectSelected = valueSelected ? valueSelected : values[0].id;

    return (
      <select onChange={this.updateChange} value={objectSelected}>
        { 
          values.map(object => {
            return <option key={object.id} value={object.id}>{object.name}</option>;
          })
        }
      </select>
    );
  }
}

export default DropDown;
