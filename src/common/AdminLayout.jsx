import React from "react";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div>
      관리자 레이아웃
      <Outlet />
    </div>
  );
}

export default AdminLayout;
