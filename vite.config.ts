import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { offline } from "./scripts/offline";
export default defineConfig({
  plugins: [react(), offline()],
  server: { port: Number(process.env.VITE_PORT || 5173), strictPort: true },
  test: { include: ["src/**/*.test.ts"] },
});
