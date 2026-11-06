import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, resolve, sep } from "node:path";
import type { Plugin } from "vite";

export function offline(): Plugin {
  let outDir: string;
  return {
    name: "junyan-offline",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = readdirSync(outDir, {
        recursive: true,
        withFileTypes: true,
      })
        .filter((file) => file.isFile() && file.name !== "sw.js")
        .map((file) =>
          relative(outDir, join(file.parentPath, file.name)).split(sep).join("/"),
        );
      const version = createHash("sha256");
      for (const file of files) version.update(readFileSync(join(outDir, file)));
      const cache = `junyan-${version.digest("hex").slice(0, 12)}`;
      writeFileSync(
        join(outDir, "sw.js"),
        `
const CACHE=${JSON.stringify(cache)};
const FILES=${JSON.stringify(["./", ...files])}.map(file=>new URL(file,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('junyan-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
// Static same-origin assets have identical content regardless of Vary: Origin.
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request,{ignoreSearch:event.request.mode==='navigate',ignoreVary:true})).then(cached=>cached||fetch(event.request)));});
`,
      );
    },
  };
}
