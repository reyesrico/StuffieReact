import Category from "../types/Category";
import ProductsMap from "../types/ProductsMap";
import Stuff from "../types/Stuff";
import Subcategory from '../types/Subcategory';
import User from "../types/User";

export interface AddProductProps {
  addProduct: any,
  categories: Category[],
  subcategories: Subcategory[],
  user: User,
}

export interface ProductState {
  product: Stuff | null,
  categoryName: string | null,
  subcategoryName: string | null
}

export interface ProductProps {
  fetchProduct: any,
  fetchCategory: any,
  fetchSubCategory: any,
  match: any
}

export interface ProductsProps {
  categories: Category[],
  products: {
    [id: number]: Stuff[],
  },
  user: User,
}

export interface TableDataProps {
  data: any,
}

export interface TableTitleProps {
  title: string,
}

export interface SearchMatchProps {
  title: string,
  match: string,
}

export interface TableProps {
  titles: string[],
  searchTerm: string,
  data: any,
}

export interface SearchProps {
  userInput(event: any): void,
  searchTerm: string,
}

export interface SearchBarProps {
  categories: Category[],
}

export interface MenuProps {
  categories: Category[],
  products: ProductsMap,
  t: Function,
  user: User
}

export interface MenuState {
  
}

export interface HeaderProps {
  products: ProductsMap,
  i18n: any,
  user: User,
  history: any,
  withRouter: Function,
  t: Function,
}

export interface HeaderState {
}
