import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";

import ErrorPage from "../common/error/ErrorPage";
import LandingPage from "../pages/home/Landing";
import SignUp from "../pages/home/SignUp";

import CustomerLayout from "../layout/CustomerLayout";
import StoreLayout from "../layout/StoreLayout";
import StoreHome from "../pages/cafe/StoreHome";
import AdminLayout from "../common/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";

import CustomerHome from "../pages/customer/home/CustomerHome";
import OrderPage from "../pages/customer/order/OrderPage";
import SearchPage from "../pages/customer/search/SearchPage";
import CreateOrderPage from "../pages/customer/order/CreateOrderPage";
import CompleteOrderPage from "../pages/customer/order/CompleteOrderPage";
import StoreDetailPage from "../pages/customer/home/StoreDetailPage";
import PurchaseSubscriptionPage from "../pages/customer/home/PurchaseSubscriptionPage";
import CompletePurchasePage from "../pages/customer/order/CompletePurchasePage";

import MyPage from "../pages/customer/MyPage";
import Gift from "../pages/customer/Gift";
import GiftSubscriptionPage from "../pages/customer/GiftSubscriptionPage";
import PaymentHistory from "../pages/customer/PaymentHistory";
import MyGift from "../pages/customer/MyGift";
import Subscription from "../pages/customer/Subscription";

import KakaoRedirect from "../pages/home/KakaoRedirect";
import CustomerSignUp from "../pages/home/CustomerSignUp";
import CafeSignUp from "../pages/home/CafeSignUp";
import MemberSignUp from "../pages/home/MemberSignUp";

import PastOrders from "../pages/cafe/PastOrders";
import ManageMenu from "../pages/cafe/ManageMenu";
import ManageProduct from "../pages/cafe/ManageProduct";
import ManageStoreInfo from "../pages/cafe/ManageStoreInfo";
import CafeMyPage from "../pages/cafe/CafeMyPage";

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
      // 일반 회원
      {
        path: "me",
        element: (
          // <RequireMemberType allow={["GENERAL"]}>
          <CustomerLayout />
          // </RequireMemberType>
        ),
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
        ],
      },

      // 점주
      {
        path: "store",
        element: <StoreLayout />,
        children: [
          {
            index: true,
            element: <StoreHome />,
          },
          {
            path: "pastOrders",
            element: <PastOrders />,
          },
          {
            path: "cafeMyPage",
            element: <CafeMyPage />,
          },
          {
            path: "manageMenu",
            element: <ManageMenu />,
          },
          {
            path: "manageProduct",
            element: <ManageProduct />,
          },
          {
            path: "manageStoreInfo",
            element: <ManageStoreInfo />,
          },
        ],
      },
      // 관리자
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminHome />,
          },
        ],
      },
    ],
  },
]);

export default router;
