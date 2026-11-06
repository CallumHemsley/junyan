import {expect, it} from 'vitest';
import {drawFoliage, foliageBounds} from './foliage';

it('keeps crowns inside their fade bounds, rooted, shaded and still under reduced motion', () => {
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
    expect(pixels.has('0,0')).toBe(true);
    const held = [...pixels]; pixels.clear();
    drawFoliage(ctx as unknown as CanvasRenderingContext2D, {species, seed, elapsedMs: 95000, reducedMotion: true, shadeColor: base => `shaded:${base}`});
    expect([...pixels]).toEqual(held);
    expect(minX).toBeGreaterThanOrEqual(bounds.minX); expect(maxX).toBeLessThanOrEqual(bounds.maxX);
    expect(minY).toBeGreaterThanOrEqual(bounds.minY); expect(maxY).toBeLessThanOrEqual(bounds.maxY);
    expect(ctx.globalAlpha).toBe(.45);
  }
});
