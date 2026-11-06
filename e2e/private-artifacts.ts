import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

export function privateArtifact(name: string) {
  const path = join(process.env.JUNYAN_PRIVATE_QA ?? "/private/tmp/junyan-world-private-qa/e2e", name);
  mkdirSync(dirname(path), { recursive: true });
  return path;
}
