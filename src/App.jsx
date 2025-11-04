import { Outlet } from "react-router-dom";
import { TokenService } from "./utils/api";
import { useEffect } from "react";
import useUserStore from "./stores/useUserStore";

function App() {
  const { authUser } = useUserStore();

  useEffect(() => {
    console.log("APP ---------------------------");

    console.log("APP AUTHUSER-----------------------", authUser);
  }, []);
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
