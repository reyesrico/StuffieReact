import Product from '../types/Product';

export default interface User {
  _id?: number,
  id?: number,
  email?: string,
  password_hash?: string,
  first_name?: string,
  last_name?: string,
  is_admin?: boolean,
  status?: 'pending' | 'active',
  products?: Product[]
  picture?: string;
  zip_code?: string;
  lat?: number;
  lng?: number;
}
