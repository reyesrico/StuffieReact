import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';
import { map } from 'lodash';

import TextField from '../shared/TextField';
import { fetchCategories } from '../../redux/categories/actions';
import { fetchSubCategories } from '../../redux/subcategories/actions';
import { AddCategoryProps } from './types';
import './AddCategory.scss';

class AddCategory extends Component<AddCategoryProps, any> {
  state = {
    isLoading: true,
    name: 'Name',
    categories: null,
    subcategories: null,
    tempObjects: null,
  };

  componentDidMount() {
    const { fetchCategories, fetchSubCategories } = this.props;
    const { categories, subcategories } = this.state;

    if (!categories) {
      fetchCategories().then((res: any) => {
        this.setState({ categories: res.data, isLoading: false });
      });
    }    

    if (!subcategories) {
      fetchSubCategories().then((res: any) => {
        this.setState({ subcategories: res.data, isLoading: false });
      });
    }
  }

  componentDidUpdate(prevProps: any) {
    const { type } = this.props;

    console.log(prevProps.type + " - " + type);
    if (prevProps.type === 'subcategory' && type === 'category') {
      this.setState({ label: 'Category' });
    }

    if (prevProps.type === 'category' && type === 'subcategory') {
      this.setState({ label: 'SubCategory' });
    }
  }

  createValue = (event: any) => {
    const { type } = this.props;
    event.preventDefault();

    if (type === 'category') {
      // Add Category
    }

    if (type === 'subcategory') {
      // Add Subcategory
    }
  }

  renderValues = () => {
    const { type } = this.props;
    const { categories, subcategories } = this.state;

    const objects = type === 'category' ? categories : type === 'subcategory' ? subcategories : null;
  
    return map(objects, (object: any) => {
      return <li key={`${type}_${object.id}`}>{object.name}</li>
    });
  }


  render() {
    const { type } = this.props;
    const { isLoading } = this.state;

    if (isLoading) return <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={50} width={50} />

    const label = type === 'category' ? 'Category' : type === 'subcategory' ? 'SubCategory' : '';
    return (
      <form>
        <div>
          {this.renderValues()}
        </div>
        <hr />
        <div className="add-category__row">
          <label>{label}</label>
          <TextField name="name" type="text" onChange={(name: string) => this.setState({ name })}/>
        </div>
        <hr />
        <button onClick={(event: any) => this.createValue(event)}>Send</button>
      </form>
    );
  }
}

const mapDispatchProps = {
  fetchCategories,
  fetchSubCategories,
};

export default connect(null, mapDispatchProps)(AddCategory);
