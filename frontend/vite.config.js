// vite.config.js
// Vite configuration for the React frontend.
// The proxy setting forwards any /api request from the dev server
// to the Express backend on port 5000, so we never have to hardcode
// the backend URL inside API calls — and it avoids CORS issues during dev.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // React dev server port
    proxy: {
      // All requests starting with /api are forwarded to the backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
