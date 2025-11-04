import { Outlet } from "react-router-dom";
import { TokenService } from "./utils/api";

function App() {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
