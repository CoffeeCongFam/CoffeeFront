// import axios from "axios";
import api from "./api";

export const handleLogout = () => {
  console.log("REQUEST LOGOUT-----------------------------");
  api.post("/logout", {}, { withCredentials: true }).then(() => {
    // 카카오 로그아웃
    const CLIENT_KEY = "53bac4df6aee1b9a1fcd8f24c7c663ef";
    const REDIRECT_URI = import.meta.env.VITE_CLIENT_HOST; // 로그아웃 후 리디렉션 주소
    const URI = `https://kauth.kakao.com/oauth/logout?client_id=${CLIENT_KEY}&logout_redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}/`;

    // localStorage 삭제
    localStorage.removeItem("user");
    localStorage.clear();

    window.location.href = URI;
  });
};
