import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from '../shared/Loading';

// Eagerly loaded (home page)
import Content from '../content/Content';

// Lazy loaded routes - splits into separate chunks
const AddCategory = lazy(() => import('../content/AddCategory'));
const AddProduct = lazy(() => import('../content/AddProduct'));
const Admin = lazy(() => import('../admin/Admin'));
const Buy = lazy(() => import('../apps/Buy'));
const CategoryPage = lazy(() => import('../content/CategoryPage'));
const Charts = lazy(() => import('../apps/Charts'));
const Exchange = lazy(() => import('../apps/Exchange'));
const Friends = lazy(() => import('../content/Friends'));
const Loan = lazy(() => import('../apps/Loan'));
const Map = lazy(() => import('../apps/Map'));
const Products = lazy(() => import('../content/Products'));
const Product = lazy(() => import('../content/Product'));
const Spotify = lazy(() => import('../apps/Spotify'));
const Stuffier = lazy(() => import('../content/Stuffier'));
const SubcategoryPage = lazy(() => import('../content/SubcategoryPage'));
const Support = lazy(() => import('../apps/Support'));
const Tickets = lazy(() => import('../apps/Tickets'));
const Cards = lazy(() => import('../apps/Cards'));

const MainRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
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
      <Route path="spotify" element={<Spotify />} />
      <Route path="support" element={<Support />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="cards" element={<Cards />} />
    </Routes>
    </Suspense>
  );
}

export default MainRoutes;
