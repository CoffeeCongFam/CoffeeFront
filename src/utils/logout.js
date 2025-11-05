import axios from "axios";

export const handleLogout = () => {
  console.log("REQUEST LOGOUT-----------------------------");
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
  const CLIENT_KEY = import.meta.env.VITE_CLIENT_KEY;
  axios
    .post("http://localhost:8080/api/logout", {}, { withCredentials: true })
    .then(() => {
      // 카카오 로그아웃
      const URI = `https://kauth.kakao.com/oauth/logout?client_id=${CLIENT_KEY}&logout_redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}`;

      // localStorage 삭제
      localStorage.removeItem("user");
      localStorage.clear();

      window.location.href = URI;
    });
};
