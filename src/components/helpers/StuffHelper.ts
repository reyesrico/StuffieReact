import { find, forEach, isEmpty, map } from 'lodash';

import Category from '../types/Category';
import ProductsMap from '../types/ProductsMap';
import Product from '../types/Product';
import StuffiersStuff from '../types/StuffiersStuff';
import User from '../types/User';

export function mapStuff(stuff: any) {
  return map(stuff, (object: any) => {
    return { id: object.id_stuff };
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
      productsMap[object.category].push(object);
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

export function getFriendProducts(friends: User[], products: Product[], stuffiers_stuff: StuffiersStuff[]) {
  let friendsProducts: User[] = [];

  forEach(friends, friend => {
    const values = stuffiers_stuff.filter((row: StuffiersStuff) => row.id_stuffier === friend.id)
    .map((row: StuffiersStuff) => {
      let product = find(products, (p: Product) => p.id === row.id_stuff);
      return row.cost !== undefined ? { ...product, cost: row.cost } : product ? product : {};
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

export function mapCostToProducts(products: Product[], stuff: StuffiersStuff[]) {
  if (!products || products.length === 0) return {};

  return products.map(p => {
    const extraStuff = stuff.find((s: StuffiersStuff) => s.id_stuff === p.id);
    return extraStuff ? { ...p, cost: extraStuff.cost } : p;
  });
}

export function findProduct(idProduct: number, productsMap: ProductsMap): Product {
  return getProductsList(productsMap).find(p => p.id === idProduct) || {};
}
