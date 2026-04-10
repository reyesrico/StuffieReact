import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft20Regular } from '@fluentui/react-icons';

import Button from '../shared/Button';
import Media from '../shared/Media';
import Modal from '../shared/Modal';
import { getUsersByIds } from '../../api/users.api';
import { useCategories, useSubcategories, useCreatePurchase } from '../../hooks/queries';
import UserContext from '../../context/UserContext';
import type Category from '../types/Category';
import type Subcategory from '../types/Subcategory';
import type Product from '../types/Product';

import './Buy.scss';

const Buy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const createPurchaseMutation = useCreatePurchase();

  const targetProduct: Product = (location.state as any)?.['product'];
  const friendId: number = (location.state as any)?.['friend'];

  const [friend, setFriend] = useState<{ first_name: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!targetProduct) {
      navigate('/');
      return;
    }
    if (friendId) {
      getUsersByIds([{ id: friendId }]).then((users) => setFriend(users[0] as any));
    }
  }, [targetProduct, friendId, navigate]);

  const targetCategory = categories.find((c: Category) => c.id === targetProduct?.category_id);
  const targetSubcategory = subcategories.find((s: Subcategory) => s.id === targetProduct?.subcategory_id);

  const handleBuy = () => {
    setShowConfirm(false);
    if (!friendId || !targetProduct?.id || !user?.id) return;

    createPurchaseMutation.mutate(
      { id_stuffier: friendId, id_stuff: targetProduct.id, id_friend: user.id, cost: targetProduct.cost ?? 0 },
      {
        onSuccess: () => setShowSuccess(true),
        onError: () => setShowError(true),
      }
    );
  };

  if (!targetProduct) return null;

  return (
    <div className="buy">
      <div className="buy__page-header">
        <button className="buy__back" onClick={() => navigate(-1)} aria-label={t('common.cancel')}>
          <ArrowLeft20Regular />
        </button>
        <h2>{t('buy.friendProduct', { name: friend?.first_name ?? '…' })}</h2>
      </div>

      <div className="buy__target-card">
        <div className="buy__target-media">
          <Media
            fileName={targetProduct.id}
            category={targetProduct.category_id}
            subcategory={targetProduct.subcategory_id}
            imageKey={targetProduct.image_key}
            format="jpg"
            height="56"
            width="56"
            isProduct="true"
          />
        </div>
        <div className="buy__target-info">
          <span className="buy__target-chip">{t('buy.chipLabel')}</span>
          <span className="buy__target-name">{targetProduct.name}</span>
          <span className="buy__target-meta">
            {targetCategory?.name}{targetSubcategory ? ` · ${targetSubcategory.name}` : ''}
          </span>
          {targetProduct.cost != null && (
            <span className="buy__target-price">${targetProduct.cost}</span>
          )}
        </div>
      </div>

      <p className="buy__instructions">{t('buy.instructions', { name: friend?.first_name ?? '…', cost: targetProduct.cost })}</p>

      <div className="buy__actions">
        <Button
          variant="primary"
          text={t('buy.requestBuy')}
          onClick={() => setShowConfirm(true)}
          fullWidth
        />
      </div>

      {showConfirm && (
        <Modal
          title={t('buy.confirmTitle')}
          onClose={() => setShowConfirm(false)}
          disableBackdropClose={createPurchaseMutation.isPending}
          actions={
            <>
              <Button
                variant="secondary"
                text={t('common.cancel')}
                onClick={() => setShowConfirm(false)}
                disabled={createPurchaseMutation.isPending}
              />
              <Button
                variant="primary"
                text={t('buy.requestBuy')}
                onClick={handleBuy}
                loading={createPurchaseMutation.isPending}
              />
            </>
          }
        >
          <p>{t('buy.confirmBody', { name: friend?.first_name ?? '…', item: targetProduct.name, cost: targetProduct.cost })}</p>
        </Modal>
      )}

      {showSuccess && (
        <Modal
          title={t('buy.successTitle')}
          actions={
            <Button
              variant="primary"
              text={t('common.accept')}
              onClick={() => navigate('/products')}
            />
          }
        >
          <p>{t('buy.successMessage')}</p>
        </Modal>
      )}

      {showError && (
        <Modal
          title={t('buy.errorTitle')}
          onClose={() => setShowError(false)}
          actions={
            <Button
              variant="secondary"
              text={t('common.cancel')}
              onClick={() => setShowError(false)}
            />
          }
        >
          <p>{t('buy.errorMessage')}</p>
        </Modal>
      )}
    </div>
  );
};

export default Buy;
