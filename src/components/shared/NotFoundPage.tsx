import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import './ErrorPages.scss';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-page__code">404</div>
      <h1 className="error-page__title">{t('notFound.title')}</h1>
      <p className="error-page__desc">{t('notFound.desc')}</p>
      <Button
        variant="primary"
        text={t('notFound.goHome')}
        onClick={() => navigate('/')}
      />
    </div>
  );
};

export default NotFoundPage;
