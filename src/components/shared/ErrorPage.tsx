import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import './ErrorPages.scss';

interface ErrorPageProps {
  message?: string;
}

const ErrorPage = ({ message }: ErrorPageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-page__code error-page__code--error">!</div>
      <h1 className="error-page__title">{t('errorPage.title')}</h1>
      <p className="error-page__desc">{message || t('errorPage.desc')}</p>
      <div className="error-page__actions">
        <Button
          variant="primary"
          text={t('notFound.goHome')}
          onClick={() => navigate('/')}
        />
        <Button
          variant="outline"
          text={t('common.tryAgain')}
          onClick={() => window.location.reload()}
        />
      </div>
    </div>
  );
};

export default ErrorPage;
