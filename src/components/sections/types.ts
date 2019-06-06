import Category from "../types/Category";
import Stuff from "../types/Stuff";
import User from "../types/User";

export interface ProductState {
  product: Stuff | null;
}

export interface ProductProps {
  fetchProduct: any;
  match: any;
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
