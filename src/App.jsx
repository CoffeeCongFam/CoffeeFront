import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import api, { TokenService } from "./utils/api";
import useUserStore from "./stores/useUserStore";
import { ThemeProvider } from "@emotion/react";
import useNotificationStore from "./stores/useNotificationStore";

function connectSSE(addNotification) {
  // connectSSE 함수가 store의 addNotification 액션을 인수로 받음
  const BASE_URL = import.meta.env.VITE_API_URL;
  const url = `${BASE_URL}/api/common/connect`;
  const source = new EventSource(url, { withCredentials: true });

  // onmessage 대신 addEventListenr 사용해서 notification 이벤트만 수신
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

  return source; // EventSource 인스턴스 반환
}

function App() {
  const navigate = useNavigate();
  // 유저 정보 캐시 확인
  const userCache = TokenService.getUser();
  const { authUser, setUser, setPartnerStoreId } = useUserStore();
  const eventSourceRef = useRef(null);
  const location = useLocation();

  // notification action 가져오기
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications
  );

  // 로그인 없이 접근 가능한 경로들
  const PUBLIC_PATHS = [
    "/", // 랜딩
    "/signup",
    "/kakaoRedirect",
    "/customerSignUp",
    "/cafeSignUp",
    "/MemberSignUp",
  ];

  //

  async function fetchMe() {
    try {
      const res = await api.post("/login");
      const userData = res.data?.data;

      console.log("user data from '/login'", userData);

      if (userData) {
        setUser(userData);
        // 원하면 최소 정보만 로컬에 캐시
        TokenService.setUser(userData);

        if (userData.partnerStoreId) {
          setPartnerStoreId(userData.partnerStoreId);
          console.log(
            `✅ Partner Store ID ${userData.partnerStoreId} 저장 완료.`
          );
        }
      }
    } catch (err) {
      console.warn("me 호출 실패", err);
      navigate("/");
      // 여기서는 바로 navigate("/") 하지 말고,
      // 보호 라우트 쪽에서만 처리하는 게 더 안정적
    }
  }

  // SSE 연결 및 해제
  useEffect(() => {
    // authUser가 확정될 때까지 대기
    if (!authUser?.memberId) return;

    // A. 알림 목록 로드 (authUser 확정 후)
    async function loadNotifications() {
      try {
        const res = await api.get(`/common/notification`);
        if (res.data?.data) {
          setNotifications(res.data.data);
          console.log("🔔 알림 초기 로드 완료.");
        }
      } catch (err) {
        console.error("알림 로드 실패:", err); // navigate를 호출하지 않음
      }
    }
    loadNotifications();

    // B. SSE 연결 (authUser 확정 후)
    console.log(`⚡ user id ${authUser.memberId} 로 SSE 연결 시작...`);
    const source = connectSSE(addNotification);
    eventSourceRef.current = source;

    return () => {
      // Clean-up
      if (eventSourceRef.current) {
        console.log("❌ SSE 연결 해제");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [authUser?.memberId, addNotification, setNotifications]);
  // useEffect(() => {
  //   if (!authUser?.memberId) return;

  //   console.log(`user id ${authUser.memberId} 로 SSE 연결 시작...`);

  //   const source = connectSSE(addNotification); // 새로운 인스턴스 생성
  //   eventSourceRef.current = source;

  //   console.log(`user id ${authUser.memberId} 로 SSE 연결 완료...`);

  //   return () => {
  //     if (eventSourceRef.current) {
  //       console.log("SSE 연결 해제");
  //       eventSourceRef.current.close();
  //       eventSourceRef.current = null;
  //     }
  //   };
  // }, [authUser?.memberId, addNotification]);

  // useEffect(() => {
  //   console.log("APP MOUNT----------------------------------");

  //   if (PUBLIC_PATHS.includes(location.pathname)) {
  //     return;
  //   }

  //   if (!user) {
  //     // 유저 정보 없으면 서버에 나 조회 요청
  //     fetchMe();
  //     fetchAllNotification();
  //   } else {
  //     // 유저 정보 있으면 유저 세팅
  //     setUser(user);

  //     console.log("파트너 스토어 테스트>> ", user);

  //     if (user.memberType === "STORE" && user.partnerStoreId) {
  //       setPartnerStoreId(user.partnerStoreId);
  //       console.log(
  //         `✅ 캐시된 Partner Store ID ${user.partnerStoreId}로 설정.`
  //       );
  //     } else {
  //       console.warn(
  //         "⚠️ 캐시된 사용자 정보에 partnerStoreId가 없습니다. fetchMe 재시도."
  //       );
  //       fetchMe();
  //     }
  //   }
  // }, [location.pathname, setUser, setPartnerStoreId]);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(location.pathname)) {
      return;
    }

    if (!userCache) {
      // 캐시 없으면 서버에 인증 요청
      fetchMe();
    } else {
      // 캐시 있으면 Store에 설정 (인증 로직을 거쳤다는 가정)
      setUser(userCache);
      // partnerStoreId 설정 로직 추가
    }
  }, [location.pathname, setUser, setPartnerStoreId]);

  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;