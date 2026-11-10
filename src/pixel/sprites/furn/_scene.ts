/**
 * `compose.ts` with one addition, so table-top pieces can be judged on their tables: a placement
 * may end in `^N`, which draws the sprite at its anchor but depth-sorts it N px further south.
 * Put a condiment on a table at (x, y) with `^` the distance from y to the table's anchor plus 1,
 * and it is drawn after the table. Everything else matches `compose.ts`.
 *
 *   node src/pixel/sprites/furn/_scene.ts --size 352x240 --floor ex/floor-wood-a --wall ex/wall \
 *     "furn/table-1@112,176" "furn/chili-jar@100,150^27" --scale 3 --out output/pixel/scene.png
 *
 * Promotion candidate: the engine needs the same thing (an object resting on another sorts with it).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { TILE, bakeSprite, hash, type BakedSprite } from "../../kit/index.ts";
import { loadSprites } from "../../tools/load.ts";
import { encodePng, upscale } from "../../tools/png.ts";

const args = process.argv.slice(2);
const flag = (name: string, fallback: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const [width, height] = flag("size", "352x240").split("x").map(Number);
const scale = Number(flag("scale", "3"));
const floorIds = flag("floor", "").split(",").filter(Boolean);
const wallId = flag("wall", "");
const out = resolve(flag("out", "output/pixel/scene.png"));

const all = await loadSprites();
const cache = new Map<string, BakedSprite>();
const baked = (id: string) => {
  if (!all[id]) throw new Error(`No sprite "${id}"`);
  if (!cache.has(id)) cache.set(id, bakeSprite(id, all[id]));
  return cache.get(id)!;
};
const image = new Uint8ClampedArray(width * height * 4);
for (let i = 0; i < width * height; i++) image.set([43, 29, 46, 255], i * 4);
const plot = (x: number, y: number, r: number, g: number, b: number, alpha: number) => {
  if (x < 0 || y < 0 || x >= width || y >= height || !alpha) return;
  const at = (y * width + x) * 4, a = alpha / 255;
  image[at] = image[at] * (1 - a) + r * a;
  image[at + 1] = image[at + 1] * (1 - a) + g * a;
  image[at + 2] = image[at + 2] * (1 - a) + b * a;
};
const stamp = (sprite: BakedSprite, left: number, top: number, frame = 0) => {
  const px = sprite.frames[frame % sprite.frames.length], rgba = px.toRGBA();
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
    const from = (y * px.w + x) * 4;
    plot(left + x, top + y, rgba[from], rgba[from + 1], rgba[from + 2], rgba[from + 3]);
  }
};
let wallHeight = 0;
if (wallId) {
  const wall = baked(wallId);
  wallHeight = wall.def.h;
  for (let x = 0; x < width; x += wall.def.w) stamp(wall, x, 0);
}
if (floorIds.length) for (let y = wallHeight; y < height; y += TILE) for (let x = 0; x < width; x += TILE)
  stamp(baked(floorIds[Math.floor(hash(x / TILE, y / TILE, 9) * floorIds.length)]), x, y);

const placements = args.map((arg) => {
  const m = /^(.+)@(-?\d+),(-?\d+)(?:#(\d+))?(?:\^(\d+))?$/.exec(arg);
  if (!m) throw new Error(`Bad placement "${arg}"; expected id@x,y[#frame][^lift]`);
  return { sprite: baked(m[1]), x: Number(m[2]), y: Number(m[3]), frame: Number(m[4] ?? 0), key: Number(m[3]) + Number(m[5] ?? 0) };
});
const order = { floor: 0, object: 1, over: 2 };
placements.sort((a, b) => order[a.sprite.def.layer ?? "object"] - order[b.sprite.def.layer ?? "object"] || a.key - b.key);
for (const { sprite, x, y, key } of placements) {
  const shadow = sprite.def.shadow;
  if (!shadow || key !== y) continue;
  const cx = x + (shadow.dx ?? 0), cy = y + (shadow.dy ?? 0);
  for (let py = Math.floor(cy - shadow.ry); py <= Math.ceil(cy + shadow.ry); py++) for (let px = Math.floor(cx - shadow.rx); px <= Math.ceil(cx + shadow.rx); px++) {
    const u = (px + 0.5 - cx) / shadow.rx, v = (py + 0.5 - cy) / shadow.ry;
    if (u * u + v * v <= 1) plot(px, py, 43, 29, 46, 70);
  }
}
// Shadows of lifted pieces fall on their table, so draw each just before its sprite.
for (const { sprite, x, y, frame, key } of placements) {
  const shadow = sprite.def.shadow;
  if (shadow && key !== y) {
    const cx = x + (shadow.dx ?? 0), cy = y + (shadow.dy ?? 0);
    for (let py = Math.floor(cy - shadow.ry); py <= Math.ceil(cy + shadow.ry); py++) for (let px = Math.floor(cx - shadow.rx); px <= Math.ceil(cx + shadow.rx); px++) {
      const u = (px + 0.5 - cx) / shadow.rx, v = (py + 0.5 - cy) / shadow.ry;
      if (u * u + v * v <= 1) plot(px, py, 43, 29, 46, 60);
    }
  }
  stamp(sprite, x - sprite.anchor[0], y - sprite.anchor[1], frame);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, encodePng(upscale(image, width, height, scale), width * scale, height * scale));
console.log(`${out}  ${width}x${height} art pixels at ${scale}x`);
