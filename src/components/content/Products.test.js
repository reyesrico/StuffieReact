import React, { Component } from 'react';
import { shallow } from 'enzyme';

import Products from './Products';
import { UserMock } from '../mocks/UserMock';
import { ProductMock } from '../mocks/ProductMock';
import { CategoryMock } from '../mocks/CategoryMock';
import { downloadExcel as downloadExcelMock } from '../helpers/DownloadHelper';

jest.mock('../helpers/DownloadHelper');

const products = {
  [ProductMock.category]: [ProductMock]
};

describe('Products', () => {
  let wrapper;
  let instance;
  const props = { user: UserMock, categories: [CategoryMock], products };

  beforeEach(() => {
    downloadExcelMock.mockReturnThis();
    wrapper = shallow(<Products {...props} />);
    instance = wrapper.instance();
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toEqual(true);
  });

  it('should call downloadExcel when generateReport', () => {
    instance.generateReport(new EventTarget());
    expect(downloadExcelMock).toHaveBeenCalled();
  });
});
