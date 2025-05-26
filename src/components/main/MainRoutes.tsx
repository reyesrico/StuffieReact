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
import Map from '../apps/Map';
import Products from '../content/Products';
import Product from '../content/Product';
import Stuffier from '../content/Stuffier';
import SubcategoryPage from '../content/SubcategoryPage';
import Support from '../apps/Support';
import Tickets from '../apps/Tickets';
import Test from '../apps/Test';
import Cards from '../apps/Cards';
import Test4 from '../apps/Test4';
import Test5 from '../apps/Test5';
import Tetris from '../apps/tetris/Tetris';
// import Test2 from '../apps/Test2';

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Content />} />
      <Route path="StuffieReact" element={<Content />} />
      <Route path="stuffier" element={<Stuffier />} />
      <Route path="admin" element={<Admin />} />
      <Route path="friends" element={<Friends />} />
      <Route path="products" element={<Products />} />
      <Route path="product/add" element={<AddProduct />} />
      <Route path="product/:id" element={<Product />} />
      <Route path="category/add" element={<AddCategory type='category' />} />
      <Route path="category/:id" element={<CategoryPage />} />
      <Route path="subcategory/add" element={<AddCategory type='subcategory' />} />
      <Route path="subcategory/:id" element={<SubcategoryPage />} />
      <Route path="exchange" element={<Exchange />} />
      <Route path="loan" element={<Loan />} />
      <Route path="buy" element={<Buy />} />
      <Route path="map" element={<Map />} />
      <Route path="charts" element={<Charts />} />
      <Route path="support" element={<Support />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="test" element={<Test />} />
      <Route path="cards" element={<Cards />} />
      <Route path="test4" element={<Test4 />} />
      <Route path="test5" element={<Test5 />} />
      <Route path="tetris" element={<Tetris />} />
      {/* <Route path="/test2" element={<Test2 />} /> */}
    </Routes>
  );
}

export default MainRoutes;
