import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
// import { renderHook, act } from '@testing-library/react-hooks';

import { ProductsComponent as Products } from './Products';
import { downloadExcel as downloadExcelMock } from '../helpers/DownloadHelper';
import { UserMock } from '../mocks/UserMock';
import { ProductMock } from '../mocks/ProductMock';
import { CategoryMock } from '../mocks/CategoryMock';
import { ExchangeRequestMock } from '../mocks/ExchangeRequestMock';


jest.mock('../helpers/DownloadHelper');

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react', ()=>({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn()
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const products = {
  [ProductMock.category]: [ProductMock]
};

xdescribe('Products', () => {
  // let setRequestProducts = jest.fn();
  // let wrapper;
  // const setup = () => {
  //   const {result} = renderHook(() => Products(), {
  //       // wrapper: ({children}) => (
  //       //     <Provider store={store}>{children}</Provider>
  //       // )
  //   });
  //   return result;
  // };

  beforeEach(() => {
    useState.mockImplementation(requestedProducts =>[requestedProducts, setRequestProducts]);
    useEffect.mockImplementation(() => {});
    useSelector.mockImplementation((selectorFn) => selectorFn({ user: UserMock, categories: [CategoryMock], products, exchangeRequests: [], loanRequests: [], friends: [] }));
    wrapper = setup();
    // setupComponent = mountReactHook(Products); // Mount a Component with our hook
    // hook = setupComponent.componentHook;
    // m = mount(Products);
  });

  // test('should use custom step when incrementing', () => {
  //   downloadExcelMock.mockReturnThis();
  //   act(() => wrapper.current.generateReport());
  //   expect(downloadExcelMock).toHaveBeenCalled();
  // });
});
