// src/App.jsx
import { Outlet, useLocation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import api, { TokenService } from "./utils/api";
import { Fade } from "@mui/material"; 
import useUserStore from "./stores/useUserStore";
import useNotificationStore from "./stores/useNotificationStore";
import { fetchNotificationList } from "./apis/notificationApi";
import useAppShellMode from "./hooks/useAppShellMode";
import SplashScreen from "./pages/home/SplashScreen";


const SPLASH_DURATION = 2600; // 스플래시 유지 시간 (2.6초)
const SPLASH_FADE = 800;      // 페이드 시간 (0.8초)


// 로그인 없이 접근 가능한 경로
const PUBLIC_PATHS = [
  "/", // 랜딩
  "/signup",
  "/auth/kakao/callback",
  "/kakaoRedirect",
  "/kakaoRedirectProd",
  "/customerSignUp",
  "/cafeSignUp",
  "/memberSignUp",
  "/withdrawal",
  "/relanding",
];

function connectSSE(addNotification) {

  const BASE_URL = import.meta.env.VITE_API_URL;
  const url = `${BASE_URL}/api/common/connect`;
  const source = new EventSource(url, { withCredentials: true });

  // SSE 연결 성공 로그
  source.onopen = () => {
    console.log("✅ SSE connection opened");
  };

  // onmessage 와 addEventListner 이중으로 잡기 => onmessage를 메인으로 쓰고, addEventListener('notification')은 보조로

  // 기본 message 이벤트 (event: 라벨 없는 경우)
  source.onmessage = (event) => {
    console.log("🌐 SSE default message:", event.data);
    try {
      const newNotification = JSON.parse(event.data);
      addNotification(newNotification);
    } catch (e) {
      console.error("❌ Failed to parse SSE message", e);
    }
  };

  // 커스텀 이벤트 (event: notification) 지원
  source.addEventListener("notification", (event) => {
    console.log("🔔 SSE [notification] event:", event.data);
    try {
      const newNotification = JSON.parse(event.data);
      addNotification(newNotification);
    } catch (e) {
      console.error("❌ Failed to parse SSE notification", e);
    }
  });

  // 에러 핸들링
  source.onerror = (error) => {
    console.error("SSE connection error:", error);
  };

  return source;
}

function App() {
  const { authUser, setUser, setPartnerStoreId } = useUserStore();
  const eventSourceRef = useRef(null);
  const location = useLocation();

  const { isAppLike } = useAppShellMode();

  // 새로 앱을 켰을 때만 스플래시 화면 보이도록
  const [showSplash, setShowSplash] = useState(() => {
    const already = sessionStorage.getItem("coffiens_splash_shown");
    return !already; // 저장된 게 없으면 true
  });

  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications
  );

  // 서버에서 내 정보 가져오기 (쿠키 기반)
  const fetchMe = useCallback(async () => {
    try {
      const res = await api.post("/login");
      const userData = res.data?.data;

      console.log("user data from '/login'", userData);

      if (userData) {
        setUser(userData);
        TokenService.setUser(userData);

        if (userData.partnerStoreId) {
          setPartnerStoreId(userData.partnerStoreId);
          console.log(
            `Partner Store ID ${userData.partnerStoreId} 저장 완료.`
          );
        }
      }
    } catch (err) {
      console.warn("me 호출 실패", err);
    }
  }, [setUser, setPartnerStoreId]);

  // 알림 내역 가져오기
  async function loadNotifications() {
    try {
      const list = await fetchNotificationList();
      setNotifications(list);
      console.log("🔔 알림 초기 로드 완료.");
    } catch (err) {
      console.error("알림 로드 실패:", err);
    }
  }

  // app 처음 로드 시 스플래시 노출 (appLike 모드에서)
  useEffect(() => {
    if (!isAppLike) {
      setShowSplash(false);
      return;
    }

    if (!showSplash) return;

    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("coffiens_splash_shown", "true");
    }, SPLASH_DURATION); // 1500 → SPLASH_DURATION

    return () => clearTimeout(timer);
  }, [isAppLike, showSplash]);

  // SSE 연결 / 해제
  useEffect(() => {
    if (!authUser?.memberId) {
      // authUser가 사라졌을 때 남은 SSE 연결이 있다면 정리
      if (eventSourceRef.current) {
        console.log("❌ SSE 연결 해제 (authUser 없음)");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    loadNotifications();

    console.log(`⚡ user id ${authUser.memberId} 로 SSE 연결 시작...`);
    // 기존 연결이 혹시 남아있다면 먼저 정리
    if (eventSourceRef.current) {
      console.log("기존 SSE 연결 발견 → 먼저 해제");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

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

  // 라우트 변경 시 로그인 상태 동기화
  useEffect(() => {
    // 퍼블릭 페이지면 아무것도 안 함
    if (PUBLIC_PATHS.includes(location.pathname)) return;

    const cachedUser = TokenService.getUser();

    // 캐시도 없고, store에도 유저 없으면 ==> 서버에 진짜 로그인 여부 확인
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

  // 랜딩 페이지(/) 또는 탈퇴 페이지(/withdrawal) 진입 시 localStorage 초기화
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/withdrawal") {
      localStorage.clear();
      console.log("localStorage cleared on landing/withdrawal render");
    }
  }, [location.pathname]);


  return (
    <>
    <div>
      <main>
        <Outlet />
      </main>
    </div>
    {isAppLike && (
      <Fade
        in={showSplash}
        timeout={SPLASH_FADE}
        unmountOnExit
      >
        <SplashScreen />
      </Fade>
    )}

    </>
  );
}

export default App;
