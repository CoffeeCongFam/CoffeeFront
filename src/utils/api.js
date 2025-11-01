import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api", // 공통 prefix
  timeout: 50000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("✅ 서버 응답 에러:", error.response);
    } else if (error.request) {
      console.error("❌ 요청은 갔는데 응답이 없음:", error.request);
    } else {
      console.error("🚨 요청 설정 중 에러:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
