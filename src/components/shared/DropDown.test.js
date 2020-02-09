import React from 'react';
import { shallow } from 'enzyme';
import DropDown from './DropDown';

describe('DropDown', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<DropDown />);
    expect(wrapper.exists()).toEqual(true);
  });
});
