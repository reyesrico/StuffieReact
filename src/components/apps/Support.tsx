import React from 'react';
import { useTranslation } from 'react-i18next';
import './Support.scss';

const Support = () => {
  const { t } = useTranslation();
  return (
    <div className="support">
      <div className="support__header">
        <h2 className="support__title">{t('Support')}</h2>
      </div>
      <div className="support__frame">
        <iframe
          src='https://webchat.botframework.com/embed/StuffieBot?s=fkpQavtTB78.cwA.pjM.9djZJuhRob4Mt-Lb5-1Wk7yrsHtLAxOKIL6w3gE4910'
          title='WebChat'
        />
      </div>
    </div>
  );
}

export default Support;
