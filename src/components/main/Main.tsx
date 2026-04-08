import React, { Suspense, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import Apps from '../sections/Apps';
import Breadcrumb from '../shared/Breadcrumb';
import FloatingChat from '../sections/FloatingChat';
import { CHAT_VISIBLE_KEY } from '../sections/ChatToggle';
import { SPOTIFY_VISIBLE_KEY } from '../sections/SpotifyToggle';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import MainRoutes from './MainRoutes';
import Menu from '../sections/Menu';
import Settings from '../sections/Settings';
import SpotifyPlayer from '../sections/SpotifyPlayer';
import UserContext from '../../context/UserContext';
import { SpotifyProvider } from '../../context/SpotifyContext';
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
  const [chatVisible, setChatVisible] = React.useState<boolean>(
    localStorage.getItem(CHAT_VISIBLE_KEY) !== 'false'
  );
  const [spotifyVisible, setSpotifyVisible] = React.useState<boolean>(
    localStorage.getItem(SPOTIFY_VISIBLE_KEY) !== 'false'
  );

  React.useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === CHAT_VISIBLE_KEY) {
        setChatVisible(e.newValue !== 'false');
      }
      if (e.key === SPOTIFY_VISIBLE_KEY) {
        setSpotifyVisible(e.newValue !== 'false');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

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
    <SpotifyProvider>
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
                <Apps />
              </div>
              <div className="stuffie__left-section">
                <Settings />
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
          {spotifyVisible && (
            <div className="stuffie__right-section stuffie__right-section--spotify">
              <SpotifyPlayer />
            </div>
          )}
          <div className="stuffie__right-section">
            <Menu />
          </div>
        </div>
      </div>

      {/* Mobile-only fixed Spotify bar — shown when sidebars collapse */}
      {spotifyVisible && (
        <div className="stuffie__spotify-bar">
          <SpotifyPlayer variant="bar" />
        </div>
      )}

      {/* Footer - no data fetching, renders immediately */}
      <div className="stuffie_footer">
        <Footer />
      </div>

      {/* Floating AI chat — toggle in Settings › Support Chat */}
      {chatVisible && <FloatingChat />}
    </div>
    </SpotifyProvider>
  );
}

export default Main;
