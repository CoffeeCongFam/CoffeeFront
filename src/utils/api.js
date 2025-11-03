// src/utils/api.js
import axios from "axios";

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
  withCredentials: true, // HttpOnly 쿠키 사용 (브라우저가 자동으로 쿠키를 포함해서 요청을 보내줌.)
  headers: {
    "Content-Type": "application/json",
  },
});


// Access Token을 관리 헬퍼 함수 (localStorage 사용)
const TokenService = {
  getLocalAccessToken: () => {
    return localStorage.getItem('accessToken');
  },
  updateLocalAccessToken: (token) => {
    localStorage.setItem('accessToken', token);
  },
  removeLocalAccessToken: () => {
    localStorage.removeItem('accessToken');
  },
  // user 정보 관련 함수
  getUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  removeUser: () => {
    localStorage.removeItem('user');
  }
};

// 요청 인터셉터: 모든 요청 헤더에 Access Token 추가
api.interceptors.request.use(
  (config) => {
    const token = TokenService.getLocalAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 공통 에러 로깅 / 응답 인터셉터: Access Token 만료 시 재발급 처리
api.interceptors.response.use((response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // 401 에러이고, 재시도 플래그가 없는 경우 (무한 루프 방지)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token을 사용하여 새 Access Token 발급 요청
        // Refresh Token은 `withCredentials: true` 설정으로 인해 쿠키에 담겨 자동으로 전송됩니다.
        const rs = await axios.post('YOUR_API_BASE_URL/auth/refresh-token', null, {
            withCredentials: true
        });
        
        const { accessToken } = rs.data; // 서버 응답에 새 Access Token 필드명 확인 필요
        
        // 새 Access Token 저장 및 헤더 업데이트
        TokenService.updateLocalAccessToken(accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // 이전 요청을 새 Access Token으로 재시도
        return api(originalRequest);
      } catch (_error) {
        // Refresh Token 만료 등 토큰 재발급 실패 시
        TokenService.removeLocalAccessToken();
        TokenService.removeUser();
        // 로그인 페이지로 리다이렉트 또는 로그아웃 처리
        // window.location.href = '/login';
        return Promise.reject(_error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
