import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Button from '../shared/Button';
import Product from '../content/Product';
import ProductType from '../types/Product';
import State from '../../redux/State';
import WarningMessage from '../shared/WarningMessage';
import { LoanProps } from './types';
import { WarningMessageType } from '../shared/types';
import { getStuffiers } from '../../services/stuffier';
import { loanRequest } from '../../redux/loan-requests/actions';

import './Loan.scss';

class Loan extends Component<LoanProps, any> {
  _isMounted = false;

  state = {
    friend: { first_name: '' },
    message: '',
    type: WarningMessageType.EMPTY
  }

  componentDidMount() {
    const { history, location } = this.props;
    const product: ProductType = location.product;
    this._isMounted = true;

    if (this._isMounted) {
      if (!product || product === undefined) {
        history.push('/');
      }
  
      getStuffiers([{ id: location.friend }])
      .then((res: any) => this.setState({ friend: res.data[0] }));  
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  requestLoan = () => {
    const { loanRequest, location, user } = this.props;
    const idOwner = location.friend;

    loanRequest(idOwner, location.product.id, user.id)
    .then(() => this.setState({ message: 'Exchange request successfully', type: WarningMessageType.SUCCESSFUL }))
    .catch(() => this.setState({ message: 'Exchange request failed', type: WarningMessageType.SUCCESSFUL }))
  }

  render() {
    const { location } = this.props;
    const { friend, message, type } = this.state; 
    const product = location.product;

    if (!product) return <Redirect to='/' />

    const match = { params: { id: product.id } };

    return (
      <div className="loan">
        <WarningMessage message={message} type={type} />
        <div className="loan__product">
          <h2>{friend?.first_name} Product</h2>
          <hr />
          <Product match={match} key={product.id} product={product} />
        </div>
        <Button type="submit" onClick={this.requestLoan} text="Request To Borrow" />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  categories: state.categories,
  products: state.products,
  subcategories: state.subcategories,
  user: state.user
});

const mapDispatchProps = {
  loanRequest
};


export default connect(mapStateToProps, mapDispatchProps)(withRouter<any, React.ComponentClass<any>>(Loan));
