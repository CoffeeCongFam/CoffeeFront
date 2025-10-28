import React from "react";
import { Outlet } from "react-router-dom";

function StoreLayout() {
  return (
    <div>
      점주 레이아웃
      <Outlet />
    </div>
  );
}

export default StoreLayout;
