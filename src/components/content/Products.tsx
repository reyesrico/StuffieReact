import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, map, uniq } from 'lodash';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Category from '../types/Category';
import ExchangeRequest from '../types/ExchangeRequest';
import LoanRequest from '../types/LoanRequest';
import PurchaseRequest from '../types/PurchaseRequest';
import Product from './Product';
import User from '../types/User';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { downloadExcel } from '../helpers/DownloadHelper';
import { getProductsByIds } from '../../api/products.api';
import { isProductsEmpty, mapIds } from '../helpers/StuffHelper';
import { default as ProductType } from '../types/Product';
import UserContext from '../../context/UserContext';
import { useCategories, useProducts, useFriends, useExchangeRequests, useLoanRequests, usePurchaseRequests, useDeleteExchange, useDeleteLoan, useDeletePurchase } from '../../hooks/queries';

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
  const { t } = useTranslation();
  
  // React Query hooks
  const { data: categories = [] } = useCategories();
  const { data: friends = [] } = useFriends();
  const { data: exchangeRequests = [] } = useExchangeRequests();
  const { data: loanRequests = [] } = useLoanRequests();
  const { data: purchaseRequests = [] } = usePurchaseRequests();
  const { data: products = {}, refetch: refreshProductsQuery, isFetching: isRefreshing } = useProducts();
  
  // Mutations
  const deleteExchangeMutation = useDeleteExchange();
  const deleteLoanMutation = useDeleteLoan();
  const deletePurchaseMutation = useDeletePurchase();
  
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

    const purchaseIds = Array.isArray(purchaseRequests) ? purchaseRequests.map((req: any) => req.id_stuff) : [];
    const ids = uniq([...loanIds, ...exchangeIds, ...exchangeFriendIds, ...purchaseIds]);

    getProductsByIds(mapIds(ids))
      .then(prods => setRequestProducts(prods as any));
  }, [exchangeRequests, loanRequests, purchaseRequests]);

  const generateReport = () => {
    downloadExcel(products, `${user?.first_name || 'user'}_products`);
  }

  const executeDeleteExchange = (_id: string, isLoan = false) => {
    if (isLoan) {
      deleteLoanMutation.mutate(_id, {
        onSuccess: () => {
          setMessage(t('products.loanDeleted'));
          setType(WarningMessageType.SUCCESSFUL);
        },
        onError: () => {
          setMessage(t('products.loanDeleteFailed'));
          setType(WarningMessageType.ERROR);
        }
      });
    } else {
      deleteExchangeMutation.mutate(_id, {
        onSuccess: () => {
          setMessage(t('products.exchangeDeleted'));
          setType(WarningMessageType.SUCCESSFUL);
        },
        onError: () => {
          setMessage(t('products.exchangeDeleteFailed'));
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
          <div>{t('products.exchangeRequests')}</div>
          <div className="products__warning">{requests.length}</div>
        </h3>
        <ul>
          {requests.map((request: ExchangeRequest, index: number) => {
            // const owner = request.id_stuffier === user.id ? user : friends.filter((f: User) => f.id === request.id_stuffier)[0];
            const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
            const isUserRequestor = user === requestor;
            // const isUserOwner = user === owner;
            const rejectText = isUserRequestor ? t('common.cancel') : t('common.reject');
            const ownerProduct = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
            const requestorProduct = requestedProducts.find((p: ProductType) => p.id === request.id_friend_stuff);

            // console.log({ owner });
            return (
              // eslint-disable-next-line react/no-array-index-key
              <li className="products__request" key={index}>
                <div className="products__request-group">
                  <div className="products__request-text">
                    {t('products.productLabel')}{get(ownerProduct, 'name')}
                  </div>
                  <div className="products__request-text">
                    {t('products.requestorLabel')}{isUserRequestor ? t('products.me') : requestor ? `${requestor.first_name} ${requestor.last_name} (${requestor.email})` : t('products.unknown')}
                  </div>
                  <div className="products__request-text">
                    {t('products.productLabel')}{get(requestorProduct, 'name')}
                  </div>
                </div>
                <div className="products__request-buttons">
                  {!isUserRequestor && <div className="products__request-button">
                    {/* TODO: Implement acceptExchange functionality */}
                    <Button onClick={() => {}} text={t('common.accept')} disabled />
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
          <div>{t('products.loanRequests')}</div>
          <div className="products__warning">{loans.length}</div>
        </h3>
        <ul>
          {loans.map((request: LoanRequest, index: number) => {
            // const owner = request.id_stuffier === user.id ? user : friends.filter((f: User) => f.id === request.id_stuffier)[0];
            const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
            const isUserRequestor = user === requestor;
            // const isUserOwner = user === owner;
            const rejectText = isUserRequestor ? t('common.cancel') : t('common.reject');
            const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);

            return (
              // eslint-disable-next-line react/no-array-index-key
              <li className="products__request" key={index}>
                <div className="products__request-group">
                  <div className="products__request-text">
                    {t('products.requestorLabel')}{isUserRequestor ? t('products.me') : requestor ? `${requestor.first_name} ${requestor.last_name} (${requestor.email})` : t('products.unknown')}
                  </div>
                  <div className="products__request-text">
                    {t('products.productLabel')}{get(product, 'name')}
                  </div>
                </div>
                <div className="products__request-buttons">
                  {!isUserRequestor && <div className="products__request-button">
                    {/* TODO: Implement acceptLoan functionality */}
                    <Button onClick={() => {}} text={t('common.accept')} disabled />
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


  const renderPurchases = () => {
    const purchases = Array.isArray(purchaseRequests) ? purchaseRequests : [];
    return (
      <div className="products__requests">
        <hr />
        <h3 className="products__requests-title">
          <div>{t('products.purchaseRequests')}</div>
          <div className="products__warning">{purchases.length}</div>
        </h3>
        <ul>
          {purchases.map((request: PurchaseRequest, index: number) => {
            const requestor = request.id_friend === user?.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
            const isUserRequestor = user?.id === request.id_friend;
            const rejectText = isUserRequestor ? t('common.cancel') : t('common.reject');
            const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);

            return (
              // eslint-disable-next-line react/no-array-index-key
              <li className="products__request" key={index}>
                <div className="products__request-group">
                  <div className="products__request-text">
                    {t('products.requestorLabel')}{isUserRequestor ? t('products.me') : requestor ? `${requestor.first_name} ${requestor.last_name} (${requestor.email})` : t('products.unknown')}
                  </div>
                  <div className="products__request-text">
                    {t('products.productLabel')}{get(product, 'name')}
                  </div>
                  <div className="products__request-text">
                    {t('products.costLabel')}{request.cost}
                  </div>
                </div>
                <div className="products__request-buttons">
                  <div className="products__request-button">
                    <Button
                      onClick={() => deletePurchaseMutation.mutate(request._id, {
                        onSuccess: () => { setMessage(t('products.purchaseDeleted')); setType(WarningMessageType.SUCCESSFUL); },
                        onError: () => { setMessage(t('products.purchaseDeleteFailed')); setType(WarningMessageType.ERROR); },
                      })}
                      text={rejectText}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="products">
      <WarningMessage message={message} type={type} />
      <div className="products__title">
        <h2>{user?.first_name || t('products.myStuff')} Stuff</h2>
        <div className="products__add-product">
          <Button text={t('products.addProduct')} onClick={() => navigate('/product/add')} />
          <Button 
            text={isRefreshing ? t('products.refreshing') : t('products.refresh')} 
            onClick={refreshProducts}
            disabled={isRefreshing}
          />
        </div>
      </div>
      {Array.isArray(exchangeRequests) && exchangeRequests.length > 0 && renderRequests()}
      {Array.isArray(loanRequests) && loanRequests.length > 0 && renderLoans()}
      {Array.isArray(purchaseRequests) && purchaseRequests.length > 0 && renderPurchases()}
      <hr />
      {isProductsEmpty(products) && (<div>{t('products.noStuff')}</div>)}
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
          <Button onClick={() => generateReport()} text={t('products.generateReport')} />
        </div>)
      }
    </div>
  );
};

export { Products as ProductsComponent };
export default Products;
