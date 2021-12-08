import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Auth from './Auth';
import Login from './Login';
import Register from './Register';

const TopRoutes = () => {
  return (
    <Routes>
      <Route path="/*" element={<Auth />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Routes>
  );
}

export default TopRoutes;
