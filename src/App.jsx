import { Outlet } from "react-router-dom";
import { userState } from "./stores/userState";
import { useEffect } from "react";
import { TokenService } from './utils/api';

function App() {

  const setUser = userState((state) => state.setUser);

  useEffect(() => {
    const user = TokenService.getUser(); // localStorage에서 유저 꺼내기
    if (user) {
      setUser(user);
    }
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
