import { forEach, isEmpty, map } from 'lodash';

import Category from '../types/Category';
import ProductsMap from '../types/ProductsMap';
import Product from '../types/Product';

export function mapStuff(stuff: any) {
  return map(stuff, (object: any) => {
    return { id: object.id_stuff };
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
