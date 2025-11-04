 import axios from "axios";
 
 export const handleLogout = () => {
    axios.post("http://localhost:8080/api/logout", {}, {withCredentials: true})
    .then(() => {
      // 카카오 로그아웃
      const CLIENT_KEY = '53bac4df6aee1b9a1fcd8f24c7c663ef';
      const REDIRECT_URI = 'http://localhost:5173/'; // 로그아웃 후 리디렉션 주소
      const URI = `https://kauth.kakao.com/oauth/logout?client_id=${CLIENT_KEY}&logout_redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
      window.location.href = URI;
      });
  };