/**
 * Contact sheet: render sprites to a labelled PNG so they can be looked at.
 *
 *   node src/pixel/tools/sheet.ts [filter …] [--scale 4] [--bg stone4] [--width 1500] [--out file.png] [--tile]
 *
 * Filters are substrings of sprite ids (any match). `--tile` repeats each sprite 3×3 to check seams.
 * Animation frames are laid side by side. Default output: output/pixel/sheet-<filters>.png
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { PALETTE, bakeSprite, type Color } from "../kit/index.ts";
import { loadSprites } from "./load.ts";
import { encodePng } from "./png.ts";

const GLYPHS: Record<string, string> = {
  a: "010101111101101", b: "110101110101110", c: "011100100100011", d: "110101101101110", e: "111100110100111",
  f: "111100110100100", g: "011100101101011", h: "101101111101101", i: "111010010010111", j: "001001001101010",
  k: "101101110101101", l: "100100100100111", m: "101111111101101", n: "110101101101101", o: "010101101101010",
  p: "110101110100100", q: "010101101110011", r: "110101110101101", s: "011100010001110", t: "111010010010010",
  u: "101101101101111", v: "101101101101010", w: "101101111111101", x: "101101010101101", y: "101101010010010",
  z: "111001010100111", "0": "111101101101111", "1": "010110010010111", "2": "110001010100111", "3": "110001010001110",
  "4": "101101111001001", "5": "111100110001110", "6": "011100111101111", "7": "111001010010010", "8": "111101111101111",
  "9": "111101111001110", "/": "001001010100100", "-": "000000111000000", _: "000000000000111", ".": "000000000000010",
};

const args = process.argv.slice(2);
const flag = (name: string, fallback: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const tile = args.includes("--tile") ? (args.splice(args.indexOf("--tile"), 1), true) : false;
const scale = Number(flag("scale", "4"));
const bgName = flag("bg", "stone4") as Color;
const maxWidth = Number(flag("width", "1500"));
const filters = args;
const out = resolve(flag("out", `output/pixel/sheet-${filters.join("+").replace(/[^a-z0-9+_-]/gi, "_") || "all"}.png`));

const hex = (name: Color) => { const h = PALETTE[name]; return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
const all = await loadSprites();
const ids = Object.keys(all).filter((id) => !filters.length || filters.some((f) => id.includes(f))).sort();
if (!ids.length) { console.error(`No sprites match ${JSON.stringify(filters)}. Known: ${Object.keys(all).sort().join(", ")}`); process.exit(1); }

const LABEL = 2, PAD = 10, GAP = 4;
type Cell = { id: string; x: number; y: number; w: number; h: number; frames: ReturnType<typeof bakeSprite>["frames"]; fw: number; fh: number };
const cells: Cell[] = [];
let cursorX = PAD, cursorY = PAD, rowHeight = 0, sheetWidth = 0;
for (const id of ids) {
  const baked = bakeSprite(id, all[id]);
  const repeat = tile ? 3 : 1;
  const fw = baked.def.w * scale * repeat, fh = baked.def.h * scale * repeat;
  const labelWidth = id.length * 4 * LABEL;
  const w = Math.max(baked.frames.length * fw + (baked.frames.length - 1) * GAP, labelWidth), h = fh + 6 * LABEL + 4;
  if (cursorX + w + PAD > maxWidth && cursorX > PAD) { cursorX = PAD; cursorY += rowHeight + PAD; rowHeight = 0; }
  cells.push({ id, x: cursorX, y: cursorY, w, h, frames: baked.frames, fw, fh });
  cursorX += w + PAD;
  sheetWidth = Math.max(sheetWidth, cursorX);
  rowHeight = Math.max(rowHeight, h);
}
const sheetHeight = cursorY + rowHeight + PAD;
const image = new Uint8ClampedArray(sheetWidth * sheetHeight * 4);
const bg = hex(bgName), ink = hex("ink");
for (let i = 0; i < sheetWidth * sheetHeight; i++) image.set([bg[0], bg[1], bg[2], 255], i * 4);
const plot = (x: number, y: number, rgb: number[], alpha = 255) => {
  if (x < 0 || y < 0 || x >= sheetWidth || y >= sheetHeight) return;
  const at = (y * sheetWidth + x) * 4, a = alpha / 255;
  image[at] = image[at] * (1 - a) + rgb[0] * a;
  image[at + 1] = image[at + 1] * (1 - a) + rgb[1] * a;
  image[at + 2] = image[at + 2] * (1 - a) + rgb[2] * a;
};
for (const cell of cells) {
  cell.frames.forEach((frame, index) => {
    const rgba = frame.toRGBA(), left = cell.x + index * (cell.fw + GAP), repeat = tile ? 3 : 1;
    // Corner ticks show the frame bounds without boxing the art in.
    for (const [cx, cy] of [[left - 1, cell.y - 1], [left + cell.fw, cell.y - 1], [left - 1, cell.y + cell.fh], [left + cell.fw, cell.y + cell.fh]]) plot(cx, cy, ink, 120);
    for (let y = 0; y < cell.fh; y++) for (let x = 0; x < cell.fw; x++) {
      const sx = Math.floor(x / scale) % frame.w, sy = Math.floor(y / scale) % frame.h, from = (sy * frame.w + sx) * 4;
      if (rgba[from + 3]) plot(left + x, cell.y + y, [rgba[from], rgba[from + 1], rgba[from + 2]], rgba[from + 3]);
    }
    void repeat;
  });
  [...cell.id.toLowerCase()].forEach((char, index) => {
    const glyph = GLYPHS[char];
    if (!glyph) return;
    for (let bit = 0; bit < 15; bit++) if (glyph[bit] === "1")
      for (let dy = 0; dy < LABEL; dy++) for (let dx = 0; dx < LABEL; dx++)
        plot(cell.x + index * 4 * LABEL + (bit % 3) * LABEL + dx, cell.y + cell.fh + 4 + Math.floor(bit / 3) * LABEL + dy, ink, 200);
  });
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, encodePng(image, sheetWidth, sheetHeight));
console.log(`${out}  ${sheetWidth}x${sheetHeight}  ${ids.length} sprites at ${scale}x on ${bgName}`);
for (const cell of cells) console.log(`  ${cell.id}  ${all[cell.id].w}x${all[cell.id].h}${cell.frames.length > 1 ? `  ${cell.frames.length} frames` : ""}`);
