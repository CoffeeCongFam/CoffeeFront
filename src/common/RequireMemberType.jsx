import React from "react";
import { Navigate } from "react-router-dom";
import useUserStore from "../stores/useUserStore";
// 멤버 타입별로 로그인 가능 범위를 막는 가드

function RequireMemberType({ allow, children }) {
  const { authUser } = useUserStore();

  // 1) 로그인 안 된 상태
  if (!authUser) {
    console.log("로그인 안 됨! ----------------");
    return <Navigate to="/" replace />;
  }

  // 2) 멤버 타입 안 맞는 경우
  // user.memberType 값을 토큰/백엔드에서 내려주는 값에 맞게 사용
  if (!allow.includes(authUser.memberType)) {
    return <Navigate to="/" replace />;
  }

  // 3) 통과
  return children;
}

export default RequireMemberType;
