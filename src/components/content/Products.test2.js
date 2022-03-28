import React from 'react';
import { mount } from 'enzyme';

import { ProductsComponent as Products } from './Products';
import { UserMock } from '../mocks/UserMock';
import { ProductMock } from '../mocks/ProductMock';
import { CategoryMock } from '../mocks/CategoryMock';
import { ExchangeRequestMock } from '../mocks/ExchangeRequestMock';
import { downloadExcel as downloadExcelMock } from '../helpers/DownloadHelper';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

jest.mock('../helpers/DownloadHelper');
const products = {
  [ProductMock.category]: [ProductMock]
};

const mockDispatch = jest.fn();
const mockedUsedNavigate = jest.fn();

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

describe('Products', () => {
  let wrapper;
  let instance;

  beforeEach(() => {
    useSelector.mockImplementation((selectorFn) => selectorFn({ user: UserMock, categories: [CategoryMock], products, exchangeRequests: [], loanRequests: [] }));
    // useNavigate.mockReturnValue(mockedNavigate);
    // useDispatch.mockReturnValue(mockDispatch);
    downloadExcelMock.mockReturnThis();
    wrapper = mount(<Products />);
    console.log(wrapper)
    //instance = wrapper.instance();
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toEqual(true);
  });

  it('should call downloadExcel when generateReport', () => {
    wrapper.generateReport();
    // instance.generateReport(new EventTarget());
    expect(downloadExcelMock).toHaveBeenCalled();
  });
});
