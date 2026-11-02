#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { basename, join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const helper = ".cursor/skills/verify-junyan/verify.mjs";
const invoke = (command, run, env = {}) => spawnSync(process.execPath, [helper, command, run], {
  encoding: "utf8", env: { ...process.env, ...env },
});
const rejects = (result, message) => {
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, message);
};

test("launch rejects legacy, malformed and identical ports before building", () => {
  for (const value of ["5173", "5177", "NaN", "80", "65536", "5200.5"]) {
    rejects(invoke("launch", "invalid-port", { JUNYAN_DEV_PORT: value }), /Unsafe verification port/);
  }
  rejects(invoke("launch", "invalid-port", { JUNYAN_DEV_PORT: "5200", JUNYAN_PREVIEW_PORT: "5200" }), /not.*equal/i);
});

test("launch refuses an occupied port without stopping its owner", async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const port = server.address().port;
    rejects(invoke("launch", "occupied-port", { JUNYAN_DEV_PORT: String(port), JUNYAN_PREVIEW_PORT: "5201" }), /occupied/);
    assert(server.listening);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test("doctor rejects wrong checkout/version/source, cleanup refuses foreign PID", () => {
  mkdirSync("output/verification", { recursive: true });
  const directory = mkdtempSync("output/verification/doctor-negative-");
  const run = basename(directory);
  const instance = { root, head: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), source: "stale", config: join(root, directory, "foreign.config.ts"), servers: [{ pid: process.pid, port: 5200 }] };
  const save = value => writeFileSync(join(directory, "instance.json"), JSON.stringify(value));
  try {
    save({ ...instance, root: "/not-this-checkout" });
    rejects(invoke("doctor", run), /Wrong checkout/);
    save({ ...instance, head: "old-version" });
    rejects(invoke("doctor", run), /Checkout version changed/);
    save(instance);
    rejects(invoke("doctor", run), /Product files changed/);
    rejects(invoke("cleanup", run), /PID no longer belongs to this run/);
    assert.doesNotThrow(() => process.kill(process.pid, 0));
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
