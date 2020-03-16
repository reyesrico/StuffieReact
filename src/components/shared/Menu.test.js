import React from 'react';
import { shallow } from 'enzyme';
import Menu from './Menu';

describe('Menu', () => {
  let wrapper;
  let instance;
  const props = { label: () => {} };

  beforeEach(() => {
    wrapper = shallow(<Menu {...props} />);
    instance = wrapper.instance();
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toEqual(true);
  });

  it('should set state false when handleClickOutside', () => {
    instance.handleClickOutside();
    expect(instance.state.isOpen).toBeFalsy();
  });

  it('should set state true when open', () => {
    instance.open();
    expect(instance.state.isOpen).toBeTruthy();
  });

  it('should toogle state when toggle', () => {
    expect(instance.state.isOpen).toBeFalsy();
    instance.toggle();
    expect(instance.state.isOpen).toBeTruthy();
  });
});
