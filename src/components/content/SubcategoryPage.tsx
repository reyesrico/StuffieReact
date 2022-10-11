import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { map } from 'lodash';

import Media from '../shared/Media';
import State from '../../redux/State';
import Stuff from '../types/Stuff';
import Subcategory from '../types/Subcategory';
import { Icon } from '@fluentui/react/lib/Icon';
import './CategoryPage.scss';
import { useTranslation } from 'react-i18next';

const SubcategoryPage = () => {
  const { t } = useTranslation();
  let products = useSelector((state: State) => state.products);
  let subcategories = useSelector((state: State) => state.subcategories);
  let { id } = useParams();
  let subcategoryId = id ? parseInt(id) : -1;
  let subcategory: Subcategory | undefined = subcategories.find(c => c.id === subcategoryId);

  const stuff = Object.keys(products)
      .filter((categoryId: string) => id?.startsWith(categoryId))
      .reduce((ps: any, categoryId: string) => {
        let psBySub = products[parseInt(categoryId)].filter((p: any) => {
          return p.subcategory === subcategoryId
        });
        return ps.concat(psBySub);
      }, []);

  console.log({ stuff });
  const name = subcategory?.name;

  return (
    <div className="category-page">
      <h3>{t('Subcategory')} {name}</h3>
      <hr />
      {!products && <div>{t('NoProducts')}</div>}
      {!stuff || !stuff.length && <div>{t('NoProducts')}</div>}
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
                      <div>{t('Category')}: {name}</div>
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

export default SubcategoryPage;
