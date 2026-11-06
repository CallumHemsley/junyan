import { describe, expect, it } from 'vitest';
import { renderObjects } from './index';
import { courtyardMap } from '../../maps/courtyard';
import { worldMapSchema } from '../../schema';
import type { WorldRenderView } from '../../render-contract';

const view: WorldRenderView = { project: p => p, elapsedMs: 0, reducedMotion: true, playerPosition: { x: 16, y: 21 }, width: 720, height: 408, pass: 'objects' };
describe('courtyard compositor contract', () => {
  it('replaces every generic prop once and splits long house facades for actor depth', () => {
    const map = worldMapSchema.parse(courtyardMap), objects = renderObjects(map, view);
    expect(new Set(objects.map(o => o.id)).size).toBe(objects.length);
    for (const prop of map.props.filter(p => p.layer !== 'ground')) expect(objects.filter(o => o.id === prop.id)).toHaveLength(1);
    for (const house of map.props.filter(p => p.kind === 'row-house')) {
      expect(objects.some(o => o.id === `${house.id}.roof`)).toBe(true);
      expect(objects.filter(o => o.id.startsWith(`${house.id}.east.`)).length).toBeGreaterThan(0);
    }
    expect(renderObjects({ ...map, id: 'town' }, view)).toEqual([]);
  });
});
