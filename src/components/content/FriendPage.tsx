import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Loading from '../shared/Loading';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import ProductCard from './ProductCard';
import MapView from '../shared/MapView';
import Tabs from '../shared/Tabs';
import { useFriends, useUserProducts, useCategories, useInvalidateFriends } from '../../hooks/queries';
import { existImage, userImageUrl } from '../../lib/cloudinary';
import { removeFriend } from '../../api/friends.api';
import UserContext from '../../context/UserContext';
import type User from '../types/User';
import type Product from '../types/Product';

import './FriendPage.scss';

type Tab = 'location' | 'products' | 'activity';

const relativeTime = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

const FriendPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = React.useContext(UserContext);
  const friendId = parseInt(id || '0');

  const { data: friends = [], isLoading: loadingFriends } = useFriends();
  const { data: categories = [] } = useCategories();
  const { data: productsMap = {}, isLoading: loadingProducts } = useUserProducts(friendId, categories);
  const invalidateFriends = useInvalidateFriends();
  const [picture, setPicture] = React.useState<string>();
  const [activeTab, setActiveTab] = React.useState<Tab>('location');
  const [showConfirmRemove, setShowConfirmRemove] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);

  const friend = (friends as User[]).find(f => f.id === friendId);
  const friendName = `${friend?.first_name ?? ''} ${friend?.last_name ?? ''}`.trim();
  const products: Product[] = Object.values(productsMap).flat();
  const productCount = products.length;

  // Activity: products sorted newest-first
  const recentProducts = [...products]
    .sort((a, b) => {
      const aDate = a.created_at ?? (a as any)._created ?? '';
      const bDate = b.created_at ?? (b as any)._created ?? '';
      return bDate.localeCompare(aDate);
    })
    .slice(0, 10);

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

  const handleRemove = () => {
    if (!currentUser?.id || !friend?.id) return;
    setRemoving(true);
    removeFriend(currentUser.id, friend.id)
      .then(() => {
        setShowConfirmRemove(false);
        invalidateFriends();
        navigate('/friends');
      })
      .finally(() => setRemoving(false));
  };

  if (loadingFriends) return <Loading size="lg" message={t('common.loading')} />;

  return (
    <>
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
        <div className="friend-page__header-meta">
          {productCount > 0 && (
            <span className="friend-page__count-badge">
              {t('friendPage.itemCount', { count: productCount })}
            </span>
          )}
        </div>
        {friend && (
          <Button
            text={t('friends.removeConfirm')}
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmRemove(true)}
          />
        )}
      </div>

      <Tabs
        className="friend-page__tabs"
        tabs={[
          ...(hasLocation ? [{ key: 'location', label: t('friendPage.tabLocation') }] : []),
          { key: 'products', label: t('friendPage.tabProducts') },
          ...(products.length > 0 ? [{ key: 'activity', label: t('friendPage.tabActivity') }] : []),
        ]}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as Tab)}
      />

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
                    friendId,
                    product,
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
      {activeTab === 'activity' && (
        <div className="friend-page__section">
          {loadingProducts && <Loading size="md" message={t('common.loading')} />}
          {!loadingProducts && recentProducts.length === 0 && (
            <div className="friend-page__empty">{t('friendPage.noProducts')}</div>
          )}
          {!loadingProducts && recentProducts.length > 0 && (
            <div className="friend-page__activity">
              {recentProducts.map((product: Product) => {
                const dateStr = product.created_at ?? (product as any)._created;
                return (
                  <div
                    key={product.id}
                    className="friend-page__activity-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/product/${product.id}`, {
                      state: { friendId, product, breadcrumb: [
                        { label: t('Friends'), path: '/friends' },
                        { label: friendName, path: `/friends/${friendId}` },
                        { label: product.name ?? '', path: `/product/${product.id}` },
                      ]}
                    })}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/product/${product.id}`, {
                      state: { friendId, product }
                    })}
                  >
                    <div className="friend-page__activity-dot" />
                    <div className="friend-page__activity-info">
                      <span className="friend-page__activity-name">{product.name}</span>
                      {dateStr && (
                        <span className="friend-page__activity-time">{relativeTime(dateStr)}</span>
                      )}
                    </div>
                    <span className="friend-page__activity-chevron">›</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>

    {showConfirmRemove && friend && (
      <Modal
        title={t('friends.removeTitle')}
        onClose={() => !removing && setShowConfirmRemove(false)}
        disableBackdropClose={removing}
        actions={
          <>
            <Button
              text={t('friends.removeConfirm')}
              variant="secondary"
              loading={removing}
              onClick={handleRemove}
            />
            <Button
              text={t('common.cancel')}
              variant="outline"
              onClick={() => setShowConfirmRemove(false)}
              disabled={removing}
            />
          </>
        }
      >
        {t('friends.removeBody', { name: friendName })}
      </Modal>
    )}
    </>
  );
};

export default FriendPage;
