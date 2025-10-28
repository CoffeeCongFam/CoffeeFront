import React from "react";
import { Outlet } from "react-router-dom";

function CustomerLayout() {
  return (
    <div>
      일반회원 레이아웃
      <Outlet />
    </div>
  );
}

export default CustomerLayout;
