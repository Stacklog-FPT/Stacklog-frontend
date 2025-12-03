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
    proxy: {
      '^/api/.*': {
        target: 'https://stacklog.id.vn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
