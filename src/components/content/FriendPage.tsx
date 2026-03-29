import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Loading from '../shared/Loading';
import ProductCard from './ProductCard';
import { useFriends, useFriendsWithProducts } from '../../hooks/queries';
import { existImage, userImageUrl } from '../../lib/cloudinary';
import type User from '../types/User';
import type Product from '../types/Product';

import './FriendPage.scss';

const FriendPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const friendId = parseInt(id || '0');

  const { data: friends = [], isLoading: loadingFriends } = useFriends();
  const { data: friendsWithProducts = [], isLoading: loadingProducts } = useFriendsWithProducts();
  const [picture, setPicture] = React.useState<string>();

  const friend = (friends as User[]).find(f => f.id === friendId);
  const friendWithProds = (friendsWithProducts as User[]).find(f => f.id === friendId);
  const friendName = `${friend?.first_name ?? ''} ${friend?.last_name ?? ''}`.trim();
  const products: Product[] = (friendWithProds?.products as Product[]) ?? [];

  React.useEffect(() => {
    if (friend?.id) {
      existImage(friend.id, 'stuffiers/')
        .then(() => setPicture(userImageUrl(friend.id!)))
        .catch(() => {});
    }
  }, [friend?.id]);

  if (loadingFriends) return <Loading size="lg" message={t('common.loading')} />;

  return (
    <div className="friend-page">
      <div className="friend-page__header">
        <div className="friend-page__identity">
          {picture && (
            <img src={picture} className="friend-page__photo" alt={t('common.userPicAlt')} />
          )}
          <div className="friend-page__info">
            <h2 className="friend-page__name">{friendName}</h2>
            <span className="friend-page__email">{friend?.email}</span>
          </div>
        </div>
      </div>

      <div className="friend-page__products-section">
        <h3 className="friend-page__section-title">
          {t('friendPage.productsTitle', { name: friend?.first_name })}
        </h3>

        {loadingProducts && <Loading size="md" message={t('common.loading')} />}

        {!loadingProducts && products.length === 0 && (
          <div className="friend-page__empty">{t('friendPage.noProducts')}</div>
        )}

        {!loadingProducts && products.length > 0 && (
          <div className="friend-page__grid">
            {products.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigationState={{
                  breadcrumb: [
                    { label: t('Friends'), path: '/friends' },
                    { label: friendName, path: `/friends/${friendId}` },
                    { label: product.name ?? product.id?.toString() ?? '', path: `/product/${product.id}` },
                  ],
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendPage;
