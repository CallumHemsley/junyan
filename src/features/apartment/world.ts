import { footprint, type Placement, type State } from './rules';

export const furnitureRegion = { x: 4, y: 4, columns: 6, rows: 5, cellSize: 2 } as const;
export type WorldPoint = { x: number; y: number };
export type FurnitureRect = WorldPoint & { width: number; height: number };

export function furnitureWorldRect(placement: Placement, rugSize: State['rugSize']): FurnitureRect {
  const [width, height] = footprint(placement.id, placement.rotation, rugSize);
  return {
    x: furnitureRegion.x + placement.x * furnitureRegion.cellSize,
    y: furnitureRegion.y + placement.y * furnitureRegion.cellSize,
    width: width * furnitureRegion.cellSize,
    height: height * furnitureRegion.cellSize,
  };
}

export function furnitureColliders(state: State) {
  return state.placements.filter(p => p.id !== 'rug').map(p => ({
    id: `apartment.furniture.${p.id}`,
    rect: furnitureWorldRect(p, state.rugSize),
  }));
}

export function furnitureCellAt(position: WorldPoint): WorldPoint | null {
  const x = Math.floor((position.x - furnitureRegion.x) / furnitureRegion.cellSize);
  const y = Math.floor((position.y - furnitureRegion.y) / furnitureRegion.cellSize);
  return x >= 0 && x < furnitureRegion.columns && y >= 0 && y < furnitureRegion.rows ? { x, y } : null;
}

export function furnitureCellCentre(cell: WorldPoint): WorldPoint {
  return {
    x: furnitureRegion.x + (cell.x + .5) * furnitureRegion.cellSize,
    y: furnitureRegion.y + (cell.y + .5) * furnitureRegion.cellSize,
  };
}
