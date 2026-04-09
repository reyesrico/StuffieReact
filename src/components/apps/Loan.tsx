import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft20Regular } from '@fluentui/react-icons';

import Button from '../shared/Button';
import Media from '../shared/Media';
import Modal from '../shared/Modal';
import { getUsersByIds } from '../../api/users.api';
import UserContext from '../../context/UserContext';
import { useCategories, useSubcategories, useCreateLoan } from '../../hooks/queries';
import type Category from '../types/Category';
import type Subcategory from '../types/Subcategory';
import type Product from '../types/Product';

import './Loan.scss';

const Loan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const createLoanMutation = useCreateLoan();

  const [friend, setFriend] = useState<{ first_name: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const targetProduct: Product = (location.state as any)?.['product'];
  const friendId: number = (location.state as any)?.['friend'];

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

  const requestLoan = () => {
    setShowConfirm(false);
    if (!friendId || !targetProduct?.id || !user?.id) return;

    createLoanMutation.mutate(
      { id_stuffier: friendId, id_stuff: targetProduct.id, id_friend: user.id },
      {
        onSuccess: () => setShowSuccess(true),
        onError: () => setShowError(true),
      }
    );
  };

  if (!targetProduct) return null;

  return (
    <div className="loan">
      <div className="loan__page-header">
        <button className="loan__back" onClick={() => navigate(-1)} aria-label={t('common.cancel')}>
          <ArrowLeft20Regular />
        </button>
        <h2>{t('loan.friendProduct', { name: friend?.first_name ?? '…' })}</h2>
      </div>

      <div className="loan__target-card">
        <div className="loan__target-media">
          <Media
            fileName={targetProduct.id}
            category={targetProduct.category_id}
            subcategory={targetProduct.subcategory_id}
            format="jpg"
            height="56"
            width="56"
            isProduct="true"
          />
        </div>
        <div className="loan__target-info">
          <span className="loan__target-chip">{t('loan.chipLabel')}</span>
          <span className="loan__target-name">{targetProduct.name}</span>
          <span className="loan__target-meta">
            {targetCategory?.name}{targetSubcategory ? ` · ${targetSubcategory.name}` : ''}
          </span>
        </div>
      </div>

      <p className="loan__instructions">{t('loan.instructions', { name: friend?.first_name ?? '…' })}</p>

      <div className="loan__actions">
        <Button
          variant="primary"
          text={t('loan.requestButton')}
          onClick={() => setShowConfirm(true)}
          fullWidth
        />
      </div>

      {showConfirm && (
        <Modal
          title={t('loan.confirmTitle')}
          onClose={() => setShowConfirm(false)}
          disableBackdropClose={createLoanMutation.isPending}
          actions={
            <>
              <Button
                variant="secondary"
                text={t('common.cancel')}
                onClick={() => setShowConfirm(false)}
                disabled={createLoanMutation.isPending}
              />
              <Button
                variant="primary"
                text={t('loan.requestButton')}
                onClick={requestLoan}
                loading={createLoanMutation.isPending}
              />
            </>
          }
        >
          <p>{t('loan.confirmBody', { name: friend?.first_name ?? '…', item: targetProduct.name })}</p>
        </Modal>
      )}

      {showSuccess && (
        <Modal
          title={t('loan.successTitle')}
          actions={
            <Button
              variant="primary"
              text={t('common.accept')}
              onClick={() => navigate('/products')}
            />
          }
        >
          <p>{t('loan.successMessage')}</p>
        </Modal>
      )}

      {showError && (
        <Modal
          title={t('loan.errorTitle')}
          onClose={() => setShowError(false)}
          actions={
            <Button
              variant="secondary"
              text={t('common.cancel')}
              onClick={() => setShowError(false)}
            />
          }
        >
          <p>{t('loan.errorMessage')}</p>
        </Modal>
      )}
    </div>
  );
};

export default Loan;
