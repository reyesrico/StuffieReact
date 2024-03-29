import React from 'react';
import { shallow } from 'enzyme';
import Loading, { getSize }from './Loading';

describe('Loading', () => {
  let wrapper;
  // let instance;
  const props = { size: 'md', message: 'message '};

  beforeEach(() => {
    wrapper = shallow(<Loading size={props.size} message={props.message} />);
    // instance = wrapper.instance();
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toEqual(true);
  });

  it('getSize', () => {
    expect(getSize('md')).toEqual(16);
  });
});
