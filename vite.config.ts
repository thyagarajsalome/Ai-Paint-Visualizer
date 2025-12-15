import path from "path";
import { defineConfig } from "vite"; // removed loadEnv as it is no longer used for the define block
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // You can remove the env loading if you don't need other env vars
  // const env = loadEnv(mode, ".", "");

  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    // --- REMOVE THIS DEFINE BLOCK ---
    // define: {
    //   "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    //   "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    // },
    // --------------------------------
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
