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
  const dispatch = useDispatch();

  let [ friend, setFriend ] = useState({ first_name: ''});
  let [ message, setMessage ] = useState('');
  let [ type, setType ] = useState(WarningMessageType.EMPTY);

  let user = useSelector((state: State) => state.user);
  const product = location.state["product"];

  if (!product) {
    navigate('/');
  }

  useEffect(() => {
    if (!product || product === undefined) {
      navigate('/');
    }

    getStuffiers([{ id: location.state["friend"] }])
    .then((res: any) => setFriend(res.data[0]));
  });

  const requestLoan = () => {
    const idOwner = location.state["friend"];
    dispatch(loanRequestHook(idOwner, product.id, user.id, setMessage, setType));
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
}

export default Loan;
