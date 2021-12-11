import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get, isEmpty } from 'lodash';

import Button from '../shared/Button';
import Category from '../types/Category';
import Media from '../shared/Media';
import Product from '../types/Product';
import State from '../../redux/State';
import Subcategory from '../types/Subcategory';
import SearchBar from '../shared/SearchBar';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { requestExchangeHook } from '../../redux/exchange-requests/actions';
import { getProductsList } from '../helpers/StuffHelper';
import { getStuffiers } from '../../services/stuffier';

import './Exchange.scss';

const Exchange = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  let categories = useSelector((state: State) => state.categories);
  let products = useSelector((state: State) => state.products);
  let subcategories = useSelector((state: State) => state.subcategories);
  let user = useSelector((state: State) => state.user);
  let [ userProducts, setUserProducts ] = useState<any>([]);
  let [ selectedProduct, setSelectedProduct ] = useState<Product>({});
  let [ message, setMessage ] = useState('');
  let [ friend, setFriend ] = useState({ first_name: ''});
  let [ type, setType ] = useState(WarningMessageType.EMPTY);

  const product: Product = location.state["product"];


  useEffect(() => {
    if (!product || product === undefined) {
      navigate('/');
    }

    const uProducts = getProductsList(products)
      .filter(p => p.category === product.category || p.subcategory === product.subcategory);

    setUserProducts(uProducts);

    getStuffiers([{ id: location.state["friend"] }])
    .then((res: any) => setFriend(res.data[0]));
  }, [userProducts, location.state, navigate, product, products]);

  const requestExchange = () => {
    const idOwner = location.state["friend"];
    console.log('This is to execute request exchange');

    dispatch(
      requestExchangeHook(idOwner, product.id, user.id, get(selectedProduct, 'id'),
                          setMessage, setType, navigate)
    );
  }

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
  }

  const renderProduct = (product: Product) => {
    const category: Category = categories.filter(c => c.id === product.category)[0];
    const subcategory: Subcategory = subcategories.filter(s => s.id === product.subcategory)[0];

    return (
      <div className="exchange__product">
        <Media
          fileName={product.id}
          category={product.category}
          subcategory={product.subcategory}
          format="jpg"
          height="100"
          width="100"
          isProduct="true"
        />
        <div className="exchange__product-info">
          <div>{product.name}</div>
          <div>{category.name}</div>
          <div>{subcategory.name}</div>
        </div>
      </div>
    );
  }

  if (!userProducts.length) return <div>No products to exchange under same category</div>;

  if (!product) {
    navigate('/');
  }

  return (
    <div className="exchange">
      <WarningMessage message={message} type={type} />
      <div className="exchange__header">
        <SearchBar products={userProducts} selectProduct={(p: Product) => selectProduct(p)} />
      </div>
      { !isEmpty(selectedProduct) &&
        <div className="exchange__content">
          <div className="exchange__compare">
            <div className="exchange__compare-info">
              <h4>My Product</h4>
              {renderProduct(selectedProduct)}
            </div>
            <div className="exchange__line"></div>
            <div className="exchange__compare-info">
              <h4>{friend?.first_name} Product</h4>
              {renderProduct(product)}
            </div>
          </div>
          <Button
            type="submit"
            onClick={requestExchange}
            text="Request Exchange">
          </Button>
        </div>
      }
    </div>
  );
}

export default Exchange;
