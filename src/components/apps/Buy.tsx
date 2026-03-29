import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Product from '../content/Product';
import WarningMessage from '../shared/WarningMessage';
import { getUsersByIds } from '../../api/users.api';
import { WarningMessageType } from '../shared/types';
import { useCreatePurchase } from '../../hooks/queries';
import UserContext from '../../context/UserContext';

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
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const createPurchaseMutation = useCreatePurchase();

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

  const handleBuy = () => {
    if (!friendId || !product?.id || !user?.id || product?.cost == null) {
      setMessage(t('buy.errorMessage'));
      setType(WarningMessageType.ERROR);
      return;
    }

    createPurchaseMutation.mutate(
      { id_stuffier: friendId, id_stuff: product.id, id_friend: user.id, cost: product.cost },
      {
        onSuccess: () => {
          setMessage(t('buy.successMessage'));
          setType(WarningMessageType.SUCCESSFUL);
          setTimeout(() => navigate('/products'), 1500);
        },
        onError: () => {
          setMessage(t('buy.errorMessage'));
          setType(WarningMessageType.ERROR);
        },
      }
    );
  };

  if (!product) {
    return null;
  }

  return (
    <div className="buy">
      <div className="buy__header">
        <h2 className="buy__title">{t('buy.friendProduct', { name: friend?.first_name })}</h2>
      </div>
      <WarningMessage message={message} type={type} />
      <div className="buy__product">
        <Product match={match} key={product.id} product={product} showCost={true} hideOfferButton={true} />
      </div>
      <Button
        type="submit"
        onClick={handleBuy}
        text={t('buy.requestBuy')}
        disabled={createPurchaseMutation.isPending}
      />
    </div>
  );
};

export default Buy;
