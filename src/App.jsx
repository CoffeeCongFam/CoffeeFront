import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import api, { TokenService } from "./utils/api";
import useUserStore from "./stores/useUserStore";

function App() {
  const { setUser } = useUserStore();

  useEffect(() => {
    const initUser = async () => {
      // 1. localStorage에서 먼저 유저 복원 시도
      const storedUser = TokenService.getUser();
      console.log("storedUser >> ", storedUser);

      if (storedUser) {
        setUser(storedUser);
        console.log("Zustand setUser (from localStorage) 완료!!!");
        return;
      }

      // 2. 없으면 서버에 /login 요청해서 실제 로그인 상태 확인
      try {
        const res = await api.post("/login"); // baseURL: VITE_API_URL + /api
        const userData = res.data?.data;
        console.log("user data from /login >> ", userData);

        if (userData) {
          // 전역 상태 + localStorage 모두 세팅
          setUser(userData);
          TokenService.setUser(userData);
          console.log("TokenService & Zustand 저장 완료 ✅", userData);
        } else {
          console.warn("응답에 user 데이터가 없습니다.");
        }
      } catch (err) {
        console.error("로그인 정보 불러오기 실패 ❌", err);
      }
    };

    initUser();
  }, [setUser]);

  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
