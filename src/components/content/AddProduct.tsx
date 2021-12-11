import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { isEmpty } from 'lodash';

import Button from '../shared/Button';
import Category from '../types/Category';
import Dropdown from '../shared/DropDown';
import Product from '../types/Product';
import State from '../../redux/State';
import Subcategory from '../types/Subcategory';
import TextField from '../shared/TextField';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { getProductFromProducts } from '../helpers/StuffHelper';
import { getStuffFromCategories } from '../../services/stuff';
import { addProductHook, addRegisteredProductHook } from '../../redux/products/actions';

import './AddProduct.scss';

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  let user = useSelector((state: State) => state.user);
  let categories = useSelector((state: State) => state.categories);
  let subcategories = useSelector((state: State) => state.subcategories);
  let products = useSelector((state: State) => state.products);

  let [status, setStatus] = useState(WarningMessageType.EMPTY);
  let [name, setName] = useState('');
  // let [file_name, setFileName] = useState(null);
  let [category, setCategory] = useState(categories[0]);
  let [product, setProduct] = useState<any>({ id: null, name: null });
  let [subcategory, setSubcategory] = useState(subcategories[0]);
  let [stuffStuffier, setStuffStuffier] = useState({});
  let [productsByCategories, setProductsByCategories] = useState([]);

  useEffect(() => {
    renderProducts(category, subcategory);
  });

  // useEffect(() => {
  //   renderProducts(category, subcategory);
  // }, [subcategory]);


  const createProduct = () => {
    if (!name || !category || !subcategory) return;

    addProductHook({ name, category: category.id, subcategory: subcategory.id }, user)
      .then((product: Product) => {
        setProduct(product);
        setStuffStuffier(product);
        setStatus(WarningMessageType.SUCCESSFUL);
      })
      .catch(() => {
        const product = { name, category: category.id, subcategory: subcategory.id };
        setProduct(product);
        setStuffStuffier(product);
        setStatus(WarningMessageType.ERROR);
      });
  }

  const registerProduct = () => {
    addRegisteredProductHook(user, product, dispatch).then((p: Product) => {
      setStuffStuffier(p);
      setStatus(WarningMessageType.SUCCESSFUL);
      navigate('/products');
    });
  }

  // const clearState = () => {
  //   setStatus(WarningMessageType.EMPTY);
  //   setName('');
  //   // setFileName(null);
  //   setCategory(categories[0]);
  //   setSubcategory(subcategories[0]);
  //   setProduct({});
  //   setStuffStuffier({});
  // }

  const getMessage = () => {
    const message = status === WarningMessageType.ERROR ? 'was not added' : 'was added successfully!';
    return (product && !isEmpty(stuffStuffier)) ? `Stuff ${product.name} ${message}` : "";
  }

  const renderProducts = (category: Category, subcategory: Subcategory) => {
    getStuffFromCategories(category.id, subcategory.id).then(res => {
      const product = res.data[0];
      const productsByCategories = res.data.filter((p: Product) => p.id && !getProductFromProducts(p.id, products));
      setProductsByCategories(productsByCategories);
      setProduct(product);
    });
  }

  const updateCategory = (category: Category) => {
    renderProducts(category, subcategory);
    setCategory(category);
  }

  const updateSubcategory = (subcategory: Subcategory) => {
    renderProducts(category, subcategory);
    setSubcategory(subcategory);
  }

  return (
    <div className="add-product">
      <h3>Add Stuff</h3>
      <WarningMessage message={getMessage()} type={status} />
      <hr />
      <form>
        <div>Select Product</div>
        <div className="add-product__row">
          <label>Category</label>
          <Dropdown onChange={(category: any) => updateCategory(category)} values={categories} />
        </div>
        <div className="add-product__row">
          <label>SubCategory</label>
          <Dropdown onChange={(subcategory: any) => updateSubcategory(subcategory)} values={subcategories} />
        </div>
        {!productsByCategories.length && <div>There are no products</div>}
        {productsByCategories.length > 0 && (
          <div className="add-product__row">
            <label>Product</label>
            <Dropdown onChange={(product: Product) => setProduct(product)} values={productsByCategories} />
          </div>
        )}
        <hr />
        <Button text="Add Product" disabled={!(category && subcategory && product && product.name)}
          onClick={() => registerProduct()}>
        </Button>
        <hr />
        <div>Create New Product</div>
        <div className="add-product__row">
          <label>Name</label>
          <TextField name="name" type="text" onChange={(name: string) => setName(name)} />
        </div>
        <div className="add-product__row">
          <label>Category</label>
          <Dropdown onChange={(category: any) => setCategory(category)} values={categories} />
        </div>
        <div className="add-product__row">
          <label>SubCategory</label>
          <Dropdown onChange={(subcategory: any) => setSubcategory(subcategory)} values={subcategories} />
        </div>
        <hr />
        <Button onClick={() => createProduct()} text="Send"></Button>
      </form>
    </div>
  );
}

export default AddProduct;
