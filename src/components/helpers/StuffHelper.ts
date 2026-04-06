import { find, forEach, isEmpty, map } from 'lodash';

import Category from '../types/Category';
import ProductsMap from '../types/ProductsMap';
import Product from '../types/Product';
import UserItem from '../types/UserItem';
import User from '../types/User';

export function mapStuff(stuff: any) {
  return map(stuff, (object: any) => {
    return { id: object.item_id };
  });
}

export function mapIds(ids: number[]) {
  return map(ids, id => {
    return { id };
  });
}

export function getProductsMap(categories: Category[], objects: any): ProductsMap {
  let productsMap: ProductsMap = {};

  forEach(categories, (category: Category) => {
    productsMap = {
      ...productsMap,
      [category.id as number]: [],
    };
  });

  if (!isEmpty(productsMap)) {
    // Filling products per category
    forEach(objects, (object: any) => {
      productsMap[object.category_id].push(object);
    });
  }

  return productsMap;
}

export function getProductFromProducts(productId: number, products: ProductsMap) {
  const values = Object.values(products);
  let product = null;

  for (let i=0; i < values.length; i++) {
    product = values[i].find((p: Product) => p.id === productId);
    if (product) {
      break;
    }
  }

  return product;
}

export function getFriendProducts(friends: User[], products: Product[], stuffiers_stuff: UserItem[]) {
  const friendsProducts: User[] = [];

  forEach(friends, friend => {
    const values = stuffiers_stuff.filter((row: UserItem) => row.user_id === friend.id)
    .map((row: UserItem) => {
      const product = find(products, (p: Product) => p.id === row.item_id);
      return row.asking_price !== undefined ? { ...product, cost: row.asking_price } : product ? product : {};
    });

    friendsProducts.push({ ...friend, products: values });
  });

  return friendsProducts;
}

export function isProductsEmpty(productsMap: ProductsMap) {
  const products = Object.values(productsMap).filter(row => row.length > 0);
  return !products.length;
}

export function getProductsList(productsMap: ProductsMap): Product[] {
  return Object.values(productsMap).filter(row => row.length > 0).flat();
}

export function mapCostToProducts(products: Product[], stuff: UserItem[]) {
  if (!products || products.length === 0) return {};

  return products.map(p => {
    const extraStuff = stuff.find((s: UserItem) => s.item_id === p.id);
    return extraStuff ? { ...p, cost: extraStuff.asking_price } : p;
  });
}

export function findProduct(idProduct: number, productsMap: ProductsMap): Product {
  return getProductsList(productsMap).find(p => p.id === idProduct) || {};
}
