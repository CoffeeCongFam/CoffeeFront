import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: false, // manifest 를 외부 파일로 사용할 경우 false 로 설정
    }),
  ],
  server: {
    proxy: {
      // 백엔드
      "/api": {
        target: "https://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

// PWA 플러그인은 서비스워커만 만들어주고
// manifest 파일은 public/manifest.json 으로 외부에서 주는 구조
