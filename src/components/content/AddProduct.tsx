import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';
import { map } from 'lodash';

import Dropdown from '../shared/DropDown';
import TextField from '../shared/TextField';
import { AddProductProps } from '../sections/types';
import { addStuffStuffier, getStuffFromCategories } from '../../services/stuff';
import { addProduct } from '../../redux/products/actions';

import './AddProduct.scss';
import Category from '../types/Category';
import Product from '../types/Product';
import Subcategory from '../types/Subcategory';

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
    const anyChange = prevState.name !== name ||
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

    addProduct({ name, category: category.id, subcategory: subcategory.id, fileName: 'file_name'})
      .then((res:any) => {
        const product = res.data;
        this.setState({ product });
        return addStuffStuffier(user.id, product.id);
      })
      .then((res:any) => {
        const stuffStuffier = res.data;
        this.setState({ stuffStuffier });
      })
      .catch((err:any) => {
        this.setState({ status: 'error' });
        console.log(`Error: ${err}`);
      });
  }

  setProduct() {
    const { user } = this.props;
    const { product } = this.state;

    addStuffStuffier(user.id, product.id).then(res => {
      this.setState({ stuffStuffier: res.data });
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
    getStuffFromCategories(category.id, subcategory.id).then(res => {
      this.setState({ productsByCategories: res.data });
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
    const { product, stuffStuffier, productsByCategories } = this.state;

    console.log(productsByCategories);

    return (
      <div className="add-product">
        <h3>Add Stuff</h3>
        { product && stuffStuffier && this.renderProductAddedMessage() }
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
          { productsByCategories.length > 0 && (
            <div className="add-product__row">
              <label>Product</label>
              <Dropdown onChange={(product: Product) => this.setState({ product })} values={productsByCategories} />
            </div>
          )}
          <hr />
          <button onClick={event => event && this.setProduct()}>Send</button>
          <hr />
          {/* <div>Create New Product</div>
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
          <hr /> */}
          <button onClick={event => this.createProduct(event)}>Send</button>
        </form>
      </div>
    );
  }
};

const mapDispatchProps = {
  addProduct,
};

export default connect(null, mapDispatchProps)(AddProduct);
