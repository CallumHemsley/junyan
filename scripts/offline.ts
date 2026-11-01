import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import type { Plugin } from "vite";

export function offline(): Plugin {
  return {
    name: "junyan-offline",
    apply: "build",
    closeBundle() {
      const files = readdirSync("dist", {
        recursive: true,
        withFileTypes: true,
      })
        .filter((file) => file.isFile() && file.name !== "sw.js")
        .map((file) =>
          `${file.parentPath}/${file.name}`.replace(/^dist\//, ""),
        );
      const version = createHash("sha256");
      for (const file of files) version.update(readFileSync(`dist/${file}`));
      const cache = `junyan-${version.digest("hex").slice(0, 12)}`;
      writeFileSync(
        "dist/sw.js",
        `
const CACHE=${JSON.stringify(cache)};
const FILES=${JSON.stringify(["/", ...files.map((file) => `/${file}`)])};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('junyan-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
// Static same-origin assets have identical content regardless of Vary: Origin.
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request,{ignoreSearch:event.request.mode==='navigate',ignoreVary:true})).then(cached=>cached||fetch(event.request)));});
`,
      );
    },
  };
}
