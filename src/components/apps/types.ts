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

export interface LoanProps {
  categories: Category[],
  location: any,
  subcategories: Subcategory[],
  products: ProductsMap,
  user: User,
  loanRequest: Function,
  history: any
}

export type CountryDataRow = {
  Active: number,
  City: string,
  CityCode: string,
  Confirmed: number,
  Country: string,
  CountryCode: string,
  Date: string,
  Deaths: number,
  Province: string,
  Recovered: number
}
