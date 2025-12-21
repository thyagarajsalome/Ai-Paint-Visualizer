import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      headers: {
        // ALLOW popups to talk back to the app
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
        // CHANGE from "require-corp" to "unsafe-none" to stop blocking Firebase
        "Cross-Origin-Embedder-Policy": "unsafe-none",
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
