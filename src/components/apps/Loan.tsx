import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Button from '../shared/Button';
import Category from '../types/Category';
import Media from '../shared/Media';
import Product from '../types/Product';
import State from '../../redux/State';
import Subcategory from '../types/Subcategory';
import WarningMessage from '../shared/WarningMessage';
import { LoanProps } from './types';
import { WarningMessageType } from '../shared/types';
import { getStuffiers } from '../../services/stuffier';
import { loanRequest } from '../../redux/loan-requests/actions';

import './Loan.scss';

class Loan extends Component<LoanProps, any> {
  state = {
    friend: { first_name: '' },
    message: '',
    type: WarningMessageType.EMPTY
  }

  componentDidMount() {
    const { history, location } = this.props;
    const product: Product = location.product;

    if (!product || product === undefined) {
      history.push('/');
    }


    getStuffiers([{ id: location.friend }])
    .then((res: any) => this.setState({ friend: res.data[0] }));
  }

  requestLoan = () => {
    const { loanRequest, location, user } = this.props;
    const idOwner = location.friend;

    loanRequest(idOwner, location.product.id, user.id)
    .then(() => this.setState({ message: 'Exchange request successfully', type: WarningMessageType.SUCCESSFUL }))
    .catch(() => this.setState({ message: 'Exchange request failed', type: WarningMessageType.SUCCESSFUL }))
  }

  renderProduct(product: Product) {
    const { categories, subcategories } = this.props;

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

  render() {
    const { location } = this.props;
    const { friend, message, type } = this.state; 

    const product = location.product;

    if (!product) return <Redirect to='/' />
  
    return (
      <div className="loan">
        <WarningMessage message={message} type={type} />
        <div className="loan__product">
          <h4>{friend?.first_name} Product</h4>
          {this.renderProduct(product)}
        </div>
        <Button
          type="submit"
          onClick={this.requestLoan}
          text="Request Loan">
        </Button>
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