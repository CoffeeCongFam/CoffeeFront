import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import LandingPage from "../pages/home/Landing";
import Login from "../pages/home/Login";
import SignUp from "../pages/home/SignUp";
import CustomerLayout from "../layout/CustomerLayout" // PWA 레이아웃
// import CustomerLayout from "../common/CustomerLayout";   // 데스크탑 전용 레이아웃
import CustomerHome from "../pages/customer/CustomerHome";
import StoreLayout from "../common/StoreLayout";
import StoreHome from "../pages/cafe/StoreHome";
import AdminLayout from "../common/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import OrderPage from "../pages/customer/OrderPage";
import SearchPage from "../pages/customer/SearchPage";
import MyPage from "../pages/customer/MyPage";
import CreateOrderPage from "../pages/customer/CreateOrderPage";
import CompleteOrderPage from "../pages/customer/CompleteOrderPage";
import StoreDetailPage from "../pages/customer/StoreDetailPage";
import PurchaseSubscriptionPage from "../pages/customer/PurchaseSubscriptionPage";
import CompletePurchasePage from "../pages/customer/CompletePurchasePage";
import GiftSubscriptionPage from "../pages/customer/GiftSubscriptionPage";
import Gift from "../pages/customer/Gift";
import PaymentHistory from "../pages/customer/PaymentHistory";
import MyGift from "../pages/customer/MyGift";
import Subscription from "../pages/customer/Subscription";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
    ],
  },

  // 일반 회원
  // TODO!!! me 뒤에 :memberId 추가 필요
  {
    path: "/me",
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <CustomerHome />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "order",
        element: <OrderPage />,
      },
      {
        path: "order/new",
        element: <CreateOrderPage />,
      },
      {
        path: "order/:orderId",
        element: <CompleteOrderPage />,
      },
      {
        path: "mypage",
        element: <MyPage />,
      },
      {
        path: "store/:storeId",
        element: <StoreDetailPage />,
      },

      // 구독권 구매
      {
        path: "subscriptions/:subId/purchase",
        element: <PurchaseSubscriptionPage />,
      },
      //
      {
        path: "purchase/:purchaseId/complete",
        element: <CompletePurchasePage />,
      },
      {
        path: "subscriptions/:subId/gift",
        element: <GiftSubscriptionPage />,
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
  // :storeId 붙여야 함.
  {
    path: "/store",
    element: <StoreLayout />,
    children: [
      {
        index: true,
        element: <StoreHome />,
      },
    ],
  },

  // 관리자
  {
    path: "/admin",
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
