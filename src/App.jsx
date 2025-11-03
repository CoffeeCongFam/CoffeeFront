import { Outlet } from "react-router-dom";

function App() {
  (
    <>
      <div>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
