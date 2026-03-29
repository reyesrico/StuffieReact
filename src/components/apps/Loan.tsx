import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Product from '../content/Product';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { getUsersByIds } from '../../api/users.api';
import UserContext from '../../context/UserContext';
import { useCreateLoan } from '../../hooks/queries';

import './Loan.scss';

const Loan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const createLoanMutation = useCreateLoan();

  const [friend, setFriend] = useState({ first_name: '' });
  const [message, setMessage] = useState('');
  const [type, setType] = useState(WarningMessageType.EMPTY);
  const { t } = useTranslation();

  const product = (location.state as any)?.["product"];
  const friendId = (location.state as any)?.["friend"];

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

  const requestLoan = () => {
    if (!friendId || !product?.id || !user?.id) return;
    
    createLoanMutation.mutate(
      {
        id_stuffier: friendId,
        id_stuff: product.id,
        id_friend: user.id,
      },
      {
        onSuccess: () => {
          setMessage(t('loan.successMessage'));
          setType(WarningMessageType.SUCCESSFUL);
        },
        onError: () => {
          setMessage(t('loan.errorMessage'));
          setType(WarningMessageType.ERROR);
        },
      }
    );
  };

  if (!product) {
    return null;
  }

  const match = { params: { id: product.id } };

  return (
    <div className="loan">
      <div className="loan__header">
        <h2>{t('loan.friendProduct', { name: friend?.first_name })}</h2>
      </div>
      <WarningMessage message={message} type={type} />
      <div className="loan__product">
        <Product match={match} key={product.id} product={product} />
      </div>
      <div className="loan__actions">
        <Button type="submit" onClick={requestLoan} text={t('loan.requestButton')} />
      </div>
    </div>
  );
};

export default Loan;
