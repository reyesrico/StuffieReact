import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, map, uniq } from 'lodash';

import Button from '../shared/Button';
import Category from '../types/Category';
import ExchangeRequest from '../types/ExchangeRequest';
import LoanRequest from '../types/LoanRequest';
import Product from './Product';
import User from '../types/User';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { downloadExcel } from '../helpers/DownloadHelper';
import { getProductsByIds } from '../../api/products.api';
import { isProductsEmpty, mapIds } from '../helpers/StuffHelper';
import { default as ProductType } from '../types/Product';
import UserContext from '../../context/UserContext';
import { useCategories, useProducts, useFriends, useExchangeRequests, useLoanRequests, useDeleteExchange, useDeleteLoan } from '../../hooks/queries';

// import Swiper core and required modules
import { A11y, Navigation, Pagination, Scrollbar } from 'swiper/modules';
// import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

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
  const { user } = useContext(UserContext);
  
  // React Query hooks
  const { data: categories = [] } = useCategories();
  const { data: friends = [] } = useFriends();
  const { data: exchangeRequests = [] } = useExchangeRequests();
  const { data: loanRequests = [] } = useLoanRequests();
  const { data: products = {}, refetch: refreshProductsQuery, isFetching: isRefreshing } = useProducts();
  
  // Mutations
  const deleteExchangeMutation = useDeleteExchange();
  const deleteLoanMutation = useDeleteLoan();
  
  const [requestedProducts, setRequestProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [type, setType] = useState(WarningMessageType.EMPTY);

  const refreshProducts = () => {
    refreshProductsQuery();
  };


  useEffect(() => {
    const loanIds = Array.isArray(loanRequests) ? loanRequests.map((req: any) => req.id_stuff) : [];
    const exchangeIds = Array.isArray(exchangeRequests) ? exchangeRequests.map((req: any) => req.id_stuff) : [];
    const exchangeFriendIds = Array.isArray(exchangeRequests) ? exchangeRequests.map((req: any) => req.id_friend_stuff) : [];

    const ids = uniq([...loanIds, ...exchangeIds, ...exchangeFriendIds]);

    getProductsByIds(mapIds(ids))
      .then(prods => setRequestProducts(prods as any));
  }, [exchangeRequests, loanRequests]);

  const generateReport = () => {
    downloadExcel(products, `${user?.first_name || 'user'}_products`);
  }

  const executeDeleteExchange = (_id: string, isLoan = false) => {
    if (isLoan) {
      deleteLoanMutation.mutate(_id, {
        onSuccess: () => {
          setMessage('Loan request deleted successfully');
          setType(WarningMessageType.SUCCESSFUL);
        },
        onError: () => {
          setMessage('Failed to delete loan request');
          setType(WarningMessageType.ERROR);
        }
      });
    } else {
      deleteExchangeMutation.mutate(_id, {
        onSuccess: () => {
          setMessage('Exchange request deleted successfully');
          setType(WarningMessageType.SUCCESSFUL);
        },
        onError: () => {
          setMessage('Failed to delete exchange request');
          setType(WarningMessageType.ERROR);
        }
      });
    }
  }

  const renderRequests = () => {
    const requests = Array.isArray(exchangeRequests) ? exchangeRequests : [];
    return (
      <div className="products__requests">
        <hr />
        <h3 className="products__requests-title">
          <div>Exchange Requests</div>
          <div className="products__warning">{requests.length}</div>
        </h3>
        <ul>
          {requests.map((request: ExchangeRequest, index: number) => {
            // const owner = request.id_stuffier === user.id ? user : friends.filter((f: User) => f.id === request.id_stuffier)[0];
            const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
            const isUserRequestor = user === requestor;
            // const isUserOwner = user === owner;
            const rejectText = isUserRequestor ? 'Cancel' : 'Reject';
            const ownerProduct = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
            const requestorProduct = requestedProducts.find((p: ProductType) => p.id === request.id_friend_stuff);

            // console.log({ owner });
            return (
              // eslint-disable-next-line react/no-array-index-key
              <li className="products__request" key={index}>
                <div className="products__request-group">
                  {/* <div className="products__request-text">
                    Owner: {owner && isUserOwner ? 'Me' : `${owner.first_name} ${owner.last_name} (${owner.email})`}
                  </div> */}
                  <div className="products__request-text">
                    Product: {get(ownerProduct, 'name')}
                  </div>
                  <div className="products__request-text">
                    Requestor: {isUserRequestor ? 'Me' : requestor ? `${requestor.first_name} ${requestor.last_name} (${requestor.email})` : 'Unknown'}
                  </div>
                  <div className="products__request-text">
                    Product: {get(requestorProduct, 'name')}
                  </div>
                </div>
                <div className="products__request-buttons">
                  {!isUserRequestor && <div className="products__request-button">
                    {/* TODO: Implement acceptExchange functionality */}
                    <Button onClick={() => {}} text="Accept" disabled />
                  </div>}
                  <div className="products__request-button">
                    <Button onClick={() => executeDeleteExchange(request._id)} text={rejectText} />
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
    const loans = Array.isArray(loanRequests) ? loanRequests : [];
    return (
      <div className="products__requests">
        <hr />
        <h3 className="products__requests-title">
          <div>Loan Requests</div>
          <div className="products__warning">{loans.length}</div>
        </h3>
        <ul>
          {loans.map((request: LoanRequest, index: number) => {
            // const owner = request.id_stuffier === user.id ? user : friends.filter((f: User) => f.id === request.id_stuffier)[0];
            const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
            const isUserRequestor = user === requestor;
            // const isUserOwner = user === owner;
            const rejectText = isUserRequestor ? 'Cancel' : 'Reject';
            const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);

            return (
              // eslint-disable-next-line react/no-array-index-key
              <li className="products__request" key={index}>
                <div className="products__request-group">
                  {/* <div className="products__request-text">
                    Owner: {owner && isUserOwner ? 'Me' : `${owner.first_name} ${owner.last_name} (${owner.email})`}
                  </div> */}
                  <div className="products__request-text">
                    Requestor: {isUserRequestor ? 'Me' : requestor ? `${requestor.first_name} ${requestor.last_name} (${requestor.email})` : 'Unknown'}
                  </div>
                  <div className="products__request-text">
                    Product: {get(product, 'name')}
                  </div>
                </div>
                <div className="products__request-buttons">
                  {!isUserRequestor && <div className="products__request-button">
                    {/* TODO: Implement acceptLoan functionality */}
                    <Button onClick={() => {}} text="Accept" disabled />
                  </div>}
                  <div className="products__request-button">
                    <Button onClick={() => executeDeleteExchange(request._id, true)} text={rejectText} />
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
        <h2>{user?.first_name || 'My'} Stuff</h2>
        <div className="products__add-product">
          <Button text="Add Product" onClick={() => navigate('/product/add')} />
          <Button 
            text={isRefreshing ? "Refreshing..." : "Refresh Products"} 
            onClick={refreshProducts}
            disabled={isRefreshing}
          />
        </div>
      </div>
      {Array.isArray(exchangeRequests) && exchangeRequests.length > 0 && renderRequests()}
      {Array.isArray(loanRequests) && loanRequests.length > 0 && renderLoans()}
      <hr />
      {isProductsEmpty(products) && (<div>No Stuff! Add Products!</div>)}
      {!isProductsEmpty(products) &&
        (<div>
          {categories.map((category: Category, index: number) => {
            if (!products[category.id] || !products[category.id].length) return <div key={`${category.id}_${index}`} />;

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
                  // onSwiper={(swiper) => console.log(swiper)}
                  // onSlideChange={() => console.log('slide change')}
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
          <Button onClick={() => generateReport()} text="Generate Report" />
        </div>)
      }
    </div>
  );
};

export { Products as ProductsComponent };
export default Products;
