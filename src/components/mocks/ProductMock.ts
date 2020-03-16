import { CategoryMock } from './CategoryMock';
import { SubcategoryMock } from './SubcategoryMock';
import Product from '../types/Product';

export const ProductMock: Product = {
  id: 1,
  name: 'Product',
  category: CategoryMock.id,
  subcategory: SubcategoryMock.id,
};
