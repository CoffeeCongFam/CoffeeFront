import axios from "axios";
import api from "./api";

export const handleLogout = () => {
  console.log("REQUEST LOGOUT-----------------------------");
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
<<<<<<< HEAD
  const CLIENT_KEY = import.meta.env.VITE_CLIENT_KEY;
  api.post("/logout", {}, { withCredentials: true }).then(() => {
=======
  const CLIENT_KEY = import.meta.env.VITE_KAKAO_CLIENT_KEY;
<<<<<<< HEAD
  api.post("/logout").then(() => {
=======
  api.post("/logout", {}, { withCredentials: true }).then(() => {
>>>>>>> 0a8038a (점주 마이페이지 정보수정 ui + 매장 등록)
>>>>>>> b1f77a3 (점주 마이페이지 정보수정 ui + 매장 등록)
    // 카카오 로그아웃
    const URI = `https://kauth.kakao.com/oauth/logout?client_id=${CLIENT_KEY}&logout_redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}`;

    window.location.href = URI;

    // localStorage 삭제
    localStorage.removeItem("user");
    localStorage.clear();
  });
};
