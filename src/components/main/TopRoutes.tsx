import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Auth from './Auth';
import Login from './Login';
import Register from './Register';
import ThemeContext from '../../context/ThemeContext';

import "../../styles/theme.scss"; // Import the SCSS file

const TopRoutes = () => {
  const { theme } = React.useContext(ThemeContext);

  React.useEffect(() => {
    // console.log({ theme });
    // console.log({ doc: document.documentElement });
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/*" element={<Auth />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Routes>
  );
}

export default TopRoutes;
