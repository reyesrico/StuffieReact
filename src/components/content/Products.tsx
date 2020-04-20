import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import { Link } from 'react-router-dom';

import Category from '../types/Category';
import State from '../../redux/State';
import Product from '../types/Product';
import { ProductsProps } from '../sections/types';
import { downloadExcel } from '../helpers/DownloadHelper';
import { isProductsEmpty } from '../helpers/StuffHelper';
import './Products.scss';

class Products extends Component<ProductsProps, any> {
  generateReport = (event: any) => {
    const { products, user } = this.props;

    downloadExcel(products, `${user.first_name}_products`);
  }

  render() {
    const { categories, products, user } = this.props;

    return (
      <div className="products">
        <div className="products__title">
          <h3>{user.first_name} Stuff</h3>
          <div className="products__add-product">
            <Link to={`/product/add`}>Add Product</Link>
          </div>
        </div>
        <hr />
        {isProductsEmpty(products) && (<div>No Stuff! Add Products!</div>)}
        {!isProductsEmpty(products) &&
          (<div>
            {categories.map((category: Category) => {
              if (!products[category.id] || !products[category.id].length) return;

              return (
                <div key={category.id}>
                  <h4>{category.name}</h4>
                  <ul>
                    {map(products[category.id as number], (product: Product) => {
                      return (
                        <li key={`${category.id}_${product.id}`}><Link to={`/product/${product.id}`}>{product.name}</Link></li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
            <hr />
            <button onClick={event => this.generateReport(event)}>Generate Report</button>
          </div>)
        }
      </div>
    );
  }
};

const mapStateToProps = (state: State) => ({
  user: state.user,
  categories: state.categories,
  products: state.products
});

export { Products as ProductsComponent };
export default connect(mapStateToProps, {})(Products);
