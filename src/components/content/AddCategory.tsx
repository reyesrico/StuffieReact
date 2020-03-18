import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

import Loading from '../shared/Loading';
import TextField from '../shared/TextField';
import { addCategory } from '../../redux/categories/actions';
import { addSubCategory } from '../../redux/subcategories/actions';
import { fetchCategories } from '../../redux/categories/actions';
import { fetchSubCategories } from '../../redux/subcategories/actions';

import { AddCategoryProps } from './types';
import './AddCategory.scss';

const TYPE = {
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory'
};

class AddCategory extends Component<AddCategoryProps, any> {
  state = {
    isLoading: true,
    id: '',
    name: '',
    categories: [],
    subcategories: [],
    tempObjects: null,
  };

  componentDidMount() {
    const { fetchCategories, fetchSubCategories } = this.props;
    const { categories, subcategories } = this.state;

    if (!categories.length) {
      fetchCategories().then((res: any) => {
        this.setState({ categories: res.data, isLoading: false });
      });
    }    

    if (!subcategories.length) {
      fetchSubCategories().then((res: any) => {
        this.setState({ subcategories: res.data, isLoading: false });
      });
    }
  }

  componentDidUpdate(prevProps: any) {
    const { type } = this.props;

    if (prevProps.type === 'subcategory' && type === 'category') {
      this.setState({ label: 'Category' });
    }

    if (prevProps.type === 'category' && type === 'subcategory') {
      this.setState({ label: 'SubCategory' });
    }
  }

  createValue = (event: any) => {
    const { addCategory, addSubCategory, type } = this.props;
    const { categories, subcategories } = this.state;

    event.preventDefault();

    if (type === TYPE.CATEGORY) {
      this.setState({ isLoading: true});

      addCategory({ name: this.state.name, id: Number(this.state.id) })
      .then((res: any) => {
        const newCategory =  { _id: res.data._id, id: res.data.id, name: res.data.name };
        this.setState({
          categories: [ ...categories, newCategory ],
          name: '',
          id: ''
        }); 
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
    }

    if (type === TYPE.SUBCATEGORY) {
      this.setState({ isLoading: true });

      addSubCategory({ name: this.state.name, id: Number(this.state.id) })
      .then((res: any) => {
        const newSubCategory = { _id: res.data._id, id: res.data.id, name: res.data.name };
        this.setState({
          subcategories: [...subcategories, newSubCategory ],
          name: '',
          id: ''
        });

      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
    }
  }

  renderValues = (typeToRender: string) => {
    const { categories, subcategories } = this.state;
    const objects = typeToRender === TYPE.CATEGORY ? categories : subcategories;
  
    return map(objects, (object: any) => {
      return (
        <li className="add-category__item" key={`${typeToRender}_${object.id}`}>
          <span className="add-category__id">({object.id})</span> - {object.name}
        </li>
      );
    });
  }

  render() {
    const { type } = this.props;
    const { isLoading } = this.state;

    if (isLoading) return <Loading size="md" />

    const label = type === TYPE.CATEGORY ? 'Category' : 'SubCategory';
    const otherLabel = type !== TYPE.CATEGORY ? 'Category' : 'SubCategory';
    const otherType = type === TYPE.CATEGORY ? TYPE.SUBCATEGORY : TYPE.CATEGORY;

    return (
      <form>
        <div className="add-category__values">
          <div>
            <h2>{label}</h2>
            <ul className="add-category__list">
              {this.renderValues(type)}
            </ul>
          </div>
          <div>
            <h2>{otherLabel}</h2>
            <ul className="add-category__list">
              {this.renderValues(otherType)}
            </ul>
          </div>
        </div>
        <hr />
        <div className="add-category__row">
          <label>Id</label>
          <TextField name="id" type="text" onChange={(id: string) => this.setState({ id })} />
        </div>
        <div className="add-category__row">
          <label>{label}</label>
          <TextField name="name" type="text" onChange={(name: string) => this.setState({ name })} />
        </div>
        <hr />
        <button onClick={(event: any) => this.createValue(event)}>Send</button>
      </form>
    );
  }
}

const mapDispatchProps = {
  addCategory,
  addSubCategory,
  fetchCategories,
  fetchSubCategories,
};

export default connect(null, mapDispatchProps)(AddCategory);
