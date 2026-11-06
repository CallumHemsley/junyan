import {defineConfig} from 'vite';
export default defineConfig({
  build:{outDir:'output/0086-built-study',emptyOutDir:true,rollupOptions:{input:['src/world/atmosphere/harness.html','src/world/atmosphere/materials-study.html','src/world/atmosphere/production-lighting.html','src/world/atmosphere/shadow-study.html']}},
  preview:{host:'0.0.0.0',port:5488,strictPort:true},
});
