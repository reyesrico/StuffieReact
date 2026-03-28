import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Category from '../types/Category';
import Dropdown from '../shared/DropDown';
import Product from '../types/Product';
import Subcategory from '../types/Subcategory';
import TextField from '../shared/TextField';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { getProductFromProducts } from '../helpers/StuffHelper';
import { getProductsByCategory } from '../../api/products.api';
import UserContext from '../../context/UserContext';
import { useCategories, useSubcategories, useProducts, useAddProduct, useAddExistingProduct } from '../../hooks/queries';

import './AddProduct.scss';

const AddProduct = () => {
  const navigate = useNavigate();
  // User context needed for AddProduct mutation
  useContext(UserContext);
  const { t } = useTranslation();

  // React Query hooks
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const { data: products = {} } = useProducts();
  const addProductMutation = useAddProduct();
  const addExistingProductMutation = useAddExistingProduct();

  const [status, setStatus] = useState(WarningMessageType.EMPTY);
  const [name, setName] = useState('');
  // let [file_name, setFileName] = useState(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [product, setProduct] = useState<any>({ id: null, name: null });
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [stuffStuffier, setStuffStuffier] = useState({});
  const [productsByCategories, setProductsByCategories] = useState([]);

  // Set initial category and subcategory when loaded
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]);
    }
    if (subcategories.length > 0 && !subcategory) {
      setSubcategory(subcategories[0]);
    }
  }, [categories, subcategories, category, subcategory]);

  useEffect(() => {
    if (category && subcategory) {
      renderProducts(category, subcategory);
    }
  }, [category, subcategory]);


  const createProduct = () => {
    if (!name || !category || !subcategory) return;

    addProductMutation.mutate(
      { name, category: category.id, subcategory: subcategory.id },
      {
        onSuccess: (newProduct: Product) => {
          setProduct(newProduct);
          setStuffStuffier(newProduct);
          setStatus(WarningMessageType.SUCCESSFUL);
        },
        onError: () => {
          const failedProduct = { name, category: category.id, subcategory: subcategory.id };
          setProduct(failedProduct);
          setStuffStuffier(failedProduct);
          setStatus(WarningMessageType.ERROR);
        },
      }
    );
  }

  const registerProduct = () => {
    addExistingProductMutation.mutate(product, {
      onSuccess: (p: Product) => {
        setStuffStuffier(p);
        setStatus(WarningMessageType.SUCCESSFUL);
        navigate('/products');
      },
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
    const statusMsg = status === WarningMessageType.ERROR ? t('addProduct.notAdded') : t('addProduct.addedSuccess');
    return (product && !isEmpty(stuffStuffier)) ? t('addProduct.statusMessage', { name: product.name, status: statusMsg }) : "";
  }

  const renderProducts = (category: Category, subcategory: Subcategory) => {
    getProductsByCategory(category.id, subcategory.id).then(prods => {
      const product = prods[0];
      const productsByCategories = prods.filter((p: Product) => p.id && !getProductFromProducts(p.id, products));
      setProductsByCategories(productsByCategories as any);
      setProduct(product);
    });
  }

  const updateCategory = (cat: Category) => {
    if (subcategory) {
      renderProducts(cat, subcategory);
    }
    setCategory(cat);
  }

  const updateSubcategory = (subcat: Subcategory) => {
    if (category) {
      renderProducts(category, subcat);
    }
    setSubcategory(subcat);
  }

  return (
    <div className="add-product">
      <h3>{t('addProduct.title')}</h3>
      <WarningMessage message={getMessage()} type={status} />
      <hr />
      <form>
        <div>{t('addProduct.selectProduct')}</div>
        <div className="add-product__row">
          <label>{t('addProduct.categoryLabel')}</label>
          <Dropdown onChange={(category: any) => updateCategory(category)} values={categories} />
        </div>
        <div className="add-product__row">
          <label>{t('addProduct.subcategoryLabel')}</label>
          <Dropdown onChange={(subcategory: any) => updateSubcategory(subcategory)} values={subcategories} />
        </div>
        {!productsByCategories.length && <div>{t('addProduct.noProducts')}</div>}
        {productsByCategories.length > 0 && (
          <div className="add-product__row">
            <label>{t('addProduct.productLabel')}</label>
            <Dropdown onChange={(product: Product) => setProduct(product)} values={productsByCategories} />
          </div>
        )}
        <hr />
        <Button text={t('addProduct.addButton')} disabled={!(category && subcategory && product && product.name)}
          onClick={() => registerProduct()}
        />
        <hr />
        <div>{t('addProduct.createNew')}</div>
        <div className="add-product__row">
          <label>{t('addProduct.nameLabel')}</label>
          <TextField name="name" type="text" onChange={(e: any) => setName(e.target.value)} />
        </div>
        <div className="add-product__row">
          <label>{t('addProduct.categoryLabel')}</label>
          <Dropdown onChange={(category: any) => setCategory(category)} values={categories} />
        </div>
        <div className="add-product__row">
          <label>{t('addProduct.subcategoryLabel')}</label>
          <Dropdown onChange={(subcategory: any) => setSubcategory(subcategory)} values={subcategories} />
        </div>
        <hr />
        <Button onClick={() => createProduct()} text={t('addProduct.send')} />
      </form>
    </div>
  );
}

export default AddProduct;
