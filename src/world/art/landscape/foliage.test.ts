import {createHash} from 'node:crypto';
import {expect, it} from 'vitest';
import {drawFoliage, foliageBounds, type FoliageSpecies} from './foliage';

// Native coverage from the accepted pre-value-pass sprites, independent of their palette.
const coverage: Record<FoliageSpecies, string> = {
  camphor: '34a3f4426c907d54a53b0b3d2949fd6712187ab5c966576e3626e649356e848e',
  willow: '2d3b05430f291b0cd90abe89a198de7da5262d240cb13c8506e481b5968d2e02',
  fruit: 'd139986850a8cd068149467997dcfeb554f11dec7eab376c4b0e3cc44eb274df',
};
it('preserves native canopy coverage, bounds and inherited alpha through a palette change', () => {
  for (const species of ['camphor', 'willow', 'fruit'] as const) for (const seed of [0, 1]) {
    const pixels = new Set<string>(), bounds = foliageBounds({species, seed});
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const ctx = {
      globalAlpha: .45, fillStyle: '', save() {}, restore() {},
      fillRect(x: number, y: number, w: number, h: number) {
        expect(this.fillStyle.startsWith('shaded:')).toBe(true);
        expect(this.globalAlpha).toBe(.45);
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w - 1); maxY = Math.max(maxY, y + h - 1);
        for (let a = x; a < x + w; a++) for (let b = y; b < y + h; b++) pixels.add(`${a},${b}`);
      },
    };
    drawFoliage(ctx as unknown as CanvasRenderingContext2D, {species, seed, elapsedMs: 1500, reducedMotion: true,
      shadeColor: base => { expect(base.startsWith('shaded:')).toBe(false); return `shaded:${base}`; }});
    expect(createHash('sha256').update([...pixels].sort().join('|')).digest('hex')).toBe(coverage[species]);
    expect(minX).toBeGreaterThanOrEqual(bounds.minX); expect(maxX).toBeLessThanOrEqual(bounds.maxX);
    expect(minY).toBeGreaterThanOrEqual(bounds.minY); expect(maxY).toBeLessThanOrEqual(bounds.maxY);
    expect(ctx.globalAlpha).toBe(.45);
  }
});
