/**
 * Write a scene's compiled colliders as JSON for game maps that share its space.
 *
 *   node src/pixel/tools/colliders.ts <sceneId> [--out file.json]
 *
 * Each entry is `{ id, rect: { x, y, width, height } }` in tile units: the prop's id when it has
 * one, else its sprite id with a running number. The restaurant map reads
 * `src/world/pixel/cafe-colliders.json`; rerun this after recomposing the cafe
 * (`node src/pixel/tools/colliders.ts cafe --out src/world/pixel/cafe-colliders.json`).
 */
import { writeFileSync } from "node:fs";
import { compileScene, createAtlas, propCollider } from "../engine/index.ts";
import { scenes } from "../scenes/index.ts";
import { townPlaceholderOptions } from "../town/placeholders.ts";
import { loadSprites } from "./load.ts";

const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const out = outAt >= 0 ? args.splice(outAt, 2)[1] : "";
const scene = scenes[args[0]];
if (!scene) { console.error(`Usage: colliders.ts <sceneId> [--out file.json]. Scenes: ${Object.keys(scenes).join(", ")}`); process.exit(1); }

// Placeholders never collide (they have no foot), so art still being drawn does not change the output.
const compiled = compileScene(scene, createAtlas(await loadSprites(), townPlaceholderOptions((m) => console.warn(m))));
const counts = new Map<string, number>();
const round = (v: number) => Math.round(v * 1e5) / 1e5;
const entries = compiled.objects.flatMap((placed) => {
  const rect = propCollider(placed);
  if (!rect) return [];
  let id = placed.prop?.id;
  if (!id) { const n = (counts.get(placed.sprite.id) ?? 0) + 1; counts.set(placed.sprite.id, n); id = `${placed.sprite.id}#${n}`; }
  return [{ id, rect: { x: round(rect[0]), y: round(rect[1]), width: round(rect[2]), height: round(rect[3]) } }];
});
entries.push(...(scene.blocked ?? []).map((r, i) => ({ id: `blocked#${i + 1}`, rect: { x: r[0], y: r[1], width: r[2], height: r[3] } })));
const json = `[\n${entries.map((e) => `  ${JSON.stringify(e)}`).join(",\n")}\n]\n`;
if (out) { writeFileSync(out, json); console.log(`${out}: ${entries.length} colliders`); } else process.stdout.write(json);
