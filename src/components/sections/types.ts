import Stuff from "../types/Stuff";

export interface ProductState {
  product: Stuff | null;
}

export interface ProductProps {
  fetchProduct: any;
  match: any;
}
