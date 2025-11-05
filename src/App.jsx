// App.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import api, { TokenService } from "./utils/api";
import useUserStore from "./stores/useUserStore";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";

function App() {
  const { setUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 없이 접근 가능한 경로들
  const PUBLIC_PATHS = [
    "/", // 랜딩
    "/signup",
    "/kakaoRedirect",
    "/customerSignUp",
    "/cafeSignUp",
    "/MemberSignUp",
  ];

  async function fetchMe() {
    try {
      const res = await api.post("/login");
      const userData = res.data?.data;

      console.log("user data from '/login'", userData);

      if (userData) {
        setUser(userData);
        // 원하면 최소 정보만 로컬에 캐시
        TokenService.setUser(userData);
      }
    } catch (err) {
      console.warn("me 호출 실패", err);
      // 여기서는 바로 navigate("/") 하지 말고,
      // 보호 라우트 쪽에서만 처리하는 게 더 안정적
    }
  }

  useEffect(() => {
    console.log("APP MOUNT----------------------------------");

    if (PUBLIC_PATHS.includes(location.pathname)) {
      return;
    }

    // 유저 정보 캐시 확인
    const user = TokenService.getUser();

    if (!user) {
      // 유저 정보 없으면 서버에 나 조회 요청
      fetchMe();
    } else {
      setUser(user);
    }
  }, [location.pathname, setUser]);

  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
