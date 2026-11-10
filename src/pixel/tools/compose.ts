/**
 * Quick composition: place sprites on a floor to judge them in context and at true scale.
 *
 *   node src/pixel/tools/compose.ts --size 320x224 --floor ex/floor-wood-a,ex/floor-wood-b \
 *     --wall ex/wall "ex/table@96,168" "ex/stool@48,176" "ex/waiter@160,192" --scale 3 --out output/pixel/try.png
 *
 * A placement is `id@x,y` (the sprite's anchor lands on x,y) with an optional `#frame`.
 * `--wall id` repeats a sprite along the top edge. Sprites are depth-sorted by anchor y and get
 * their contact shadows, as the game renderer will.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { TILE, bakeSprite, hash, type BakedSprite } from "../kit/index.ts";
import { loadSprites } from "./load.ts";
import { encodePng, upscale } from "./png.ts";

const args = process.argv.slice(2);
const flag = (name: string, fallback: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const [width, height] = flag("size", "320x224").split("x").map(Number);
const scale = Number(flag("scale", "3"));
const floorIds = flag("floor", "").split(",").filter(Boolean);
const wallId = flag("wall", "");
const out = resolve(flag("out", "output/pixel/compose.png"));

const all = await loadSprites();
const cache = new Map<string, BakedSprite>();
const baked = (id: string) => {
  if (!all[id]) throw new Error(`No sprite "${id}". Known: ${Object.keys(all).sort().join(", ")}`);
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
  const match = /^(.+)@(-?\d+),(-?\d+)(?:#(\d+))?$/.exec(arg);
  if (!match) throw new Error(`Bad placement "${arg}"; expected id@x,y or id@x,y#frame`);
  return { sprite: baked(match[1]), x: Number(match[2]), y: Number(match[3]), frame: Number(match[4] ?? 0) };
});
const order = { floor: 0, object: 1, over: 2 };
placements.sort((a, b) => order[a.sprite.def.layer ?? "object"] - order[b.sprite.def.layer ?? "object"] || a.y - b.y);
for (const { sprite, x, y } of placements) {
  const shadow = sprite.def.shadow;
  if (!shadow) continue;
  const cx = x + (shadow.dx ?? 0), cy = y + (shadow.dy ?? 0);
  for (let py = Math.floor(cy - shadow.ry); py <= Math.ceil(cy + shadow.ry); py++) for (let px = Math.floor(cx - shadow.rx); px <= Math.ceil(cx + shadow.rx); px++) {
    const u = (px + 0.5 - cx) / shadow.rx, v = (py + 0.5 - cy) / shadow.ry;
    if (u * u + v * v <= 1) plot(px, py, 43, 29, 46, 70);
  }
}
for (const { sprite, x, y, frame } of placements) stamp(sprite, x - sprite.anchor[0], y - sprite.anchor[1], frame);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, encodePng(upscale(image, width, height, scale), width * scale, height * scale));
console.log(`${out}  ${width}x${height} art pixels at ${scale}x`);
