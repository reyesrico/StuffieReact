import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useProducts, useFriends } from '../../hooks/queries';
import { getProductFromProducts } from '../helpers/StuffHelper';
import type ProductsMap from '../types/ProductsMap';
import type User from '../types/User';
import './Breadcrumb.scss';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();
  const { t } = useTranslation();
  const { data: friends = [] } = useFriends();
  const { data: products = {} } = useProducts();

  // Navigation state carries an explicit trail (e.g. friend → product)
  if (location.state?.breadcrumb) {
    return location.state.breadcrumb as BreadcrumbItem[];
  }

  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return [{ label: t('Feed'), path: '/' }];
  }

  const first = segments[0];

  switch (first) {
    case 'friends': {
      const items: BreadcrumbItem[] = [{ label: t('Friends'), path: '/friends' }];
      if (segments[1]) {
        const friendId = parseInt(segments[1]);
        const friend = (friends as User[]).find(f => f.id === friendId);
        if (friend) {
          items.push({
            label: `${friend.first_name} ${friend.last_name}`,
            path: `/friends/${friendId}`,
          });
        }
      }
      return items;
    }

    case 'products':
      return [{ label: t('header.products'), path: '/products' }];

    case 'product': {
      const items: BreadcrumbItem[] = [{ label: t('header.products'), path: '/products' }];
      if (segments[1] === 'add') {
        items.push({ label: t('products.addProduct'), path: '/product/add' });
      } else if (segments[1]) {
        const productId = parseInt(segments[1]);
        const product = getProductFromProducts(productId, products as ProductsMap);
        if (product) {
          items.push({ label: product.name, path: `/product/${productId}` });
        }
      }
      return items;
    }

    case 'admin':
      return [{ label: t('Admin'), path: '/admin' }];

    case 'notifications':
      return [{ label: t('header.notifications'), path: '/notifications' }];

    case 'stuffier':
      return [{ label: t('breadcrumb.profile'), path: '/stuffier' }];

    default:
      return [{ label: first.charAt(0).toUpperCase() + first.slice(1), path: `/${first}` }];
  }
};

const Breadcrumb = () => {
  const items = useBreadcrumbs();

  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          <span className="breadcrumb__separator">{'>'}</span>
          {index === items.length - 1 ? (
            <span className="breadcrumb__current">{item.label}</span>
          ) : (
            <Link className="breadcrumb__link" to={item.path}>
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
