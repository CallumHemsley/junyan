import { mergeConfig } from "vitest/config";
import base from "./vite.config";

export default mergeConfig(base, {
  cacheDir: "output/vite-audio-cache",
  server: { port: 5181, strictPort: true },
  preview: { port: 5185, strictPort: true },
});
