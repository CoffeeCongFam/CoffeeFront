// src/utils/api.js
import axios from "axios";
import useUserStore from "../stores/useUserStore";

// 1. Vite 환경변수에서 호스트 읽기
// ex) VITE_API_URL=http://localhost:8080  => 현재 port번호 8080
// 배포 후 ex)  VITE_API_HOST=https://api.coffeeens.com
const RAW_HOST = import.meta.env.VITE_API_URL || "";
const HOST = RAW_HOST.replace(/\/+$/, ""); // 끝에 / 있으면 제거

// 2. baseURL
//    백엔드 /api (prefix)
const BASE_URL = HOST ? `${HOST}/api` : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
  withCredentials: true, // HttpOnly 쿠키 자동 포함 (브라우저가 자동으로 쿠키를 포함해서 요청을 보내줌.)
  headers: {
    "Content-Type": "application/json",
  },
});

// 유저 정보만 캐싱하는 용도로만 사용 (선택)
export const TokenService = {
  getUser: () => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
  },
  removeUser: () => {
    localStorage.removeItem("user");
  },
};

// 요청 인터셉터
// withCredentials: true 로 쿠키는 전부 자동으로 붙음
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);


// ✅ 응답 인터셉터: 401이면 “쿠키에 accessToken 없다/만료”라고 보고 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // 1) localStorage에 저장해둔 user 제거
      TokenService.removeUser();

      // 2) zustand store 비우기
      try {
        const userStore = useUserStore.getState();
        userStore.clearUser();          // authUser = null
        userStore.setPartnerStoreId(null); // 점주 매장 ID도 초기화
      } catch (e) {
        console.error("zustand user 초기화 실패:", e);
      }

      // 3) 필요하면 서버 logout 호출 (선택)
      const HOST = import.meta.env.VITE_API_URL;
      try {
        await axios.post(`${HOST}/auth/logout`, null, { withCredentials: true });
      } catch (_) {}

      // 4) 강제 홈(/)으로 이동
      window.location.href = "/";
      return; // 여기서 끝내기
    }

    return Promise.reject(error);
  }
);

export default api;
