#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), "../../.."));
const [command, run = "proof"] = process.argv.slice(2);
assert.match(run, /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);
assert.equal(realpathSync(process.cwd()), root, "Run from this checkout root");
const evidence = join(root, "output/verification", run);
const manifest = join(evidence, "instance.json");
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const source = () => hash(git("ls-files", "-z", "src", "public", "scripts", "index.html", "package.json", "pnpm-lock.yaml", "tsconfig*", "vite*.ts")
  .split("\0").filter(Boolean).sort().map(path => `${path}:${hash(readFileSync(join(root, path)))}`).join("\n"));
const tree = directory => readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))
  .map(entry => entry.isDirectory() ? `${entry.name}/${tree(join(directory, entry.name))}` : `${entry.name}:${hash(readFileSync(join(directory, entry.name)))}`).join("\n");
const port = (value, fallback) => {
  const result = Number(value ?? fallback);
  assert(Number.isInteger(result) && result >= 1024 && result <= 65535 && ![5173, 5177].includes(result), "Unsafe verification port");
  return result;
};
const listeners = value => spawnSync("lsof", ["-nP", `-iTCP:${value}`, "-sTCP:LISTEN", "-t"], { encoding: "utf8" }).stdout.trim();
const alive = pid => {
  try { process.kill(pid, 0); return true; } catch { return false; }
};
const owned = (instance, server) => {
  assert.equal(instance.root, root, "Wrong checkout");
  const processCommand = execFileSync("ps", ["-p", String(server.pid), "-o", "command="], { encoding: "utf8" });
  assert(processCommand.includes(instance.config), "PID no longer belongs to this run");
  const cwd = execFileSync("lsof", ["-a", "-p", String(server.pid), "-d", "cwd", "-Fn"], { encoding: "utf8" });
  assert(cwd.split("\n").includes(`n${root}`), "Process is in another checkout");
};
const readInstance = () => JSON.parse(readFileSync(manifest, "utf8"));
async function doctor(instance) {
  assert.equal(instance.root, root, "Wrong checkout");
  assert.equal(instance.head, git("rev-parse", "HEAD"), "Checkout version changed; clean up and relaunch");
  assert.equal(instance.source, source(), "Product files changed; clean up and relaunch");
  assert.equal(instance.build, hash(tree(join(root, "dist"))), "Preview build changed; clean up and relaunch");
  for (const server of instance.servers) {
    assert(alive(server.pid), `Dead process: ${server.pid}`);
    owned(instance, server);
    assert.equal(listeners(server.port), String(server.pid), "Port is not owned exclusively by this instance");
    const response = await fetch(server.url);
    assert(response.ok && (await response.text()).includes('<div id="root">'), "Not the game HTML");
  }
  console.log(JSON.stringify({ doctor: "PASS", root, head: instance.head, source: instance.source, servers: instance.servers }, null, 2));
}
async function cleanup(instance) {
  for (const server of instance.servers) {
    if (!alive(server.pid)) continue;
    owned(instance, server);
    process.kill(server.pid, "SIGTERM");
    for (let attempt = 0; attempt < 50 && alive(server.pid); attempt++) await new Promise(resolve => setTimeout(resolve, 100));
    assert(!alive(server.pid), `PID ${server.pid} did not stop; inspect before retrying`);
  }
  rmSync(instance.config, { force: true });
  for (const server of instance.servers) assert.notEqual(listeners(server.port), String(server.pid));
  writeFileSync(join(evidence, "cleanup.json"), JSON.stringify({ stopped: instance.servers, evidence: readdirSync(evidence) }, null, 2));
  console.log(`CLEANUP PASS; evidence retained: ${evidence}`);
}
async function launch() {
  assert(!existsSync(manifest), "Run already exists; clean it up and choose a new run name");
  const dev = port(process.env.JUNYAN_DEV_PORT, 5200);
  const preview = port(process.env.JUNYAN_PREVIEW_PORT, 5201);
  assert.notEqual(dev, preview);
  assert.equal(listeners(dev), "", `Port ${dev} occupied; do not reuse or kill it`);
  assert.equal(listeners(preview), "", `Port ${preview} occupied; do not reuse or kill it`);
  execFileSync("pnpm", ["build"], { cwd: root, stdio: "inherit" });
  mkdirSync(evidence, { recursive: true });
  const config = join(evidence, "instance.config.ts");
  writeFileSync(config, `export { default } from ${JSON.stringify(join(root, "vite.config.ts"))};\n`);
  const instance = { root, head: git("rev-parse", "HEAD"), source: source(), build: hash(tree(join(root, "dist"))), config, servers: [] };
  const save = () => writeFileSync(manifest, JSON.stringify(instance, null, 2));
  save();
  try {
    for (const [kind, value] of [["dev", dev], ["preview", preview]]) {
      const log = openSync(join(evidence, `${kind}.log`), "a");
      const child = spawn(process.execPath, [join(root, "node_modules/vite/bin/vite.js"), ...(kind === "preview" ? ["preview", "--base", "/junyan/"] : []), "--config", config, "--host", "127.0.0.1", "--port", String(value), "--strictPort"], { cwd: root, detached: true, stdio: ["ignore", log, log] });
      assert(child.pid, "Failed to start Vite");
      child.unref();
      const server = { kind, pid: child.pid, port: value, url: `http://127.0.0.1:${value}/${kind === "preview" ? "junyan/" : ""}` };
      instance.servers.push(server);
      save();
      for (let attempt = 0; attempt < 100; attempt++) {
        assert(alive(child.pid), `Vite exited; inspect ${kind}.log`);
        if (listeners(value) === String(child.pid)) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    await doctor(instance);
  } catch (error) {
    await cleanup(instance);
    throw error;
  }
}

if (command === "launch") await launch();
else if (command === "doctor") await doctor(readInstance());
else if (command === "cleanup") await cleanup(readInstance());
else if (command === "drive") {
  const instance = readInstance();
  await doctor(instance);
  const result = spawnSync("pnpm", ["exec", "playwright", "test", "--config", ".cursor/skills/verify-junyan/proof.config.ts"], {
    cwd: root, stdio: "inherit", env: { ...process.env, JUNYAN_PROOF_DIR: evidence, JUNYAN_PROOF_URL: instance.servers[0].url },
  });
  process.exitCode = result.status ?? 1;
} else throw new Error("Usage: .cursor/skills/verify-junyan/verify.mjs launch|doctor|drive|cleanup RUN");
