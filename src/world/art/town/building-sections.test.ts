import { describe, expect, it } from 'vitest';
import { worldMapSchema } from '../../schema';
import { project } from '../../camera';
import { renderObjects } from './index';
import definition from '../../maps/town/map.json';
import type { WorldRenderView } from '../../render-contract';

const map = worldMapSchema.parse(definition);
const camera = { focus: { x: 7, y: 29.4 }, width: 640, height: 400, scale: 15 };
const view: WorldRenderView = { project: (p, z) => project(p, camera, z), elapsedMs: 0, reducedMotion: true, playerPosition: camera.focus, width: 640, height: 400, pass: 'objects' };
const shop = () => renderObjects(map, view).filter(object => object.id === 'town.west-store' || object.id.startsWith('town.west-store.section-'));

describe('wide shop actor ordering', () => {
  it('puts both front ends ahead of the facade sections that share their screen column', () => {
    const sections = shop();
    expect(sections.length).toBeGreaterThan(1);
    expect(sections.filter(s => s.id === 'town.west-store')).toHaveLength(1);
    for (const actor of [{ x: 7, y: 29.4 }, { x: 14, y: 29.4 }, { x: 16, y: 29.4 }]) {
      const x = view.project(actor).x;
      const overlapping = sections.filter(s => Math.abs(view.project(s.position).x - x) < 5);
      expect(overlapping.length).toBeGreaterThan(0);
      for (const section of overlapping) expect(section.depth ?? section.position.x + section.position.y).toBeLessThan(actor.x + actor.y);
    }
  });
  it('keeps sorting fixed for the player and every resident', () => {
    const before = shop().map(({ id, position, depth }) => ({ id, position, depth }));
    const after = renderObjects(map, { ...view, playerPosition: { x: 13, y: 23.5 } }).filter(s => s.id === 'town.west-store' || s.id.startsWith('town.west-store.section-')).map(({ id, position, depth }) => ({ id, position, depth }));
    expect(after).toEqual(before);
  });
});
