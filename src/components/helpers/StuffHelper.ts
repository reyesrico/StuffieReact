import { forEach, isEmpty, map } from 'lodash';

import Category from '../types/Category';
import ProductsMap from '../types/ProductsMap';

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
