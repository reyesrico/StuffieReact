import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';

import Dropdown from '../shared/DropDown';
import TextField from '../shared/TextField';
import { addStuff, addStuffStuffier } from '../../services/stuff';
import { addProduct } from '../../redux/products/actions';

import './AddProduct.css';

class AddProduct extends Component {
  state = {
    status: 'success',
    name: null,
    file_name: null,
    category: this.props.categories[0],
    product: null,
    subcategory: this.props.subcategories[0],
    stuffStuffier: null,
  };

  componentDidUpdate(prevProps, prevState) {
    const { product, stuffStuffier, name, category, subcategory } = this.state;
    const anyChange = prevState.name !== name ||
                      prevState.category !== category ||
                      prevState.subcategory !== subcategory;
    const isMessage = product && stuffStuffier;

    if(isMessage && anyChange) {
      this.clearState();
    }
  }

  createProduct = event => {
    const { addProduct, user } = this.props;
    const { name, category, subcategory } = this.state;

    if (!name || !category || !subcategory) return;

    event.preventDefault();

    // addStuff()
    addProduct({ name, category: category.id, subcategory: subcategory.id, fileName: 'file_name'})
      .then(res => {
        const product = res.data;
        this.setState({ product });
        return addStuffStuffier(user.id, product.id);
      })
      .then(res => {
        const stuffStuffier = res.data;
        this.setState({ stuffStuffier });
      })
      .catch(err => {
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
      product: null,
      stuffStuffier: null,
    });
  }

  renderProductAddedMessage = () => {
    const { status, product } = this.state;
    const message = status === 'error' ? 'was not added' : 'was added successfully!';

    return (
      <div className={`add-product__message-${status}`}>
        Stuff {product.name} {message}
      </div>
    );
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
            <TextField name="name" onChange={name => this.setState({ name })}/>
          </div>
          <div className="add-product__row">
            <label>Category</label>
            <Dropdown onChange={category => this.setState({ category })} values={categories} />
          </div>
          <div className="add-product__row">
            <label>SubCategory</label>
            <Dropdown onChange={subcategory => this.setState({ subcategory })} values={subcategories} />
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
