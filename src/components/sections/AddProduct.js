import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';

import Dropdown from '../shared/DropDown';
import TextField from '../shared/TextField';
import { fetchCategories } from '../../redux/categories/actions';
import { fetchSubCategories } from '../../redux/subcategories/actions';
import { addStuff, addStuffStuffier } from '../../services/stuff';

import './AddProduct.css';

class AddProduct extends Component {
  state = {
    status: 'success',
    name: null,
    file_name: null,
    category: null,
    categories: null,
    product: null,
    subcategory: null,
    subcategories: null,
    stuffStuffier: null,
  };

  componentDidMount() {
    this.fetchData();
  }

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

  fetchData = () => {
    const { fetchCategories, fetchSubCategories } = this.props;
    const { categories, subcategories } = this.state;

    if (!categories) {
      fetchCategories().then(res => {
        this.setState({ categories: res.data });
      });  
    }

    if (!subcategories) {
      fetchSubCategories().then(res => {
        this.setState({ subcategories: res.data });
      });  
    }
  }

  createProduct = event => {
    const { history } = this.props;
    const { name, category, subcategory } = this.state;

    if (!name || !category || !subcategory) return;

    event.preventDefault();

    addStuff(name, category.id, subcategory.id, 'file_name')
      .then(res => {
        const product = res.data;
        this.setState({ product });
        return addStuffStuffier(1, product.id);
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
      category: null,
      subcategory: null,
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
    const { categories, subcategories, product, stuffStuffier } = this.state;
    if (!categories || !subcategories) {
      return <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={50} width={50} />;
    }

    return (
      <div>
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
  fetchCategories,
  fetchSubCategories,
};

export default connect(null, mapDispatchProps)(AddProduct);
