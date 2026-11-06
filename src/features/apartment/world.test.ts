import { describe, expect, it } from 'vitest';
import { initialState, legal, reduce, validate } from './rules';
import { worldMapSchema } from '../../world/schema';
import { canStand, findPath } from '../../world/geometry';
import apartmentMap from '../../world/maps/residential/apartment.json';
import { furnitureCellAt, furnitureCellCentre, furnitureColliders, furnitureWorldRect } from './world';

describe('walkable furniture adapter', () => {
  it('round trips every saved cell through world picking without accepting outside floor', () => {
    for (let x = 0; x < 6; x++) for (let y = 0; y < 5; y++) expect(furnitureCellAt(furnitureCellCentre({ x, y }))).toEqual({ x, y });
    for (const position of [{ x: 3.99, y: 5 }, { x: 16, y: 5 }, { x: 5, y: 14 }, { x: 5, y: 3.99 }]) expect(furnitureCellAt(position)).toBeNull();
  });
  it('derives rotated solids from committed placements and leaves the draft non-solid', () => {
    const starter = reduce(initialState(), { type: 'accept-starter' }, 1);
    const selected = reduce(starter, { type: 'select', id: 'table' }, 1);
    const rotated = reduce(selected, { type: 'rotate' }, 1);
    expect(furnitureColliders(rotated)).toEqual(furnitureColliders(starter));
    const placed = reduce(rotated, { type: 'place', x: 3, y: 1 }, 1);
    expect(furnitureColliders(placed).find(c => c.id.endsWith('.table'))?.rect).toEqual({ x: 10, y: 6, width: 2, height: 4 });
    expect(furnitureColliders(reduce(placed, { type: 'undo' }, 1))).toEqual(furnitureColliders(starter));
    expect(validate(JSON.parse(JSON.stringify(placed)))).toEqual(placed);
  });
  it('keeps rugs passable', () => {
    expect(furnitureWorldRect({ id: 'rug', x: 2, y: 1, rotation: 1 }, 'large')).toEqual({ x: 8, y: 6, width: 4, height: 4 });
    const state = { ...initialState(), placements: [...initialState().placements, { id: 'rug' as const, x: 2, y: 1, rotation: 0 as const }] };
    expect(furnitureColliders(state)).toHaveLength(1);

  });
  it('keeps the protected route walkable for every legal single-object placement and rotation', () => {
    let home = reduce(initialState(), { type: 'accept-starter' }, 1);
    for (const giftId of ['repairs.stool', 'garden.planter', 'cats.cushion'] as const) home = reduce(home, { type: 'receive-gift', giftId }, 1);
    for (let day = 1; day <= 3; day++) home = reduce(home, { type: 'claim-gift' }, day);
    for (const id of home.owned.filter(id => id !== 'bed')) for (const rotation of [0, 1] as const) for (let x = 0; x < 6; x++) for (let y = 0; y < 5; y++) {
      const placement = { id, x, y, rotation };
      if (!legal(home, placement)) continue;
      const placed = { ...home, placements: [...home.placements, placement] };
      expect(validate(placed), `${id} at ${x},${y}`).not.toBeNull();
      const map = worldMapSchema.parse({ ...apartmentMap, colliders: [...apartmentMap.colliders, ...furnitureColliders(placed)] });
      for (let y = 4.5; y < 14; y++) expect(canStand(map, { x: 15, y })).toBe(true);
      for (let x = 4.5; x < 16; x++) expect(canStand(map, { x, y: 13 })).toBe(true);
      expect(findPath(map, { x: 15, y: 13 }, map.defaultSpawn).length).toBeGreaterThan(0);
    }
  });

});
