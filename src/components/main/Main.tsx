import React, { Suspense, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import Apps from '../sections/Apps';
import Breadcrumb from '../shared/Breadcrumb';
import FloatingChat from '../sections/FloatingChat';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import MainRoutes from './MainRoutes';
import Menu from '../sections/Menu';
import Settings from '../sections/Settings';
import UserContext from '../../context/UserContext';
import { 
  HeaderSkeleton, 
  SidebarSkeleton, 
  ProductGridSkeleton 
} from '../skeletons';
import {
  defaultImageUrl,
  existImage,
  userImageUrl
} from '../../lib/cloudinary';

import './Main.scss';

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: any) {
  const { t } = useTranslation();
  return (
    <div className="error-fallback">
      <p>{t('main.errorBoundaryTitle')}</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>{t('common.tryAgain')}</button>
    </div>
  );
}

const Main = () => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  const [picture, setPicture] = React.useState<string>();

  React.useEffect(() => {
    if (user?.id) {
      existImage(user.id, "stuffiers/")
        .then(_res => {
          setPicture(userImageUrl(user.id));
        })
        .catch(() => setPicture(defaultImageUrl));
    }
  }, [user?.id]);

  return (
    <div className="stuffie">
      {/* Header with error boundary */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<HeaderSkeleton />}>
          <div className="stuffie__header">
            <Header />
          </div>
        </Suspense>
      </ErrorBoundary>

      <div className="stuffie__main">
        {/* Left sidebar with error boundary */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<SidebarSkeleton />}>
            <div className="stuffie__left">
              <div className="stuffie__user">
                {picture && (
                  <Link to="/stuffier">
                    <img src={picture} className="stuffie__picture" alt={t('common.userPicAlt')}/>
                  </Link>
                )}
                <div className="stuffie__welcome">
                  {t('Welcome')}{user?.first_name}
                </div>
              </div>
              <div className="stuffie__left-section">
                <Menu />
              </div>
              <div className="stuffie__left-section">
                <Apps />
              </div>
            </div>
          </Suspense>
        </ErrorBoundary>

        {/* Main content with error boundary */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<ProductGridSkeleton count={6} />}>
            <div className="stuffie__content">
              <Breadcrumb />
              <div className="stuffie__content-inner">
                <MainRoutes />
              </div>
            </div>
          </Suspense>
        </ErrorBoundary>

        {/* Right sidebar */}
        <div className="stuffie__right">
          <div className="stuffie__right-section">
            <Settings />
          </div>
        </div>
      </div>

      {/* Footer - no data fetching, renders immediately */}
      <div className="stuffie_footer">
        <Footer />
      </div>

      {/* Floating AI chat — fixed bottom-right, available on all pages */}
      <FloatingChat />
    </div>
  );
}

export default Main;
