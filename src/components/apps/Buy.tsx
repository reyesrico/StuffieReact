import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '../shared/Button';
import Product from '../content/Product';
import WarningMessage from '../shared/WarningMessage';
import { getStuffiers } from '../../services/stuffier';
import { WarningMessageType } from '../shared/types';

import './Buy.scss';

const Buy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state["product"];
  const match = { params: { id: product.id } };

  let [friend, setFriend] = useState({ first_name: '' });
  let [message, setMessage] = useState('');
  let [type, setType] = useState(WarningMessageType.EMPTY);

  useEffect(() => {
    if (!product || product === undefined) {
      navigate('/');
    }

    getStuffiers([{ id: location.state["friend"] }])
      .then((res: any) => setFriend(res.data[0]));
  });

  const buy = () => {
    setMessage('Buy');
    setType(WarningMessageType.SUCCESSFUL);
  }

  if (!product) { navigate('/'); }

  return (
    <div className="buy">
      <WarningMessage message={message} type={type} />
      <div className="buy__product">
        <h2>{friend?.first_name} Product</h2>
        <hr />
        <Product match={match} key={product.id} product={product} showCost={true} hideOfferButton={true} />
      </div>
      <Button type="submit" onClick={() => buy()} text="Request Buy" />
    </div>
  );
}

export default Buy;
