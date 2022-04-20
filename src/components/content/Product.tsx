import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { find, isEmpty } from 'lodash';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import Media from '../shared/Media';
import State from '../../redux/State';
import TextField from '../shared/TextField';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { getProductFromProducts } from '../helpers/StuffHelper';
import { updateProductHook } from '../../redux/products/actions';

import './Product.scss';

const Product = (props: any) => {
  const { hideOfferButton, product, showCost } = props;
  const { id } = useParams();
  const dispatch = useDispatch();
  let categories = useSelector((state: State) => state.categories);
  let subcategories = useSelector((state: State) => state.subcategories);
  let products = useSelector((state: State) => state.products);
  let user = useSelector((state: State) => state.user);
  let [cost, setCost] = useState(0.0);
  let [message, setMessage] = useState('');
  let [type, setType] = useState(WarningMessageType.EMPTY);
  let [category, setCategory] = useState<any>(null);
  let [subcategory, setSubcategory] = useState<any>(null);
  let [productRendered, setProductRendered] = useState<any>(null);

  useEffect(() => {
    if (!isEmpty(products) && !productRendered) {
      let idP = id ? parseInt(id) : product ? product.id : NaN;
      let pRendered = getProductFromProducts(idP, products);
      setProductRendered(pRendered);
    }

    if (!isEmpty(products) && productRendered) {
      let cat = find(categories, c => c.id === productRendered.category);
      setCategory(cat);
      let subcat = find(subcategories, s => s.id === productRendered.subcategory);
      setSubcategory(subcat);
    }
  }, [categories, subcategories, productRendered, products, product, id]);

  const updateCost = (clear: boolean = false) => {
    const updatedCost = clear ? 0 : cost;
    updateProductHook(user.id, productRendered?.id, updatedCost, dispatch, setMessage, setType)
  }

  const renderCost = () => {
    if (product?.cost)
      return (
      <div className="product__cost">
        <div className="product__cost-value">Cost ${productRendered?.cost}</div>
        {!hideOfferButton && (<div className="product__cost-button">
            <Button text="Stop Offer" onClick={() => updateCost(true)} />
        </div>)}
      </div>);
    else {
    return (
      <div className="product__cost">
        <div className="product__cost-text">Want to sell it? Just set a cost! (MAX $100)</div>
        <div className="product__cost-elements">
          $<TextField type="number" name="costTF" value={cost.toString()}
            min={0} max={100} onChange={(e: any) => setCost(e.target.value)} />
          <Button text="Sell" onClick={updateCost}/>
        </div>
      </div>);
    }
  }

  if (!productRendered) return <Loading size="lg" message="Loading product..." />;

  return (
    <div className="product">
      <WarningMessage message={message} type={type} />
      <h3>{ productRendered.name }</h3>
      <hr />
        <Media
          fileName={productRendered.id}
          category={productRendered.category}
          subcategory={productRendered.subcategory}
          isProduct="true"
          height="200"
          width="100" />
      <hr />
      <div>Category: { category && category.name }</div>
      <div>Subcategory: { subcategory && subcategory.name }</div>
      {showCost && renderCost()}
    </div>
  );
};

export default Product;
