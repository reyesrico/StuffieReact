import Product from '../types/Product';

export default interface User {
  _id?: number,
  id?: number,
  email?: string,
  password?: string,
  first_name?: string,
  last_name?: string,
  admin?: boolean,
  products?: Product[]
  picture?: string;
}
