import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { map } from 'lodash';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import State from '../../redux/State';
import TextField from '../shared/TextField';
import { addCategoryHook } from '../../redux/categories/actions';
import { addSubCategoryHook } from '../../redux/subcategories/actions';

import { AddCategoryProps } from './types';
import './AddCategory.scss';

const TYPE = {
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory'
};

const AddCategory = (props: AddCategoryProps) => {
  const dispatch = useDispatch();
  const { type } = props;

  let categories = useSelector((state: State) => state.categories);
  let subcategories = useSelector((state: State) => state.subcategories);

  let [isLoading, setIsLoading] = useState(false);
  let [id, setId] = useState('');
  let [name, setName] = useState('');
  // let [categoriesS, setCategories] = useState<any>([]);
  // let [subcategoriesS, setSubcategories] = useState<any>([]);
  let [label, setLabel] = useState('');

  useEffect(() => {
    let label = type === 'category' ? 'Category' : 'SubCategory';
    setLabel(label);
  }, [type]);

  const createValue = () => {
    if (type === TYPE.CATEGORY) {
      setIsLoading(true);

      addCategoryHook({ name, id: Number(id) }, dispatch)
        .then((res: any) => {
          // const newCategory = { _id: res.data._id, id: res.data.id, name: res.data.name };
          // setCategories([...categories, newCategory]);
          setName('');
          setId('');
        })
        .finally(() => setIsLoading(false));
    }

    if (type === TYPE.SUBCATEGORY) {
      setIsLoading(true);

      addSubCategoryHook({ name, id: Number(id) }, dispatch)
        .then((res: any) => {
          // const newSubCategory = { _id: res.data._id, id: res.data.id, name: res.data.name };
          // setSubcategories([...subcategories, newSubCategory]);
          setName('');
          setId('');
        })
        .finally(() => setIsLoading(false));
    }
  }

  const renderValues = (typeToRender: string) => {
    const objects = typeToRender === TYPE.CATEGORY ? categories : subcategories;

    return map(objects, (object: any) => {
      return (
        <li className="add-category__item" key={`${typeToRender}_${object.id}`}>
          <span className="add-category__id">({object.id})</span> - {object.name}
        </li>
      );
    });
  }

  if (isLoading) return <Loading size="md" />

  const otherLabel = type !== TYPE.CATEGORY ? 'Category' : 'SubCategory';
  const otherType = type === TYPE.CATEGORY ? TYPE.SUBCATEGORY : TYPE.CATEGORY;

  return (
    <div className="add-category">
      <form>
        <div className="add-category__values">
          <div>
            <h2>{label}</h2>
            <ul className="add-category__list">
              {renderValues(type)}
            </ul>
          </div>
          <div>
            <h2>{otherLabel}</h2>
            <ul className="add-category__list">
              {renderValues(otherType)}
            </ul>
          </div>
        </div>
        <hr />
        <div className="add-category__row">
          <label>Id</label>
          <TextField name="id" type="text" onChange={(e: any) => setId(e.target.value)} />
        </div>
        <div className="add-category__row">
          <label>{label}</label>
          <TextField name="name" type="text" onChange={(e: any) => setName(e.target.value)} />
        </div>
        <hr />
        <Button onClick={() => createValue()} text={"Send"} />
      </form>
    </div>
  );
}

export default AddCategory;
