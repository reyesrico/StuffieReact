import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import Main from './Main';
import { RequireAuth, LoginPage, RegisterPage } from '../auth';
import { MainSkeleton } from '../skeletons';
import ThemeContext from '../../context/ThemeContext';

import "../../styles/theme.scss";

const TopRoutes = () => {
  const { theme } = React.useContext(ThemeContext);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected routes - wrapped in RequireAuth */}
      <Route 
        path="/*" 
        element={
          <RequireAuth>
            <Suspense fallback={<MainSkeleton />}>
              <Main />
            </Suspense>
          </RequireAuth>
        } 
      />
    </Routes>
  );
}

export default TopRoutes;
