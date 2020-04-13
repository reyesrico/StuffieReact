import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reducersApp from './redux/reducers';
import { createStore, compose } from 'redux';
import { shallow } from 'enzyme';

const store = createStore(reducersApp, compose);

describe('App', () => {
  let wrapper;
  const props = { store };

  beforeEach(() => {
    wrapper = shallow(<App { ...props } />);
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toEqual(true);
  });  
});
