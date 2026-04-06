import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Loading from '../shared/Loading';
import ProductCard from './ProductCard';
import MapView from '../shared/MapView';
import { useFriends, useUserProducts, useCategories } from '../../hooks/queries';
import { existImage, userImageUrl } from '../../lib/cloudinary';
import type User from '../types/User';
import type Product from '../types/Product';

import './FriendPage.scss';

type Tab = 'location' | 'products';

const FriendPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const friendId = parseInt(id || '0');

  const { data: friends = [], isLoading: loadingFriends } = useFriends();
  const { data: categories = [] } = useCategories();
  const { data: productsMap = {}, isLoading: loadingProducts } = useUserProducts(friendId, categories);
  const [picture, setPicture] = React.useState<string>();
  const [activeTab, setActiveTab] = React.useState<Tab>('location');

  const friend = (friends as User[]).find(f => f.id === friendId);
  const friendName = `${friend?.first_name ?? ''} ${friend?.last_name ?? ''}`.trim();
  const products: Product[] = Object.values(productsMap).flat();

  const lat = Number(friend?.lat);
  const lng = Number(friend?.lng);
  const hasLocation = !!friend && !isNaN(lat) && !isNaN(lng) && lat !== 0;

  React.useEffect(() => {
    if (friend?.id) {
      existImage(friend.id, 'stuffiers/')
        .then(() => setPicture(userImageUrl(friend.id!)))
        .catch(() => {});
    }
  }, [friend?.id]);

  // Default to products tab if friend has no location
  React.useEffect(() => {
    if (!hasLocation) setActiveTab('products');
  }, [hasLocation]);

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

      <div className="friend-page__tabs">
        {hasLocation && (
          <button
            className={`friend-page__tab${activeTab === 'location' ? ' friend-page__tab--active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            {t('friendPage.tabLocation')}
          </button>
        )}
        <button
          className={`friend-page__tab${activeTab === 'products' ? ' friend-page__tab--active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          {t('friendPage.tabProducts')}
        </button>
      </div>

      {activeTab === 'location' && hasLocation && (
        <div className="friend-page__section">
          <MapView lat={lat} lng={lng} />
          {friend?.zip_code && (
            <p className="friend-page__zip">{t('friendPage.locationZip')} {friend.zip_code}</p>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="friend-page__section">
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
      )}
    </div>
  );
};

export default FriendPage;
