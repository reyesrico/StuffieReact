import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../shared/Button';
import Product from '../content/Product';
import State from '../../redux/State';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { getStuffiers } from '../../services/stuffier';
import { loanRequestHook } from '../../redux/loan-requests/actions';

import './Loan.scss';

const Loan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: any = useDispatch();

  const [friend, setFriend] = useState({ first_name: '' });
  const [message, setMessage] = useState('');
  const [type, setType] = useState(WarningMessageType.EMPTY);

  const user = useSelector((state: State) => state.user);
  const product = (location.state as any)?.["product"];
  const friendId = (location.state as any)?.["friend"];

  useEffect(() => {
    if (!product) {
      navigate('/');
      return;
    }

    if (friendId) {
      getStuffiers([{ id: friendId }])
        .then((res: any) => setFriend(res.data[0]));
    }
  }, [product, friendId, navigate]);

  const requestLoan = () => {
    if (!friendId || !product?.id || !user?.id) return;
    dispatch(loanRequestHook(friendId, product.id, user.id, setMessage, setType));
  };

  if (!product) {
    return null;
  }

  const match = { params: { id: product.id } };

  return (
    <div className="loan">
      <WarningMessage message={message} type={type} />
      <div className="loan__product">
        <h2>{friend?.first_name} Product</h2>
        <hr />
        <Product match={match} key={product.id} product={product} />
      </div>
      <Button type="submit" onClick={requestLoan} text="Request To Borrow" />
    </div>
  );
};

export default Loan;
