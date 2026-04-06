import { CategoryMock } from './CategoryMock';
import { SubcategoryMock } from './SubcategoryMock';
import Product from '../types/Product';

export const ProductMock: Product = {
  id: 1,
  name: 'Product',
  category_id: CategoryMock.id,
  subcategory_id: SubcategoryMock.id,
};
