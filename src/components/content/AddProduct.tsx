import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { withRouter } from 'react-router-dom';

import Button from '../shared/Button';
import Category from '../types/Category';
import Dropdown from '../shared/DropDown';
import Product from '../types/Product';
import State from '../../redux/State';
import Subcategory from '../types/Subcategory';
import TextField from '../shared/TextField';
import { AddProductProps } from '../sections/types';
import { getProductFromProducts } from '../helpers/StuffHelper';
import { getStuffFromCategories } from '../../services/stuff';
import { addRegisteredProduct, addProduct } from '../../redux/products/actions';

import './AddProduct.scss';

class AddProduct extends Component<AddProductProps, any> {
  state = {
    status: 'success',
    name: null,
    file_name: null,
    category: this.props.categories[0],
    product: { id: null, name: null },
    subcategory: this.props.subcategories[0],
    stuffStuffier: {},
    productsByCategories: []
  };

  componentDidMount() {
    this.renderProducts(this.state.category, this.state.subcategory);
  }

  componentDidUpdate(prevProps: AddProductProps, prevState: any) {
    const { product, stuffStuffier, name, category, subcategory } = this.state;
    const anyChange = prevState.product !== product ||
                      prevState.category !== category ||
                      prevState.subcategory !== subcategory;
    const isMessage = product && stuffStuffier;

    // if (isMessage && anyChange) {
    //   this.clearState();
    // }
  }

  createProduct = (event:any) => {
    const { addProduct, user } = this.props;
    const { name, category, subcategory } = this.state;

    if (!name || !category || !subcategory) return;

    event.preventDefault();

    addProduct({ name, category: category.id, subcategory: subcategory.id, fileName: 'file_name'}, user)
      .then((product:Product) => {
        console.log(product);
        this.setState({ product });
      })
      .catch((err:any) => {
        this.setState({ status: 'error' });
        console.log(`Error: ${err}`);
      });
  }

  setProduct() {
    const { addRegisteredProduct, history, user } = this.props;
    const { product } = this.state;

    addRegisteredProduct(user, product).then((p: Product) => {
      this.setState({ stuffStuffier: p });
      history.push('/products');
    });
  }

  clearState = () => {
    this.setState({
      status: 'success',
      name: null,
      file_name: null,
      category: this.props.categories[0],
      subcategory: this.props.subcategories[0],
      product: {},
      stuffStuffier: {},
    });
  }

  renderProductAddedMessage = () => {
    const { status, product } = this.state;
    const message = status === 'error' ? 'was not added' : 'was added successfully!';

    if (product.name) {
      return (
        <div className={`add-product__message-${status}`}>
          Stuff {product.name} {message}
        </div>
      );  
    }
  }

  renderProducts(category: Category, subcategory: Subcategory) {
    const { products } = this.props;

    getStuffFromCategories(category.id, subcategory.id).then(res => {
      const product = res.data[0];
      const productsByCategories = res.data.filter((p: Product) => p.id && !getProductFromProducts(p.id, products));
      this.setState({ productsByCategories, product });
    })
  }

  updateCategory = (category: Category) => {
    this.renderProducts(category, this.state.subcategory);
    this.setState({ category });
  }

  updateSubcategory = (subcategory: Subcategory) => {
    this.renderProducts(this.state.category, subcategory);
    this.setState({ subcategory });
  }

  render() {
    const { categories, subcategories } = this.props;
    const { product, stuffStuffier, productsByCategories, category, subcategory } = this.state;

    return (
      <div className="add-product">
        <h3>Add Stuff</h3>
        { product && !isEmpty(stuffStuffier) && this.renderProductAddedMessage() }
        <hr/>
        <form>
          <div>Select Product</div>
          <div className="add-product__row">
            <label>Category</label>
            <Dropdown onChange={(category: any) => this.updateCategory(category)} values={categories} />
          </div>
          <div className="add-product__row">
            <label>SubCategory</label>
            <Dropdown onChange={(subcategory: any) => this.updateSubcategory(subcategory)} values={subcategories} />
          </div>
          { !productsByCategories.length && <div>There are no products</div>}
          { productsByCategories.length > 0 && (
            <div className="add-product__row">
              <label>Product</label>
              <Dropdown onChange={(product: Product) => this.setState({ product })} values={productsByCategories} />
            </div>
          )}
          <hr />
          <Button text="Add Product" disabled={!(category && subcategory && product && product.name)}
            onClick={() => this.setProduct()}>
          </Button>
          <hr />
          <div>Create New Product</div>
          <div className="add-product__row">
            <label>Name</label>
            <TextField name="name" type="text" onChange={(name:string) => this.setState({ name })}/>
          </div>
          <div className="add-product__row">
            <label>Category</label>
            <Dropdown onChange={(category:any) => this.setState({ category })} values={categories} />
          </div>
          <div className="add-product__row">
            <label>SubCategory</label>
            <Dropdown onChange={(subcategory:any) => this.setState({ subcategory })} values={subcategories} />
          </div>
          <hr />
          <button onClick={event => this.createProduct(event)}>Send</button>
        </form>
      </div>
    );
  }
};

const mapDispatchProps = {
  addProduct,
  addRegisteredProduct,
};

const mapStateToProps = (state: State) => ({
  user: state.user,
  categories: state.categories,
  subcategories: state.subcategories,
  products: state.products
});

export default connect(mapStateToProps, mapDispatchProps)(withRouter<any, React.ComponentClass<any>>(AddProduct));
