import { describe, expect, it } from 'vitest';
import { mapDefinitions } from '../../maps/residential';
import { worldMapSchema } from '../../schema';
import { renderFurnitureObjects, renderObjects } from './index';
import { initialState, reduce } from '../../../features/apartment/rules';
import { furnitureColliders } from '../../../features/apartment/world';
import type { WorldRenderView } from '../../render-contract';
const view: WorldRenderView = { project: p => p, elapsedMs: 0, reducedMotion: true, playerPosition: { x: 15, y: 14 }, width: 390, height: 844, pass: 'objects' };

describe('residential object composition', () => {
  it('overrides every static object fallback and keeps unique depth IDs', () => {
    for (const definition of mapDefinitions) {
      const map = worldMapSchema.parse(definition), objects = renderObjects(map, view), ids = objects.map(o => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const prop of map.props.filter(p => p.layer === 'object')) expect(ids).toContain(prop.id);
    }
  });
  it('renders committed furniture and all gifted items with matching solid IDs', () => {
    let home = reduce(initialState(), { type: 'accept-starter' }, 1);
    for (const giftId of ['repairs.stool', 'garden.planter', 'cats.cushion'] as const) home = reduce(home, { type: 'receive-gift', giftId }, 1);
    for (const [id, x, y] of [['repairs.stool', 2, 0], ['garden.planter', 3, 0], ['cats.cushion', 4, 0]] as const) {
      home = reduce(home, { type: 'select', id }, 1);home = reduce(home, { type: 'place', x, y }, 1);
    }
    expect(renderFurnitureObjects(home).map(o => o.id)).toEqual(furnitureColliders(home).map(c => c.id));
    const draft = reduce(home, { type: 'select', id: 'chair' }, 1);
    expect(renderFurnitureObjects(draft).map(o => o.id)).toEqual(renderFurnitureObjects(home).map(o => o.id));
  });
  it('keeps static solids outside every valid furniture placement cell', () => {
    const apartment = mapDefinitions.find(m => m.id === 'apartment')!;
    for (const { rect } of apartment.colliders) expect(rect.x + rect.width <= 4 || rect.x >= 16 || rect.y + rect.height <= 4 || rect.y >= 14).toBe(true);
  });
});
