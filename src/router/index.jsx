import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import LandingPage from "../pages/home/Landing";
import SignUp from "../pages/home/SignUp";
import CustomerLayout from "../layout/CustomerLayout"; // PWA 레이아웃
// import CustomerLayout from "../common/CustomerLayout";   // 데스크탑 전용 레이아웃
import CustomerHome from "../pages/customer/home/CustomerHome";
import StoreLayout from "../common/StoreLayout";
import StoreHome from "../pages/cafe/StoreHome";
import AdminLayout from "../common/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import OrderPage from "../pages/customer/order/OrderPage";
import SearchPage from "../pages/customer/search/SearchPage";
import MyPage from "../pages/customer/MyPage";
import CreateOrderPage from "../pages/customer/order/CreateOrderPage";
import CompleteOrderPage from "../pages/customer/order/CompleteOrderPage";
import StoreDetailPage from "../pages/customer/home/StoreDetailPage";
import PurchaseSubscriptionPage from "../pages/customer/home/PurchaseSubscriptionPage";
import CompletePurchasePage from "../pages/customer/order/CompletePurchasePage";
import GiftSubscriptionPage from "../pages/customer/GiftSubscriptionPage";
import Gift from "../pages/customer/Gift";
import PaymentHistory from "../pages/customer/PaymentHistory";
import MyGift from "../pages/customer/MyGift";
import Subscription from "../pages/customer/Subscription";
import KakaoRedirect from "../pages/home/KakaoRedirect";
import CustomerSignUp from "../pages/home/CustomerSignUp";
import CafeSignUp from "../pages/home/CafeSignUp";
import MemberSignUp from "../pages/home/MemberSignUp";
import ErrorPage from "../common/error/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "signup",
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
