import React, { useEffect, useState } from 'react';
import { map } from 'lodash';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import TextField from '../shared/TextField';
import { useCategories, useSubcategories, useAddCategory, useAddSubcategory } from '../../hooks/queries';

import { AddCategoryProps } from './types';
import './AddCategory.scss';

const TYPE = {
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory'
};

const AddCategory = (props: AddCategoryProps) => {
  const { type } = props;

  // React Query hooks
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const addCategoryMutation = useAddCategory();
  const addSubcategoryMutation = useAddSubcategory();

  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  // let [categoriesS, setCategories] = useState<any>([]);
  // let [subcategoriesS, setSubcategories] = useState<any>([]);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const labelText = type === 'category' ? 'Category' : 'SubCategory';
    setLabel(labelText);
  }, [type]);

  const createValue = () => {
    if (type === TYPE.CATEGORY) {
      setIsLoading(true);

      addCategoryMutation.mutate(
        { name, id: Number(id) },
        {
          onSuccess: () => {
            setName('');
            setId('');
          },
          onSettled: () => setIsLoading(false),
        }
      );
    }

    if (type === TYPE.SUBCATEGORY) {
      setIsLoading(true);

      addSubcategoryMutation.mutate(
        { name, id: Number(id) },
        {
          onSuccess: () => {
            setName('');
            setId('');
          },
          onSettled: () => setIsLoading(false),
        }
      );
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
