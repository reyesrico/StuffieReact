import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { map } from 'lodash';

import State from '../../redux/State';
import Stuff from '../types/Stuff';
import Media from '../shared/Media';
import { Icon } from '@fluentui/react/lib/Icon';
import './CategoryPage.scss';

const CategoryPage = () => {
  let products = useSelector((state: State) => state.products);
  let categories = useSelector((state: State) => state.categories);
  let { id } = useParams();
  let categoryId = id ? parseInt(id) : -1;
  let category: any = categories.find(c => c.id === categoryId);

  const stuff: any = products[category.id];
  const name = category.name;
  return (
    <div className="category-page">
      <h3>{name}</h3>
      <hr />
      {!products && <div>No products</div>}
      <ul>
        {map(stuff, (product: Stuff) => {
          const match = { params: { id: product.id } };
          return (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{  color: 'inherit', textDecoration: 'inherit' }}
            >
              <div className="category-page__row">
                <div className="category-page__header">
                  <Media
                    fileName={product.id}
                    category={product.category}
                    subcategory={product.subcategory}
                    isProduct="true"
                    height="200"
                    width="100" />
                    <div className="category-page__header-text">
                      <h3>{product.name}</h3>
                      <div>Category: {name}</div>
                    </div>
                </div>
                <div className="category-page__icon">
                  <Icon iconName="ChevronRightMed" />
                </div>
              </div>
            </Link>
          )
        })}
      </ul>
    </div>
  );
}

export default CategoryPage;
