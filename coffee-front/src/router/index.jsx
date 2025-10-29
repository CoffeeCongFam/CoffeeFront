import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import LandingPage from "../pages/home/Landing";
import Login from "../pages/home/Login";
import SignUp from "../pages/home/SignUp";
import CustomerLayout from "../common/CustomerLayout";
import CustomerHome from "../pages/customer/CustomerHome";
import StoreLayout from "../common/StoreLayout";
import StoreHome from "../pages/cafe/StoreHome";
import AdminLayout from "../common/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import OrderPage from "../pages/customer/OrderPage";
import KakaoRedirect from "../pages/home/KakaoRedirect";
import CustomerSignUp from "../pages/home/CustomerSignUp";
import MemberSignUp from "../pages/home/MemberSignUp";

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
      {
        path: "kakaoRedirect",
        element: <KakaoRedirect />,
      },
      {
        path: "customerSignUp",
        element: <CustomerSignUp />,
      },
      {
        path: "memberSignUp",
        element: <MemberSignUp />,
      },
    ],
  },

  // 일반 회원
  {
    path: "/me",
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <CustomerHome />,
      },
      {
        path: "order",
        element: <OrderPage />,
      },
    ],
  },

  // 점주
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
