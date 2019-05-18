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
