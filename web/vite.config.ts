import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Web app reads the single shared content source at /content (repo root),
// not a duplicated copy, per the GDD's "one JSON, both platforms" architecture.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@content": path.resolve(__dirname, "../content"),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, ".."), path.resolve(__dirname, "../content")],
    },
  },
});
