import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { find } from 'lodash';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import Media from '../shared/Media';
import State from '../../redux/State';
import TextField from '../shared/TextField';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { updateProductHook } from '../../redux/products/actions';

import './Product.scss';

const Product = (props: any) => {
  const dispatch = useDispatch();
  const { hideOfferButton, product, showCost } = props;
  let categories = useSelector((state: State) => state.categories);
  // let products = useSelector((state: State) => state.products);
  let subcategories = useSelector((state: State) => state.subcategories);
  let user = useSelector((state: State) => state.user);
  // let [id, setId] = useState(null);
  let [cost, setCost] = useState(0.0);
  let [message, setMessage] = useState('');
  let [type, setType] = useState(WarningMessageType.EMPTY);

  const updateCost = (clear: boolean = false) => {
    const updatedCost = clear ? 0 : cost;
    updateProductHook(user.id, product?.id, updatedCost, dispatch, setMessage, setType)
  }

  const renderCost = () => {
    if (product?.cost)
      return (
      <div className="product__cost">
        <div className="product__cost-value">Cost ${product?.cost}</div>
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
            min={0} max={100} onChange={(cost: number) => setCost(cost)} />
          <Button text="Sell" onClick={updateCost}/>
        </div>
      </div>);
    }
  }

  if (!product) return <Loading size="lg" message="Loading product..." />;

  const category = find(categories, c => c.id === product.category);
  const subcategory = find(subcategories, s => s.id === product.subcategory);

  return (
    <div className="product">
      <WarningMessage message={message} type={type} />
      <h3>{ product.name }</h3>
      <hr />
        <Media
          fileName={product.id}
          category={product.category}
          subcategory={product.subcategory}
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
