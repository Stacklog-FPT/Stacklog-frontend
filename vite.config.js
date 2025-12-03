import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  build: {
    rollupOptions: {
      external: ["xlsx", "file-saver"],
      makeAbsoluteExternalsRelative: false,
    },
  },
  server: {
    // Proxy /api requests in development to the real backend to avoid CORS.
    // ws: true enables WebSocket proxying for socket.io connections
    proxy: {
      "/api": {
        target: "https://stacklog.io.vn",
        changeOrigin: true,
        secure: false,
        // ws: true, // Enable WebSocket proxying for socket.io
      },
    },
  },
});
