import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { get, map, uniq } from 'lodash';

import Button from '../shared/Button';
import Category from '../types/Category';
import ExchangeRequest from '../types/ExchangeRequest';
import LoanRequest from '../types/LoanRequest';
import Product from './Product';
import State from '../../redux/State';
import User from '../types/User';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { downloadExcel } from '../helpers/DownloadHelper';
import { deleteRequestHook } from '../../redux/exchange-requests/actions';
import { deleteRequestLoanHook } from '../../redux/loan-requests/actions';
import { getProductsFromIds } from '../../services/stuff';
import { isProductsEmpty } from '../helpers/StuffHelper';
import { mapIds } from '../helpers/StuffHelper';
import { default as ProductType } from '../types/Product';

// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import './Products.scss';

const Products = () => {
  const navigate = useNavigate();

  let user = useSelector((state: State) => state.user);
  let categories = useSelector((state: State) => state.categories);
  let friends = useSelector((state: State) => state.friends);
  let exchangeRequests = useSelector((state: State) => state.exchangeRequests);
  let loanRequests = useSelector((state: State) => state.loanRequests);
  let products = useSelector((state: State) => state.products);
  let [requestedProducts, setRequestProducts] = useState([]);
  let [message, setMessage] = useState('');
  let [type, setType] = useState(WarningMessageType.EMPTY);


  useEffect(() => {
    const loanIds = loanRequests.map((req: any) => req.id_stuff);
    const exchangeIds = exchangeRequests.map((req: any) => req.id_stuff);
    const exchangeFriendIds = exchangeRequests.map((req: any) => req.id_friend_stuff);

    const ids = uniq([...loanIds, ...exchangeIds, ...exchangeFriendIds]);

    getProductsFromIds(mapIds(ids))
      .then(res => setRequestProducts(res.data));
  }, [exchangeRequests, loanRequests]);

  const generateReport = () => {
    downloadExcel(products, `${user.first_name}_products`);
  }

  const executeDeleteExchange = (_id: number, isLoan = false) => {
    if (isLoan) {
      deleteRequestLoanHook(_id, dispatch, setMessage, setType);
    } else {
      deleteRequestHook(_id, dispatch, setMessage, setType);
    }
  }

  const renderRequests = () => {
    return (
      <div className="products__requests">
        <hr />
        <h3 className="products__requests-title">
          <div>Exchange Requests</div>
          <div className="products__warning">{exchangeRequests.length}</div>
        </h3>
        <ul>
          {exchangeRequests.map((request: ExchangeRequest, index: number) => {
            // const owner = request.id_stuffier === user.id ? user : friends.filter((f: User) => f.id === request.id_stuffier)[0];
            const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
            const isUserRequestor = user === requestor;
            // const isUserOwner = user === owner;
            const rejectText = isUserRequestor ? 'Cancel' : 'Reject';
            const ownerProduct = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
            const requestorProduct = requestedProducts.find((p: ProductType) => p.id === request.id_friend_stuff);

            // console.log({ owner });
            return (
              <li className="products__request" key={index}>
                <div className="products__request-group">
                  {/* <div className="products__request-text">
                    Owner: {owner && isUserOwner ? 'Me' : `${owner.first_name} ${owner.last_name} (${owner.email})`}
                  </div> */}
                  <div className="products__request-text">
                    Product: {get(ownerProduct, 'name')}
                  </div>
                  <div className="products__request-text">
                    Requestor: {isUserRequestor ? 'Me' : `${requestor.first_name} ${requestor.last_name} (${requestor.email})`}
                  </div>
                  <div className="products__request-text">
                    Product: {get(requestorProduct, 'name')}
                  </div>
                </div>
                <div className="products__request-buttons">
                  {!isUserRequestor && <div className="products__request-button">
                    <Button onClick={() => console.log("Accept Exchange")} text="Accept"></Button>
                  </div>}
                  <div className="products__request-button">
                    <Button onClick={() => executeDeleteExchange(request._id)} text={rejectText}></Button>
                  </div>
                </div>
              </li>
            )
          }
          )}
        </ul>
      </div>
    )
  }

  const renderLoans = () => {
    return (
      <div className="products__requests">
        <hr />
        <h3 className="products__requests-title">
          <div>Loan Requests</div>
          <div className="products__warning">{loanRequests.length}</div>
        </h3>
        <ul>
          {loanRequests.map((request: LoanRequest, index: number) => {
            // const owner = request.id_stuffier === user.id ? user : friends.filter((f: User) => f.id === request.id_stuffier)[0];
            const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
            const isUserRequestor = user === requestor;
            // const isUserOwner = user === owner;
            const rejectText = isUserRequestor ? 'Cancel' : 'Reject';
            const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);

            return (
              <li className="products__request" key={index}>
                <div className="products__request-group">
                  {/* <div className="products__request-text">
                    Owner: {owner && isUserOwner ? 'Me' : `${owner.first_name} ${owner.last_name} (${owner.email})`}
                  </div> */}
                  <div className="products__request-text">
                    Requestor: {isUserRequestor ? 'Me' : `${requestor.first_name} ${requestor.last_name} (${requestor.email})`}
                  </div>
                  <div className="products__request-text">
                    Product: {get(product, 'name')}
                  </div>
                </div>
                <div className="products__request-buttons">
                  {!isUserRequestor && <div className="products__request-button">
                    <Button onClick={() => console.log("Accept Exchange")} text="Accept"></Button>
                  </div>}
                  <div className="products__request-button">
                    <Button onClick={() => executeDeleteExchange(request._id, true)} text={rejectText}></Button>
                  </div>
                </div>
              </li>
            )
          }
          )}
        </ul>
      </div>
    )
  }


  return (
    <div className="products">
      <WarningMessage message={message} type={type} />
      <div className="products__title">
        <h2>{user.first_name} Stuff</h2>
        <div className="products__add-product">
          <Button text="Add Product" onClick={() => navigate('/product/add')}></Button>
        </div>
      </div>
      {exchangeRequests.length > 0 && renderRequests()}
      {loanRequests.length > 0 && renderLoans()}
      <hr />
      {isProductsEmpty(products) && (<div>No Stuff! Add Products!</div>)}
      {!isProductsEmpty(products) &&
        (<div>
          {categories.map((category: Category, index: number) => {
            if (!products[category.id] || !products[category.id].length) return <div key={`${category.id}_${index}`}></div>;

            return (
              <div key={category.id}>
                <h4 className="products__subheader">{category.name}</h4>
                <Swiper
                  // install Swiper modules
                  modules={[Navigation, Pagination, Scrollbar, A11y]}
                  spaceBetween={50}
                  slidesPerView={3}
                  navigation
                  pagination={{ clickable: true }}
                  scrollbar={{ draggable: true }}
                  onSwiper={(swiper) => console.log(swiper)}
                  onSlideChange={() => console.log('slide change')}
                >
                  {map(products[category.id as number], (product: ProductType, prodIndex: number) => {
                    const match = { params: { id: product.id } };
                    return (
                    <SwiperSlide key={`prodIndex_${prodIndex}`}>
                      <Product key={product.id} match={match} showCost={true} product={product} />
                    </SwiperSlide>);
                  })}
                </Swiper>
              </div>);
          })}
          <hr />
          <Button onClick={() => generateReport()} text="Generate Report"></Button>
        </div>)
      }
    </div>
  );
};

export { Products as ProductsComponent };
export default Products;
