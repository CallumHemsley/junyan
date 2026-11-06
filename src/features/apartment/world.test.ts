import { describe, expect, it } from 'vitest';
import { initialState, reduce, validate } from './rules';
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
  it('keeps rugs passable and preserves the saved protected route for every solid placement', () => {
    expect(furnitureWorldRect({ id: 'rug', x: 2, y: 1, rotation: 1 }, 'large')).toEqual({ x: 8, y: 6, width: 4, height: 4 });
    const state = { ...initialState(), placements: [...initialState().placements, { id: 'rug' as const, x: 2, y: 1, rotation: 0 as const }] };
    expect(furnitureColliders(state)).toHaveLength(1);
    for (const c of furnitureColliders(state)) {
      expect(c.rect.x + c.rect.width).toBeLessThanOrEqual(14);
      expect(c.rect.y + c.rect.height).toBeLessThanOrEqual(12);
    }
  });
});
