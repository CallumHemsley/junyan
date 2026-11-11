import { footprint, legal, type Placement, type State } from './rules';

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

/** The orientation key in a furnishing prop's id: `r0`/`r1`, and for the rug its size too. */
const orientationKey = (p: Placement, rugSize: State['rugSize']) => (p.id === 'rug' ? `${rugSize}-r${p.rotation}` : `r${p.rotation}`);

/**
 * Owned, placed furnishings as map props for the pixel view: one per placement on its cells, id
 * `apartment.furniture.<item>.<orientation>` (the rug's orientation also names its size), kind
 * `furniture-<item>`, the colour scheme as `variant` (0 blue, 1 cream). The rug lies on the floor.
 *
 * While a furnishing is being placed or moved (`selected` with a `draft`), two more: the item itself at
 * the draft cells, id `….preview` (the view draws it translucent), and a floor outline of its cells,
 * `apartment.furniture-outline.<w>x<h>.<valid|blocked>`, whether the draft could be put down there.
 */
export function furnitureProps(state: Pick<State, 'placements' | 'colour' | 'rugSize'> & Partial<Pick<State, 'selected' | 'draft'>>) {
  const variant = state.colour === 'cream' ? 1 : 0;
  const prop = (p: Placement, id: string, kind: string, layer: 'ground' | 'object') => {
    const rect = furnitureWorldRect(p, state.rugSize);
    return { id, kind, position: { x: rect.x, y: rect.y }, width: rect.width, height: rect.height, layer, variant };
  };
  const props = state.placements.map(p => prop(p, `apartment.furniture.${p.id}.${orientationKey(p, state.rugSize)}`, `furniture-${p.id}`, p.id === 'rug' ? 'ground' : 'object'));
  if (state.selected && state.draft) {
    const draft: Placement = { id: state.selected, ...state.draft };
    const [w, h] = footprint(draft.id, draft.rotation, state.rugSize);
    props.push(prop(draft, `apartment.furniture.${draft.id}.${orientationKey(draft, state.rugSize)}.preview`, 'furniture-preview', draft.id === 'rug' ? 'ground' : 'object'));
    props.push(prop(draft, `apartment.furniture-outline.${w}x${h}.${legal(state, draft) ? 'valid' : 'blocked'}`, 'furniture-outline', 'ground'));
  }
  return props;
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
