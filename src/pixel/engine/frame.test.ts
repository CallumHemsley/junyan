import { describe, expect, it } from "vitest";
import { createAtlas } from "./atlas.ts";
import { blit, copyRegion, createFrame, fill, hashFrame } from "./frame.ts";
import { testSprites } from "./test-sprites.ts";

const atlas = createAtlas(testSprites);
const rgbAt = (frame: { w: number; data: Uint8ClampedArray }, x: number, y: number) => Array.from(frame.data.subarray((y * frame.w + x) * 4, (y * frame.w + x) * 4 + 4));

describe("blending", () => {
  it("composites straight alpha over an opaque frame and keeps it opaque", () => {
    const frame = createFrame(4, 2);
    fill(frame, [0, 0, 0]);
    blit(frame, atlas.get("t/glass").frame(0), 1, 0);
    // white #fffaf0 at alpha 128/255 over black.
    const a = 128 / 255;
    expect(rgbAt(frame, 1, 0)).toEqual([Math.round(255 * a), Math.round(250 * a), Math.round(240 * a), 255]);
    expect(rgbAt(frame, 0, 0)).toEqual([0, 0, 0, 255]);
  });

  it("copies opaque pixels exactly and skips transparent ones", () => {
    const frame = createFrame(4, 2);
    fill(frame, [10, 20, 30]);
    blit(frame, atlas.get("t/half").frame(0), 0, 0);
    expect(rgbAt(frame, 0, 0)).toEqual([0x2b, 0x1d, 0x2e, 255]);
    expect(rgbAt(frame, 2, 0)).toEqual([10, 20, 30, 255]);
  });

  it("mirrors flipped frames", () => {
    const flipped = atlas.get("t/half").frame(0, true);
    expect(flipped.data[3]).toBe(0);
    expect(flipped.data[(3) * 4 + 3]).toBe(255);
  });

  it("clips at every edge without throwing", () => {
    const frame = createFrame(4, 4);
    fill(frame, [0, 0, 0]);
    for (const [x, y] of [[-6, 0], [3, 3], [-9, -9], [10, 10]] as const) blit(frame, atlas.get("t/red").frame(0), x, y);
    expect(rgbAt(frame, 3, 3)).toEqual([0xb9, 0x3a, 0x3a, 255]);
    expect(rgbAt(frame, 2, 2)).toEqual([0, 0, 0, 255]);
  });

  it("copies regions with clipping", () => {
    const source = createFrame(4, 4), frame = createFrame(3, 3);
    fill(source, [1, 2, 3]);
    fill(frame, [9, 9, 9]);
    copyRegion(frame, source, 2, 2, 0, 0, 3, 3);
    expect(rgbAt(frame, 1, 1)).toEqual([1, 2, 3, 255]);
    expect(rgbAt(frame, 2, 2)).toEqual([9, 9, 9, 255]);
    expect(hashFrame(frame)).toMatch(/^[0-9a-f]{8}$/);
  });
});
