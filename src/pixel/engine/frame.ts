import type { Image } from "./atlas.ts";
import type { Rgb } from "./types.ts";

/** An opaque RGBA frame at art resolution. Alpha is always 255. */
export type Frame = { w: number; h: number; data: Uint8ClampedArray; words: Uint32Array };

export function createFrame(w: number, h: number): Frame {
  const data = new Uint8ClampedArray(w * h * 4);
  return { w, h, data, words: new Uint32Array(data.buffer) };
}

/** Pack an opaque colour into the frame's native 32-bit word order. */
export function packRgb([r, g, b]: Rgb): number {
  const bytes = new Uint8ClampedArray([r, g, b, 255]);
  return new Uint32Array(bytes.buffer)[0];
}

export function fill(frame: Frame, rgb: Rgb): void {
  frame.words.fill(packRgb(rgb));
}

/**
 * Straight-alpha "source over" of `image` with its top-left at (left, top) in frame pixels,
 * clipped to the frame. Fully opaque pixels are copied, translucent ones blended, transparent
 * skipped. The destination stays opaque. `opacity` (0..1, default 1) fades the whole image.
 */
export function blit(frame: Frame, image: Image, left: number, top: number, opacity = 1): void {
  const x0 = Math.max(0, -left), y0 = Math.max(0, -top);
  const x1 = Math.min(image.w, frame.w - left), y1 = Math.min(image.h, frame.h - top);
  if (x0 >= x1 || y0 >= y1 || opacity <= 0) return;
  const src = image.data, srcWords = image.words, dst = frame.data, dstWords = frame.words;
  const whole = opacity >= 1;
  for (let y = y0; y < y1; y++) {
    let s = y * image.w + x0, d = (top + y) * frame.w + left + x0;
    for (let x = x0; x < x1; x++, s++, d++) {
      let a = src[s * 4 + 3];
      if (a === 0) continue;
      if (a === 255 && whole) { dstWords[d] = srcWords[s]; continue; }
      if (!whole) a = Math.round(a * opacity);
      const si = s * 4, di = d * 4, keep = 255 - a;
      // Uint8ClampedArray rounds to nearest on store.
      dst[di] = (src[si] * a + dst[di] * keep) / 255;
      dst[di + 1] = (src[si + 1] * a + dst[di + 1] * keep) / 255;
      dst[di + 2] = (src[si + 2] * a + dst[di + 2] * keep) / 255;
    }
  }
}

/** Copy a `w`×`h` region of `source` at (sx, sy) to `frame` at (dx, dy). Out-of-range parts are skipped. */
export function copyRegion(frame: Frame, source: Frame, sx: number, sy: number, dx: number, dy: number, w: number, h: number): void {
  if (sx < 0) { dx -= sx; w += sx; sx = 0; }
  if (sy < 0) { dy -= sy; h += sy; sy = 0; }
  if (dx < 0) { sx -= dx; w += dx; dx = 0; }
  if (dy < 0) { sy -= dy; h += dy; dy = 0; }
  w = Math.min(w, source.w - sx, frame.w - dx);
  h = Math.min(h, source.h - sy, frame.h - dy);
  if (w <= 0 || h <= 0) return;
  for (let y = 0; y < h; y++) {
    const from = (sy + y) * source.w + sx;
    frame.words.set(source.words.subarray(from, from + w), (dy + y) * frame.w + dx);
  }
}

/** FNV-1a over the pixels, for stability tests. */
export function hashFrame(frame: Pick<Frame, "data">): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < frame.data.length; i++) h = Math.imul(h ^ frame.data[i], 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0");
}
