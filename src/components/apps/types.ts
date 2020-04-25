import Category from '../types/Category';
import ProductsMap from '../types/ProductsMap';
import Subcategory from '../types/Subcategory';
import User from '../types/User';

export interface TicketsState {
  file: string,
  progressValue: any
}

export interface ExchangeProps {
  categories: Category[],
  exchangeRequest: Function,
  history: any,
  location: any,
  products: ProductsMap,
  subcategories: Subcategory[],
  user: User
}
