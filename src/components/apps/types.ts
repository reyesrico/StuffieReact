import Category from '../types/Category';
import Product from '../types/Product';
import ProductsMap from '../types/ProductsMap';
import Subcategory from '../types/Subcategory';

export interface TicketsState {
  file: string,
  progressValue: any
}

export interface ExchangeProps {
  categories: Category[],
  location: any,
  products: ProductsMap,
  subcategories: Subcategory[]
}
