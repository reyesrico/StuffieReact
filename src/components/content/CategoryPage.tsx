import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { map } from 'lodash';

import State from '../../redux/State';
import Stuff from '../types/Stuff';
import Category from '../types/Category';

/* Category ID never will have 5 digits
   Subcategory ID will have 5 digits or more.
*/
const CategoryPage = () => {
  let products = useSelector((state: State) => state.products);
  let categories = useSelector((state: State) => state.categories);
  // let subcategories = useSelector((state: State) => state.subcategories);
  const location = useLocation();


  let { id } = useParams();
  let categoryId = id ? parseInt(id) : -1;
  let category: any = categories.find(c => c.id === categoryId);

  // console.log(location);
  // let name = location.state["category"] || location.state["subcategory"] || '';
  // let categoryId = id.length >= 5 ? parseInt(id[0]) : parseInt(id);

  /*
  // Subcategory Prep
  if (id.length >= 5) {
    categoryId = parseInt(id[0]);
    name = subcategories.find((s: any) => s.id === parseInt(id))?.name;
  }
  */

  const stuff: any = products[category.id];
  const name = category.name;
  return (
    <div className="category-page">
      <h3>{name}</h3>
      <hr />
      {!products && <div>No products</div>}
      <ul>
        {map(stuff, (object: Stuff) => {
          return (
            <li key={object.id}><Link to={`/product/${object.id}`}>{object.name}</Link></li>
          )
        })}
      </ul>
    </div>
  );
}

export default CategoryPage;
