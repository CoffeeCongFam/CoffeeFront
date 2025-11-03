import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router/index.jsx";
import { RecoilRoot } from "recoil";
import { CssBaseline } from "@mui/material";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RecoilRoot>
      <CssBaseline />
      <RouterProvider router={router} />
    </RecoilRoot>
  </StrictMode>
);
