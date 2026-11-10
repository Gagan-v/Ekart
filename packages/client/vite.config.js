import { defineConfig, loadEnv } from "vite";
import process from "node:process";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: { proxy: {
      "/api": { target: env.API_PROXY_TARGET || "http://localhost:5001", changeOrigin: true },
      "/cms": { target: env.CMS_PROXY_TARGET || "http://localhost:1337", changeOrigin: true, rewrite: (path) => path.replace(/^\/cms/, "") },
    } },
  };
});
