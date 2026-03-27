import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '../shared/Button';
import Product from '../content/Product';
import WarningMessage from '../shared/WarningMessage';
import { getUsersByIds } from '../../api/users.api';
import { WarningMessageType } from '../shared/types';

import './Buy.scss';

const Buy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = (location.state as any)?.["product"];
  const friendId = (location.state as any)?.["friend"];
  const match = { params: { id: product?.id } };

  const [friend, setFriend] = useState({ first_name: '' });
  const [message, setMessage] = useState('');
  const [type, setType] = useState(WarningMessageType.EMPTY);

  useEffect(() => {
    if (!product) {
      navigate('/');
      return;
    }

    if (friendId) {
      getUsersByIds([{ id: friendId }])
        .then((users) => setFriend(users[0] as any));
    }
  }, [product, friendId, navigate]);

  const buy = () => {
    setMessage('Buy');
    setType(WarningMessageType.SUCCESSFUL);
  };

  if (!product) {
    return null;
  }

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
};

export default Buy;
