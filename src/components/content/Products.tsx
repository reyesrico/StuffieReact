import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import Button from '../shared/Button';
import Category from '../types/Category';
import EmptyState from '../shared/EmptyState';
import Loading from '../shared/Loading';
import ProductCard from './ProductCard';
import ProductsInsightsChart from '../charts/ProductsInsightsChart';
import { downloadCSV } from '../helpers/DownloadHelper';
import { isProductsEmpty } from '../helpers/StuffHelper';
import { default as ProductType } from '../types/Product';
import UserContext from '../../context/UserContext';
import { useCategories, useProducts, useLoanRequests, useExchangeRequests, usePurchaseRequests } from '../../hooks/queries';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { getProductsByIds } from '../../api/products.api';
import { getUsersByIds } from '../../api/users.api';
import { CheckmarkCircle20Regular, Box20Regular } from '@fluentui/react-icons';
import type LoanRequest from '../types/LoanRequest';
import type ExchangeRequest from '../types/ExchangeRequest';
import type PurchaseRequest from '../types/PurchaseRequest';
import type User from '../types/User';

import './Products.scss';

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  const [successMsg, setSuccessMsg] = useState<string | null>(() =>
    (location.state as any)?.added ?? null
  );

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const { data: categories = [] } = useCategories();
  const { data: products = {}, refetch: refreshProductsQuery, isFetching: isRefreshing } = useProducts();
  const { data: loanRequests = [] } = useLoanRequests();
  const { data: exchangeRequests = [] } = useExchangeRequests();
  const { data: purchaseRequests = [] } = usePurchaseRequests();

  // Active loans where I am the borrower (id_friend = me)
  const activeBorrowedLoans = loanRequests.filter(
    (r: LoanRequest) => r.id_friend === user?.id && r.status === 'active'
  );
  const borrowedItemIds = activeBorrowedLoans.map((r: LoanRequest) => ({ id: r.id_stuff }));
  const borrowedOwnerIds = activeBorrowedLoans.map((r: LoanRequest) => ({ id: r.id_stuffier }));

  // Active loans where I am the owner/lender (id_stuffier = me)
  const activeLoanedOutLoans = loanRequests.filter(
    (r: LoanRequest) => r.id_stuffier === user?.id && r.status === 'active'
  );
  const loanedOutBorrowerIds = activeLoanedOutLoans.map((r: LoanRequest) => ({ id: r.id_friend }));

  const { data: borrowedProducts = [] } = useQuery<ProductType[]>({
    queryKey: ['borrowedProducts', borrowedItemIds.map((i: { id: number }) => i.id)],
    queryFn: () => getProductsByIds(borrowedItemIds),
    enabled: borrowedItemIds.length > 0,
  });

  const { data: borrowedOwners = [] } = useQuery<User[]>({
    queryKey: ['borrowedOwners', borrowedOwnerIds.map((i: { id: number }) => i.id)],
    queryFn: () => getUsersByIds(borrowedOwnerIds),
    enabled: borrowedOwnerIds.length > 0,
  });

  const { data: loanedOutBorrowers = [] } = useQuery<User[]>({
    queryKey: ['loanedOutBorrowers', loanedOutBorrowerIds.map((i: { id: number }) => i.id)],
    queryFn: () => getUsersByIds(loanedOutBorrowerIds),
    enabled: loanedOutBorrowerIds.length > 0,
  });

  // Accepted exchanges where I am the owner (id_stuffier = me) — my product being physically traded
  const acceptedOwnerExchanges = exchangeRequests.filter(
    (r: ExchangeRequest) => r.id_stuffier === user?.id && r.status === 'accepted'
  );
  // Accepted exchanges where I am the requester (id_friend = me) — my offered product is in trade
  const acceptedRequesterExchanges = exchangeRequests.filter(
    (r: ExchangeRequest) => r.id_friend === user?.id && r.status === 'accepted'
  );
  // Completed exchanges where I am the requester — I received id_stuff (the owner's product)
  const completedRequesterExchanges = exchangeRequests.filter(
    (r: ExchangeRequest) => r.id_friend === user?.id && r.status === 'completed'
  );
  // Completed exchanges where I am the owner — I received id_friend_stuff (the requester's product)
  const completedOwnerExchanges = exchangeRequests.filter(
    (r: ExchangeRequest) => r.id_stuffier === user?.id && r.status === 'completed'
  );
  const exchangeCounterpartIds = [
    ...acceptedOwnerExchanges.map((r: ExchangeRequest) => ({ id: r.id_friend })),
    ...acceptedRequesterExchanges.map((r: ExchangeRequest) => ({ id: r.id_stuffier })),
    ...completedRequesterExchanges.map((r: ExchangeRequest) => ({ id: r.id_stuffier })),
    ...completedOwnerExchanges.map((r: ExchangeRequest) => ({ id: r.id_friend })),
  ];
  const { data: exchangeCounterparts = [] } = useQuery<User[]>({
    queryKey: ['exchangeCounterparts', exchangeCounterpartIds.map((x: { id: number }) => x.id)],
    queryFn: () => getUsersByIds(exchangeCounterpartIds),
    enabled: exchangeCounterpartIds.length > 0,
  });

  // Completed purchases where I am the buyer (id_friend = me) — item is now mine
  const completedPurchases = purchaseRequests.filter(
    (r: PurchaseRequest) => r.id_friend === user?.id && r.status === 'completed'
  );
  const purchaseSellerIds = completedPurchases.map((r: PurchaseRequest) => ({ id: r.id_stuffier }));
  const { data: purchaseSellers = [] } = useQuery<User[]>({
    queryKey: ['purchaseSellers', purchaseSellerIds.map((x: { id: number }) => x.id)],
    queryFn: () => getUsersByIds(purchaseSellerIds),
    enabled: purchaseSellerIds.length > 0,
  });

  usePullToRefresh(refreshProductsQuery);

  const generateReport = () => {
    downloadCSV(products, categories, `${user?.first_name || 'user'}_inventory`);
  };

  return (
    <div className="products">
      {successMsg && (
        <div className="products__success-banner" role="status">
          <CheckmarkCircle20Regular /> <strong>{successMsg}</strong> {t('addProduct.addedSuccess')}
        </div>
      )}
      {isRefreshing && (
        <div className="products__refresh-spinner" role="status" aria-live="polite">
          <Loading size="sm" className="products__refresh-spinner-icon" />
        </div>
      )}
      <div className="products__title">
        <h2>{user?.first_name || t('products.myStuff')} Stuff</h2>
        {!isProductsEmpty(products) && (
          <div className="products__add-product">
            <Button text={t('products.addProduct')} onClick={() => navigate('/product/add')} size="sm" />
            <Button
              icon={<DownloadIcon />}
              text={t('products.exportCsv')}
              onClick={generateReport}
              size="sm"
              variant="secondary"
            />
            <Button
              icon={<RefreshIcon />}
              onClick={() => refreshProductsQuery()}
              size="sm"
              variant="secondary"
              aria-label={t('products.refresh')}
            />
          </div>
        )}
      </div>
      {!isProductsEmpty(products) && (
        <ProductsInsightsChart products={products} categories={categories} />
      )}
      {isProductsEmpty(products) && (
        <div className="products__empty">
          <EmptyState
            icon={<Box20Regular />}
            title={t('products.noStuffTitle')}
            description={t('products.noStuffDesc')}
            action={
              <Button
                text={t('products.addProduct')}
                onClick={() => navigate('/product/add')}
              />
            }
          />
        </div>
      )}
      {!isProductsEmpty(products) && (
        <div>
          {categories.map((category: Category) => {
            if (!products[category.id] || !products[category.id].length) return <div key={`empty-${category.id}`} />;

            return (
              <div key={category.id}>
                <h4 className="products__subheader">{category.name}</h4>
                <div className="products__grid">
                  {(() => {
                    const allInCategory: ProductType[] = products[category.id as number];

                    // Group by name — each add creates a new catalog entry, so
                    // duplicates share the same name+category, not the same id.
                    const byName = new Map<string, ProductType[]>();
                    allInCategory.forEach((p: ProductType) => {
                      const key = (p.name ?? '').toLowerCase();
                      if (!byName.has(key)) byName.set(key, []);
                      byName.get(key)!.push(p);
                    });

                    return Array.from(byName.values()).map((copies: ProductType[]) => {
                    const totalCopies = copies.length;

                    // Pick the copy with the most relevant active status to display
                    // Priority: loaned > being traded > completed exchange > bought > plain
                    const findProduct = (predicate: (p: ProductType) => boolean) =>
                      copies.find(predicate);

                    const loanOut = activeLoanedOutLoans.find((r: LoanRequest) =>
                      copies.some((p: ProductType) => p.id === r.id_stuff)
                    );
                    const product = loanOut
                      ? (findProduct((p: ProductType) => p.id === loanOut.id_stuff) ?? copies[0])
                      : copies[0];

                    const borrower = loanOut ? loanedOutBorrowers.find((u: User) => u.id === loanOut.id_friend) : undefined;
                    const borrowerName = borrower ? `${borrower.first_name} ${borrower.last_name}` : undefined;

                    // Accepted: reyesrico owns Zelda (id_stuff) in trade
                    const ownerExchange = !loanOut ? acceptedOwnerExchanges.find((r: ExchangeRequest) => copies.some((p: ProductType) => p.id === r.id_stuff)) : undefined;
                    // Accepted: chiquitonet offering Mario Kart (id_friend_stuff) in trade
                    const requesterExchange = !loanOut && !ownerExchange ? acceptedRequesterExchanges.find((r: ExchangeRequest) => copies.some((p: ProductType) => p.id === r.id_friend_stuff)) : undefined;
                    // Completed: chiquitonet received Zelda (id_stuff) from owner
                    const completedReceived = !loanOut && !ownerExchange && !requesterExchange
                      ? completedRequesterExchanges.find((r: ExchangeRequest) => copies.some((p: ProductType) => p.id === r.id_stuff))
                      : undefined;
                    // Completed: reyesrico received Mario Kart (id_friend_stuff) from requester
                    const completedGiven = !loanOut && !ownerExchange && !requesterExchange && !completedReceived
                      ? completedOwnerExchanges.find((r: ExchangeRequest) => copies.some((p: ProductType) => p.id === r.id_friend_stuff))
                      : undefined;

                    const activeExchange = ownerExchange ?? requesterExchange;
                    const completedExchange = completedReceived ?? completedGiven;
                    const exchangeCounterpart = ownerExchange
                      ? exchangeCounterparts.find((u: User) => u.id === ownerExchange.id_friend)
                      : requesterExchange
                      ? exchangeCounterparts.find((u: User) => u.id === requesterExchange.id_stuffier)
                      : completedReceived
                      ? exchangeCounterparts.find((u: User) => u.id === completedReceived.id_stuffier)
                      : completedGiven
                      ? exchangeCounterparts.find((u: User) => u.id === completedGiven.id_friend)
                      : undefined;
                    const exchangeCounterpartName = exchangeCounterpart ? `${exchangeCounterpart.first_name} ${exchangeCounterpart.last_name}` : undefined;

                    const boughtPurchase = !loanOut && !activeExchange && !completedExchange
                      ? completedPurchases.find((r: PurchaseRequest) => copies.some((p: ProductType) => p.id === r.id_stuff))
                      : undefined;
                    const purchaseSeller = boughtPurchase
                      ? purchaseSellers.find((u: User) => u.id === boughtPurchase.id_stuffier)
                      : undefined;
                    const purchaseSellerName = purchaseSeller ? `${purchaseSeller.first_name} ${purchaseSeller.last_name}` : undefined;

                    const tag = loanOut
                      ? t('products.loaned')
                      : activeExchange
                      ? t('products.beingTraded')
                      : completedExchange
                      ? t('products.traded')
                      : boughtPurchase
                      ? t('products.bought')
                      : undefined;
                    const navState = loanOut
                      ? { loanInfo: { loanedTo: borrowerName } }
                      : activeExchange
                      ? { exchangeInfo: { tradingWith: exchangeCounterpartName } }
                      : completedExchange
                      ? { exchangeInfo: { tradedWith: exchangeCounterpartName } }
                      : boughtPurchase
                      ? { purchaseInfo: { boughtFrom: purchaseSellerName, cost: boughtPurchase.cost } }
                      : undefined;

                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        tag={tag}
                        copies={totalCopies > 1 ? totalCopies : undefined}
                        allowSetCost
                        navigationState={{
                          ...navState,
                          ...(totalCopies > 1 ? {
                            copiesInfo: {
                              total: totalCopies,
                              statuses: copies.map((p: ProductType) => {
                                const lo = activeLoanedOutLoans.find((r: LoanRequest) => r.id_stuff === p.id);
                                if (lo) return t('products.loaned');
                                const oe = acceptedOwnerExchanges.find((r: ExchangeRequest) => r.id_stuff === p.id);
                                const re = acceptedRequesterExchanges.find((r: ExchangeRequest) => r.id_friend_stuff === p.id);
                                if (oe || re) return t('products.beingTraded');
                                const cp = completedPurchases.find((r: PurchaseRequest) => r.id_stuff === p.id);
                                if (cp) return t('products.bought');
                                return t('products.available');
                              }),
                            },
                          } : {}),
                        }}
                      />
                    );
                  });
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeBorrowedLoans.length > 0 && (
        <div>
          <h4 className="products__subheader">{t('products.borrowedSection')}</h4>
          <div className="products__grid">
            {borrowedProducts.map((product: ProductType) => {
              const loan = activeBorrowedLoans.find((r: LoanRequest) => r.id_stuff === product.id);
              const owner = borrowedOwners.find((u: User) => u.id === loan?.id_stuffier);
              const ownerName = owner ? `${owner.first_name} ${owner.last_name}` : undefined;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  tag={t('products.borrowed')}
                  navigationState={{ loanInfo: { borrowedFrom: ownerName } }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export { Products as ProductsComponent };
export default Products;
