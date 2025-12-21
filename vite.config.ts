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
        // Change from "same-origin" to allow the login popup to talk to the app
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
        // Change from "require-corp" to "unsafe-none" to stop blocking Firebase resources
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
