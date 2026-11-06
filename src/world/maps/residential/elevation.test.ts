import { describe, expect, it } from 'vitest';
import { stairSurfaces, surfaceHeight, surfaceLevels, supportHeight } from './elevation';

describe('residential stair surface', () => {
  it('samples the same constant height across every authored tread and landing', () => {
    for (const surface of stairSurfaces) {
      for (const [u, v] of [[.1, .1], [.5, .5], [.9, .9]]) expect(surfaceHeight('residential-stairs', { x: surface.rect.x + surface.rect.width * u, y: surface.rect.y + surface.rect.height * v })).toBe(surface.height);
    }
    expect(surfaceLevels('residential-stairs')).toEqual([...new Set(stairSurfaces.map(s => s.height))].sort((a, b) => a - b));
  });
  it('keeps door landings level and each rise small while leaving other maps flat', () => {
    for (const [x, y, height] of [[11.5, 37, 0], [17, 21.5, 2.4], [6, 5.5, 4.8]]) expect(surfaceHeight('residential-stairs', { x, y })).toBe(height);
    const levels = surfaceLevels('residential-stairs');
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(.134);
    for (const map of ['apartment', 'residential-hall', 'rooftop', 'town']) { expect(surfaceHeight(map, { x: 6, y: 4 })).toBe(0);expect(surfaceLevels(map)).toEqual([0]); }
    expect(supportHeight('residential-stairs', { x: 2.8, y: 21 })).toBe(2.4);
  });
});
