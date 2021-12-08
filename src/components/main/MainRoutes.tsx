import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AddCategory from '../content/AddCategory';
import AddProduct from '../content/AddProduct';
import Admin from '../admin/Admin';
import Buy from '../apps/Buy';
import CategoryPage from '../content/CategoryPage';
import Content from '../content/Content';
import Charts from '../apps/Charts';
import Exchange from '../apps/Exchange';
import Friends from '../content/Friends';
import Loan from '../apps/Loan';
import Products from '../content/Products';
import Product from '../content/Product';
import Support from '../apps/Support';
import Tickets from '../apps/Tickets';
import Test from '../apps/Test';
import Cards from '../apps/Cards';
import Test4 from '../apps/Test4';
// import Test2 from '../apps/Test2';

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Content />} />
      <Route path="StuffieReact" element={<Content />} />
      <Route path="admin" element={<Admin />} />
      <Route path="friends" element={<Friends />} />
      <Route path="products" element={<Products />} />
      <Route path="product/add" element={<AddProduct />} />
      <Route path="product/:id" element={<Product />} />
      <Route path="category/add" element={<AddCategory type='category' />} />
      <Route path="category/:id" element={<CategoryPage />} />
      <Route path="subcategory/add" element={<AddCategory type='subcategory' />} />
      <Route path="subcategory/:id" element={<CategoryPage />} />
      <Route path="exchange" element={<Exchange />} />
      <Route path="loan" element={<Loan />} />
      <Route path="buy" element={<Buy />} />
      <Route path="charts" element={<Charts />} />
      <Route path="support" element={<Support />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="test" element={<Test />} />
      <Route path="cards" element={<Cards />} />
      <Route path="test4" element={<Test4 />} />
      {/* <Route path="/test2" element={<Test2 />} /> */}
    </Routes>
  );
}

export default MainRoutes;
