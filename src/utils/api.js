// src/utils/api.js
import axios from "axios";

// 1. Vite 환경변수에서 호스트 읽기
// ex) VITE_API_URL=http://localhost:5000  => 현재 port번호 5000
// 배포 후 ex)  VITE_API_HOST=https://api.coffeeens.com
const RAW_HOST = import.meta.env.VITE_API_URL || ""; 
const HOST = RAW_HOST.replace(/\/+$/, ""); // 끝에 / 있으면 제거

// 2. baseURL
//    백엔드가 전부 /api 밑으로 열려 있다고 했으니 여기서 붙여줌
const BASE_URL = HOST ? `${HOST}/api` : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
  withCredentials: true, // HttpOnly 쿠키 사용 (브라우저가 자동으로 쿠키를 포함해서 요청을 보내줌.)
  headers: {
    "Content-Type": "application/json",
  },
});

// 공통 에러 로깅
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("✅ 서버 응답 에러:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("❌ 요청은 갔는데 응답이 없음:", error.request);
    } else {
      console.error("🚨 요청 설정 중 에러:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
