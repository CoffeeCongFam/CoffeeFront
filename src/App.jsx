import { Outlet, useLocation } from "react-router-dom";
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

  // source.onmessage = (event) => {
  //   try {
  //     console.log("");
  //     const newNotification = JSON.parse(event.data);
  //     // 수신 데이터를 Store 액션으로 상태에 저장
  //     addNotification(newNotification);
  //   } catch (e) {
  //     console.log("FAILED TO PARSE SSE MESSAGE", e);
  //   }
  // };

  source.onerror = (error) => {
    console.error("SSE connection error:", error);
  };

  return source; // EventSource 인스턴스 반환
}

function App() {
  // 유저 정보 캐시 확인
  const user = TokenService.getUser();
  const { authUser, setUser, setPartnerStoreId } = useUserStore();
  const eventSourceRef = useRef(null);
  const location = useLocation();

  // notification action 가져오기
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  // 로그인 없이 접근 가능한 경로들
  const PUBLIC_PATHS = [
    "/", // 랜딩
    "/signup",
    "/kakaoRedirect",
    "/customerSignUp",
    "/cafeSignUp",
    "/MemberSignUp",
    "/withdrawal"
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
      // 여기서는 바로 navigate("/") 하지 말고,
      // 보호 라우트 쪽에서만 처리하는 게 더 안정적
    }
  }

  // SSE 연결 및 해제
  useEffect(() => {
    if (!authUser?.memberId) return;

    console.log(`user id ${authUser.memberId} 로 SSE 연결 시작...`);

    const source = connectSSE(addNotification); // 새로운 인스턴스 생성
    eventSourceRef.current = source;

    console.log(`user id ${authUser.memberId} 로 SSE 연결 완료...`);

    return () => {
      if (eventSourceRef.current) {
        console.log("SSE 연결 해제");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [authUser?.memberId, addNotification]);

  // useEffect(() => {
  //   console.log("SSE 연결 useEffect 실행"); // 인증된 사용자의 memberId가 있을 때만 연결 시도

  //   if (authUser?.memberId) {
  //     console.log("SSE : USER상태 설정 되어 있음. 연결 시작.");
  //     const source = connectSSE(addNotification);

  //     // 3. setEventSource 제거. 인스턴스는 클린업 함수에서 바로 사용

  //     return () => {
  //       // 컴포넌트 언마운트 또는 authUser.memberId 변경 시 기존 연결 해제
  //       console.log("SSE 연결 해제");
  //       source.close(); // 생성된 source 인스턴스를 닫음
  //     };
  //   }

  //   // authUser?.memberId가 없으면 연결하지 않고, 클린업 함수에서 아무것도 하지 않음
  //   return () => {};

  //   // 4. 의존성 배열에서 eventSource 제거
  // }, [authUser?.memberId, addNotification]);

  // useEffect(() => {
  //   console.log("sse 연결");
  //   // user 상태가 설정 되엇는지 확인
  //   if (!authUser?.memberId) {
  //     console.log("SSE : USER상태 설정 되어 있음");
  //     //
  //     console.log(`user id ${user.memberId} 로 SSE 연결 시작...`);
  //     // store 의 addNotification 을 인수로 전달

  //     const source = connectSSE(addNotification);
  //     setEventSource(source);

  //     // setEventSrouce 는 app 컴포넌트 내부
  //   }

  //   return () => {
  //     if (eventSource) {
  //       console.log("SSE 연결 해제");
  //       eventSource.close();
  //       setEventSource(null);
  //     }
  //   };
  // }, [authUser, eventSource, addNotification]);

  useEffect(() => {
    console.log("APP MOUNT----------------------------------");

    if (PUBLIC_PATHS.includes(location.pathname)) {
      return;
    }

    if (!user) {
      // 유저 정보 없으면 서버에 나 조회 요청
      fetchMe();
    } else {
      setUser(user);

      console.log("파트너 스토어 테스트>> ", user);

      if (user.memberType === "STORE" && user.partnerStoreId) {
        setPartnerStoreId(user.partnerStoreId);
        console.log(
          `✅ 캐시된 Partner Store ID ${user.partnerStoreId}로 설정.`
        );
      } else {
        console.warn(
          "⚠️ 캐시된 사용자 정보에 partnerStoreId가 없습니다. fetchMe 재시도."
        );
        fetchMe();
      }
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