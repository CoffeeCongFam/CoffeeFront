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
import Gift from '../pages/customer/Gift';
import PaymentHistory from '../pages/customer/PaymentHistory';
import MyGift from '../pages/customer/MyGift';
import Subscription from '../pages/customer/Subscription';
import PastOrders from '../pages/cafe/PastOrders';
import ManageMenu from '../pages/cafe/ManageMenu';
import ManageProduct from '../pages/cafe/ManageProduct';
import ManageStoreInfo from '../pages/cafe/ManageStoreInfo';

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
            {
        path: "kakaoRedirect",
        element: <KakaoRedirect />,
      },
      {
        path: "customerSignUp",
        element: <CustomerSignUp />,
      },
      {
        path: "cafeSignUp",
        element: <CafeSignUp />,
      },
      {
        path: "MemberSignUp",
        element: <MemberSignUp />,
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
      {
        path: "subscription",
        element: <Subscription />,
      },
      {
        path: "gift",
        element: <Gift />,
      },
      {
        path: "mygift",
        element: <MyGift />,
      },
      {
        path: "paymentHistory",
        element: <PaymentHistory />,
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
      {
        path: 'manageStoreInfo',
        element: <ManageStoreInfo />,
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
