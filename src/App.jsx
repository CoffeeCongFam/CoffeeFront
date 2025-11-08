// src/App.jsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import api, { TokenService } from "./utils/api";
import useUserStore from "./stores/useUserStore";
import useNotificationStore from "./stores/useNotificationStore";
import { fetchNotificationList } from "./apis/notificationApi";

function connectSSE(addNotification) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const url = `${BASE_URL}/api/common/connect`;
  const source = new EventSource(url, { withCredentials: true });

  source.addEventListener("notification", (event) => {
    try {
      console.log("🔔 Custom Notification Event Received");
      console.log(event.data);
      const newNotification = JSON.parse(event.data);
      addNotification(newNotification);
    } catch (e) {
      console.log("FAILED TO PARSE SSE MESSAGE", e);
    }
  });

  source.onerror = (error) => {
    console.error("SSE connection error:", error);
  };

  return source;
}

function App() {
  const { authUser, setUser, setPartnerStoreId } = useUserStore();
  const eventSourceRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications
  );

  // 로그인 없이 접근 가능한 경로
  const PUBLIC_PATHS = [
    "/me",
    "/", // 랜딩
    "/signup",
    "/kakaoRedirect",
    "/customerSignUp",
    "/cafeSignUp",
    "/MemberSignUp",
    "/withdrawal",
  ];

  // ✅ 서버에서 내 정보 가져오기 (쿠키 기반)
  async function fetchMe() {
    try {
      const res = await api.post("/login"); // accessToken 쿠키 있으면 OK, 없으면 401
      const userData = res.data?.data;

      console.log("user data from '/login'", userData);

      if (userData) {
        setUser(userData);
        TokenService.setUser(userData); // 캐시

        if (userData.partnerStoreId) {
          setPartnerStoreId(userData.partnerStoreId);
          console.log(
            `✅ Partner Store ID ${userData.partnerStoreId} 저장 완료.`
          );
        }
      }
    } catch (err) {
      console.warn("me 호출 실패", err);
      // ⚠ 여기서 따로 navigate("/") 하지 않음
      // 401이면 api 인터셉터가 알아서 window.location = "/" 처리
    }
  }

  // ✅ SSE 연결 / 해제
  useEffect(() => {
    if (!authUser?.memberId) return;

    async function loadNotifications() {
      try {
        const list = await fetchNotificationList();
        setNotifications(list);
        console.log("🔔 알림 초기 로드 완료.");
      } catch (err) {
        console.error("알림 로드 실패:", err);
      }
    }
    loadNotifications();

    console.log(`⚡ user id ${authUser.memberId} 로 SSE 연결 시작...`);
    const source = connectSSE(addNotification);
    eventSourceRef.current = source;

    return () => {
      if (eventSourceRef.current) {
        console.log("❌ SSE 연결 해제");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [authUser?.memberId, addNotification, setNotifications]);

  // ✅ 라우트 변경 시 로그인 상태 동기화
  useEffect(() => {
    // 퍼블릭 페이지면 아무것도 안 함
    const path = location.pathname;

    const isPublic = PUBLIC_PATHS.includes(path) || path.startsWith("/me/"); // ✅ /me/로 시작하는 애들 전부 허용

    if (isPublic) {
      return;
    }

    const cachedUser = TokenService.getUser();

    // 캐시도 없고, store에도 유저 없으면 → 서버에 진짜 로그인 여부 확인
    if (!cachedUser && !authUser) {
      fetchMe(); // accessToken 없으면 여기서 401 ==> 인터셉터가 처리
      return;
    }

    // 캐시는 있는데 store에는 없으면 ==> 캐시로 복구
    if (cachedUser && !authUser) {
      setUser(cachedUser);
      if (cachedUser.partnerStoreId) {
        setPartnerStoreId(cachedUser.partnerStoreId);
      }
    }
    // cachedUser , authUser 이미 둘 다 있으면 아무것도 안 함
  }, [location.pathname, authUser, setUser, setPartnerStoreId]);

  // 로그인한 상태에서 '/' 접근 차단
  useEffect(() => {
    const storedUser = authUser || TokenService.getUser();
    if (!storedUser) return;

    if (location.pathname === "/") {
      if (storedUser.memberType === "STORE") {
        console.log("점주 로그인 상태에서 '/' 접근 차단 →/store 이동");
        // alert("로그인 중엔 메인 화면으로 돌아갈 수 없습니다.");
        navigate("/store", { replace: true });
      } else {
        console.log("일반회원 로그인 상태에서 '/' 접근 차단 → /me 이동");
        // alert("로그인 중엔 메인 화면으로 돌아갈 수 없습니다.");
        navigate("/me", { replace: true });
      }
    }
  }, [authUser, location.pathname, navigate]);

  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
