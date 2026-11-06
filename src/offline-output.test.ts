import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const require = createRequire(import.meta.url);
const vite = join(dirname(require.resolve("vite/package.json")), "bin/vite.js");
const plugin = fileURLToPath(new URL("../scripts/offline.ts", import.meta.url));

test.each(["default", "nested-root", "relative-output", "absolute-output"])(
  "precaches only the real Vite output: %s",
  (scenario) => {
    const fixture = realpathSync(mkdtempSync(join(tmpdir(), "junyan-offline-")));
    try {
      const root = join(fixture, "app");
      const cwd = scenario === "default" ? root : fixture;
      const outDir = scenario === "relative-output" ? "release/site"
        : scenario === "absolute-output" ? join(fixture, "absolute-output") : "dist";
      const output = resolve(root, outDir);
      const unrelated = join(fixture, "dist");
      mkdirSync(join(root, "public/audio"), { recursive: true });
      mkdirSync(output, { recursive: true });
      mkdirSync(unrelated, { recursive: true });
      writeFileSync(join(unrelated, "unrelated.txt"), "must remain untouched");
      writeFileSync(join(unrelated, "sw.js"), "previous unrelated worker");
      writeFileSync(join(output, "stale.txt"), "not part of the new build");
      writeFileSync(join(root, "index.html"), '<main>fixture</main><script type="module" src="/main.js"></script>');
      writeFileSync(join(root, "main.js"), 'document.querySelector("main").textContent = "current build";');
      writeFileSync(join(root, "public/audio/current.mp3"), "current public audio bytes");
      const config = join(fixture, "vite.config.mts");
      writeFileSync(config, `import { offline } from ${JSON.stringify(plugin)};
export default { ${scenario === "default" ? "" : `root: ${JSON.stringify(root)},`}
  base: "./", plugins: [offline()], build: { ${scenario.endsWith("output") ? `outDir: ${JSON.stringify(outDir)},` : ""} emptyOutDir: true }
};`);
      const build = () => execFileSync(process.execPath, [vite, "build", "--config", config], { cwd, stdio: "pipe" });
      build();
      const worker = readFileSync(join(output, "sw.js"), "utf8");
      const files: string[] = JSON.parse(worker.match(/const FILES=(\[.*?\])\.map/)![1]);
      const emitted = readdirSync(output, { recursive: true, withFileTypes: true })
        .filter(file => file.isFile() && file.name !== "sw.js")
        .map(file => resolve(file.parentPath, file.name).slice(output.length + 1).replaceAll("\\", "/"));
      expect(files).toEqual(["./", ...emitted]);
      expect(files).toContain("audio/current.mp3");
      expect(files.some(file => /^assets\/.+\.js$/.test(file))).toBe(true);
      expect(files).toContain("index.html");
      expect(files).not.toContain("stale.txt");
      expect(files).not.toContain("unrelated.txt");
      expect(files.every(file => !file.includes("\\") && !file.startsWith("/"))).toBe(true);
      const hash = createHash("sha256");
      for (const file of files.slice(1)) hash.update(readFileSync(join(output, file)));
      const cache = `junyan-${hash.digest("hex").slice(0, 12)}`;
      expect(worker).toContain(`const CACHE=${JSON.stringify(cache)};`);
      expect(readFileSync(join(unrelated, "unrelated.txt"), "utf8")).toBe("must remain untouched");
      expect(readFileSync(join(unrelated, "sw.js"), "utf8")).toBe("previous unrelated worker");
      if (scenario === "absolute-output") {
        writeFileSync(join(root, "public/audio/current.mp3"), "changed public audio bytes");
        build();
        expect(readFileSync(join(output, "sw.js"), "utf8")).not.toContain(`const CACHE=${JSON.stringify(cache)};`);
      }
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  20_000,
);
