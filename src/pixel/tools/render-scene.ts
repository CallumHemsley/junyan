/**
 * Render a registered scene to PNG through the same compositor the game uses.
 *
 *   node src/pixel/tools/render-scene.ts <sceneId> [--scale 3] [--time ms] [--phase morning]
 *     [--view WxH] [--focus tx,ty] [--debug] [--reduced-motion] [--strict] [--out file.png]
 *
 * Without `--view` the whole scene is rendered. `--view` is in art pixels and follows `--focus`
 * (tile units, default the first actor, else the scene centre) with the game camera's clamping.
 * The scene's own `actors` are drawn. Default output: output/pixel/scene-<id>.png
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { TILE } from "../kit/index.ts";
import { DAY_PHASES, createAtlas, createSceneRenderer, followPoint, renderToFrame, type DayPhase } from "../engine/index.ts";
import { scenes } from "../scenes/index.ts";
import { townPlaceholderOptions } from "../town/placeholders.ts";
import { loadSprites } from "./load.ts";
import { encodePng, upscale } from "./png.ts";

const args = process.argv.slice(2);
const flag = (name: string, fallback: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const toggle = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? (args.splice(i, 1), true) : false; };

const scale = Number(flag("scale", "3"));
const time = Number(flag("time", "0"));
const phase = flag("phase", "morning") as DayPhase;
const viewArg = flag("view", "");
const focusArg = flag("focus", "");
const outArg = flag("out", "");
const debug = toggle("debug");
const reducedMotion = toggle("reduced-motion");
const strict = toggle("strict");
const sceneId = args[0];

if (!sceneId || !scenes[sceneId]) {
  console.error(`Usage: render-scene.ts <sceneId> [options]. Scenes: ${Object.keys(scenes).join(", ")}`);
  process.exit(1);
}
if (!DAY_PHASES.includes(phase)) { console.error(`--phase must be one of ${DAY_PHASES.join(", ")}`); process.exit(1); }

const scene = scenes[sceneId];
// Art still being drawn renders as placeholder boxes, listed once on stderr (`--strict` throws instead).
const atlas = createAtlas(await loadSprites(), strict ? {} : townPlaceholderOptions((m) => console.warn(m)));
const renderer = createSceneRenderer(scene, atlas, { warn: (m) => console.warn(m) });
const sceneW = scene.size[0] * TILE, sceneH = scene.size[1] * TILE;
const [w, h] = viewArg ? viewArg.split("x").map(Number) : [sceneW, sceneH];
const focus = focusArg ? focusArg.split(",").map(Number) : scene.actors?.[0]?.at ?? [scene.size[0] / 2, scene.size[1] / 2];
const [x, y] = followPoint(w, h, sceneW, sceneH, [focus[0] * TILE, focus[1] * TILE]);

const started = performance.now();
const frame = renderToFrame(renderer, { x, y, w, h }, { time, phase, actors: scene.actors, debug, reducedMotion });
const took = performance.now() - started;

const out = resolve(outArg || `output/pixel/scene-${sceneId}${phase === "morning" ? "" : `-${phase}`}${debug ? "-debug" : ""}.png`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, encodePng(upscale(frame.data, w, h, scale), w * scale, h * scale));
console.log(`${out}  ${w}x${h} art px at ${scale}x, view at ${x},${y}, ${phase}, t=${time}ms, first frame ${took.toFixed(1)} ms (includes baking)`);
