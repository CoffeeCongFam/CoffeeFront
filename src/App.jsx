import { Outlet } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { RecoilRoot } from "recoil";

function App() {
  return (
    <RecoilRoot>
      {/* 전역 스타일 리셋 (body 기본 여백 제거 포함) */}
      <CssBaseline />

      <div>
        <main>
          <Outlet />
        </main>
      </div>
    </RecoilRoot>
  );
}

export default App;
