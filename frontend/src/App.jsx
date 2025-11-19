import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Verify from './pages/Verify';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Failure from './pages/Failure';
import AdminLayout from './components/Admin/AdminLayout';
import AdminHomePage from './pages/AdminHomePage';
import UserManagement from './components/Admin/UserManagement';
import ProductManagement from './components/Admin/ProductManagement';
import EditProductPage from './components/Admin/EditProductPage';
import OrderMangement from './components/Admin/OrderMangement';
// import AdminOrders from './pages/AdminOrders';
// import AdminProducts from './pages/AdminProducts';

const router = createBrowserRouter([
  // Main site routes
  {
    path: '/',
    element: <>
      <Navbar />
      <Home />
      <Footer />
    </>
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/verify',
    element: <Verify />
  },
  {
    path: '/verify/:token',
    element: <VerifyEmail />
  },
  {
    path: '/profile/:userId',
    element: <>
      <Navbar />
      <Profile />
    </>
  },
  {
    path: '/products',
    element: <>
      <Navbar />
      <Products />
    </>
  },
  {
    path: '/cart',
    element: <>
      <Navbar />
      <Cart />
    </>
  },
  {
    path: '/checkout',
    element: <>
      <Navbar />
      <Checkout />
    </>
  },
  {
    path: '/payment/success',
    element: <>
      <Navbar />
      <Success />
    </>
  },
  {
    path: '/payment/failure',
    element: <>
      <Navbar />
      <Failure />
    </>
  },

  // Admin routes
  {
    path: '/admin',
    element: <AdminLayout />, // layout with sidebar/header
    children: [
      {
        index: true, // default page for /admin
        element: <AdminHomePage />
      },
      { 
        path: 'users',
        element: <UserManagement /> 
      },
      { 
        path: 'products',
        element: <ProductManagement /> 
      },
      { 
        path: 'products/:id/edit',
        element: <EditProductPage /> 
      },
       { 
        path: 'orders',
        element: <OrderMangement /> 
      }
      // Future admin pages
      // { path: 'orders', element: <AdminOrders /> },
      // { path: 'products', element: <AdminProducts /> }
    ]
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
