import React, { Component } from 'react';
import { connect } from 'react-redux';

import Dropdown from '../shared/DropDown';
import TextField from '../shared/TextField';
import { fetchCategories } from '../../redux/categories/actions';

import './AddProduct.css';

class AddProduct extends Component {
  state = {
    categories: [],
    product: null,
  };

  componentDidMount() {
    const { fetchCategories } = this.props;

    fetchCategories().then(res => {
      this.setState({ categories: res.data });
    });
  }

  createProduct = event => {
    const { history } = this.props;
    history.push('/products');
  }

  render() {
    const { categories } = this.state;

    return (
      <div>
        <h3>Add Stuff</h3>
        <form>
          <div className="add-product__row"><label>Name</label><TextField /></div>
          <div className="add-product__row"><label>Category</label><Dropdown values={categories} /></div>
          <div className="add-product__row"><label>Description</label><TextField /></div>
          <hr />
          <button onClick={event => this.createProduct(event)}>Send</button>
        </form>
      </div>
    );
  }
};

const mapDispatchProps = {
  fetchCategories
};

export default connect(null, mapDispatchProps)(AddProduct);
