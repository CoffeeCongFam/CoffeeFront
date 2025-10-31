import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import LandingPage from '../pages/home/Landing';
import Login from '../pages/home/Login';
import SignUp from '../pages/home/SignUp';
import CustomerLayout from '../common/CustomerLayout';
import CustomerHome from '../pages/customer/CustomerHome';
import StoreLayout from '../common/StoreLayout';
import StoreHome from '../pages/cafe/StoreHome';
import AdminLayout from '../common/AdminLayout';
import AdminHome from '../pages/admin/AdminHome';
import OrderPage from '../pages/customer/OrderPage';
import SearchPage from '../pages/customer/SearchPage';
import MyPage from '../pages/customer/MyPage';
import CreateOrderPage from '../pages/customer/CreateOrderPage';
import CompleteOrderPage from '../pages/customer/CompleteOrderPage';
import StoreDetailPage from '../pages/customer/StoreDetailPage';
import PastOrders from '../pages/cafe/PastOrders';
import ManageProduct from '../pages/cafe/ManageProduct';
import ManageMenu from '../pages/cafe/ManageMenu';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <SignUp />,
      },
    ],
  },

  // 일반 회원
  {
    path: '/me',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <CustomerHome />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'order',
        element: <OrderPage />,
      },
      {
        path: 'order/new',
        element: <CreateOrderPage />,
      },
      {
        path: 'order/:orderId',
        element: <CompleteOrderPage />,
      },
      {
        path: 'mypage',
        element: <MyPage />,
      },
      {
        path: 'store/:storeId',
        element: <StoreDetailPage />,
      },
    ],
  },

  // 점주
  {
    path: '/store',
    element: <StoreLayout />,
    children: [
      {
        index: true,
        element: <StoreHome />,
      },
      {
        path: 'pastorders',
        element: <PastOrders />,
      },
      {
        path: 'manageMenu',
        element: <ManageMenu />,
      },
      {
        path: 'manageproduct',
        element: <ManageProduct />,
      },
    ],
  },

  // 관리자
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminHome />,
      },
    ],
  },
]);

export default router;
