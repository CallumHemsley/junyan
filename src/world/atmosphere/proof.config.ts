import {defineConfig} from 'vite';
export default defineConfig({
  build:{outDir:'output/0086-built-study',emptyOutDir:true,rollupOptions:{input:'src/world/atmosphere/harness.html'}},
  preview:{host:'0.0.0.0',port:5488,strictPort:true},
});
