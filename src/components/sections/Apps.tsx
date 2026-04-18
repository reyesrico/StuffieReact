import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './Apps.scss';

const Apps = (_props: any) => {
  const { t } = useTranslation();

  return (
    <div className="apps">
      <div className="apps__title">{t('apps.title')}</div>
      <div className="apps__item"><Link to='/tickets'>{t('apps.tickets')}</Link></div>
      <div className="apps__item"><Link to='/smart-add'>{t('apps.smartAdd')}</Link></div>
    </div>
  );
}

export default Apps;
