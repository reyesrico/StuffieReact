import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';

import Dropdown from '../shared/DropDown';
import TextField from '../shared/TextField';
import { AddProductProps } from './types';
import { addStuffStuffier } from '../../services/stuff';
import { addProduct } from '../../redux/products/actions';

import './AddProduct.scss';

class AddProduct extends Component<AddProductProps, any> {
  state = {
    status: 'success',
    name: null,
    file_name: null,
    category: this.props.categories[0],
    product: { name: null },
    subcategory: this.props.subcategories[0],
    stuffStuffier: {},
  };

  componentDidUpdate(prevProps: AddProductProps, prevState: any) {
    const { product, stuffStuffier, name, category, subcategory } = this.state;
    const anyChange = prevState.name !== name ||
                      prevState.category !== category ||
                      prevState.subcategory !== subcategory;
    const isMessage = product && stuffStuffier;

    if(isMessage && anyChange) {
      this.clearState();
    }
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

  render() {
    const { categories, subcategories } = this.props;
    const { product, stuffStuffier } = this.state;

    return (
      <div className="add-product">
        <h3>Add Stuff</h3>
        { product && stuffStuffier && this.renderProductAddedMessage() }
        <hr/>
        <form>
          <div className="add-product__row">
            <label>Name</label>
            <TextField name="name" onChange={(name:string) => this.setState({ name })}/>
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
};

export default connect(null, mapDispatchProps)(AddProduct);
