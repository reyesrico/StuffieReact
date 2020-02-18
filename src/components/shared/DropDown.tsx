import React, { Component } from 'react';
import { find } from 'lodash';
import { DropDownProps, DropDownState } from './types';

class DropDown extends Component<DropDownProps, DropDownState> {
  state = {
    valueSelected: null,
  };

  updateChange = (event: any) => {
    const { onChange, values } = this.props;

    const id = Number(event.target.value);
    const object = find(values, value=> value.id === id);

    this.setState({ valueSelected: id });
    onChange(object);
  }

  render() {
    const { values } = this.props;
    const { valueSelected } = this.state;

    const value = values ? values[0] ? values[0].id : null: null;
    const objectSelected = valueSelected ? valueSelected : value;

    return (
      <select onChange={this.updateChange} value={objectSelected}>
        { 
          values && values.map((object: any, index: number) => {
            return <option key={index} value={object.id}>{object.name}</option>;
          })
        }
      </select>
    );
  }
}

export default DropDown;
