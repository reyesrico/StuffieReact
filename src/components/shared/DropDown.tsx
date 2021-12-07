import React, { useState } from 'react';
import { find } from 'lodash';
import { DropDownProps } from './types';

const DropDown = (props: DropDownProps) => {
  const [valueSelected, setValueSelected] = useState<number>();
  const { values } = props;

  const updateChange = (event: any) => {
    const { onChange, values } = props;

    const id = Number(event.target.value);
    const object = find(values, value => value.id === id);

    setValueSelected(id);
    onChange(object);
  }

  const value = values ? values[0] ? values[0].id : null : null;
  const objectSelected = valueSelected ? valueSelected : value;

  return (
    <select onChange={updateChange} value={objectSelected}>
      {
        values && values.map((object: any, index: number) => {
          return <option key={index} value={object.id}>{object.name}</option>;
        })
      }
    </select>
  );
}

export default DropDown;
