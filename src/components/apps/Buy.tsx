import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';

import Button from '../shared/Button';
import Product from '../content/Product';
import ProductType from '../types/Product';
import WarningMessage from '../shared/WarningMessage';
import { getStuffiers } from '../../services/stuffier';
import { WarningMessageType } from '../shared/types';

import './Buy.scss';

class Buy extends Component<any, any> {
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

  render () {
    const { location } = this.props;
    const { friend, message, type } = this.state;
    const product = location.product;

    if (!product) return <Redirect to='/' />

    const match = { params: { id: product.id } };

    return (
    <div className="buy">
      <WarningMessage message={message} type={type} />
      <div className="buy__product">
        <h2>{friend?.first_name} Product</h2>
        <hr />
        <Product match={match} key={product.id} product={product} showCost={true} hideOfferButton={true} />
      </div>
      <Button type="submit" onClick={() => console.log('submit')} text="Request Buy" />
    </div>
    );
  }
}

export default withRouter<any, React.ComponentClass<any>>(Buy);
