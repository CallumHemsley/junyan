import { PALETTE, type Color } from "../kit/index.ts";
import type { ColorSpec, Rgb } from "./types.ts";

/** `"cream4"` or `"#f0e2c0"` → `[240, 226, 192]`. Throws on anything else. */
export function rgbOf(spec: ColorSpec): Rgb {
  const hex = spec.startsWith("#") ? spec : PALETTE[spec as Color];
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Unknown colour "${spec}"; use a palette name or #rrggbb`);
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
