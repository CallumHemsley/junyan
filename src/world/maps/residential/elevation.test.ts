import { describe, expect, it } from 'vitest';
import { surfaceHeight } from './elevation';

describe('residential stair surface', () => {
  it('joins two flights and three landings without a height jump', () => {
    for (const [y, height] of [[40, 0], [33, 0], [24, 2.4], [21, 2.4], [19, 2.4], [9, 4.8], [3, 4.8]]) expect(surfaceHeight('residential-stairs', { x: 6, y })).toBeCloseTo(height);
    for (const y of [33, 24, 19, 9]) expect(Math.abs(surfaceHeight('residential-stairs', { x: 6, y: y - .0001 }) - surfaceHeight('residential-stairs', { x: 6, y: y + .0001 }))).toBeLessThan(.001);
  });
  it('rises monotonically towards the roof and leaves the other maps at their own ground level', () => {
    let previous = 0;
    for (let y = 40; y >= 3; y -= .1) {
      const height = surfaceHeight('residential-stairs', { x: 6, y });
      expect(height).toBeGreaterThanOrEqual(previous);expect(height).toBeLessThanOrEqual(4.8);previous = height;
    }
    for (const map of ['apartment', 'residential-hall', 'rooftop', 'town']) expect(surfaceHeight(map, { x: 6, y: 4 })).toBe(0);
  });
});
