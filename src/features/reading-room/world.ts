import type { Point, Rect, WorldMapDefinition } from '../../world/schema';
import { briefFor, briefIds, type BriefId } from './content';
import { footprint, legal, type Cell, type Placement, type State } from './rules';

export const regions = {
  window: { x: 4, y: 4, columns: 6, rows: 5, cellSize: 1.5 },
  alcove: { x: 13.5, y: 4, columns: 6, rows: 5, cellSize: 1.5 },
} as const;
export function worldToGrid(point: Point, brief: BriefId): Cell | null {
  const region = regions[brief], x = Math.floor((point.x - region.x) / region.cellSize), y = Math.floor((point.y - region.y) / region.cellSize);
  return x >= 0 && x < region.columns && y >= 0 && y < region.rows ? { x, y } : null;
}
export function gridToWorld(cell: Cell, brief: BriefId): Point {
  const region = regions[brief];
  return { x: region.x + (cell.x + .5) * region.cellSize, y: region.y + (cell.y + .5) * region.cellSize };
}
export function placementRect(placement: Placement, brief: BriefId): Rect {
  const region = regions[brief], [width, height] = footprint(placement);
  return { x: region.x + placement.x * region.cellSize, y: region.y + placement.y * region.cellSize, width: width * region.cellSize, height: height * region.cellSize };
}
type Projection = Pick<WorldMapDefinition, 'props' | 'colliders' | 'occluders' | 'anchors'>;
export function projectReadingRoom(state: State): Projection {
  const result: Projection = { props: [], colliders: [], occluders: [], anchors: [] };
  for (const brief of briefIds) {
    const region = regions[brief];
    for (const [index, fixture] of briefFor(brief).fixtures.entries()) {
      const rect = { x: region.x + fixture.x * region.cellSize, y: region.y + fixture.y * region.cellSize, width: region.cellSize, height: region.cellSize };
      const id = `reading-room.${brief}.shelf-${index}`;
      result.colliders.push({ id, rect });
      result.props.push({ id, kind: 'reading-shelf', position: { x: rect.x, y: rect.y }, width: rect.width, height: rect.height, layer: 'object', variant: fixture.y > 0 ? 'low' : index });
      result.occluders.push({ id, rect, height: fixture.y > 0 ? .9 : 1.9, fadeWhenPlayerBehind: true });
    }
    const layout = state.brief === brief && state.status === 'editing' ? state.layouts[brief] : state.completedLayouts[brief] ?? state.layouts[brief];
    for (const placement of layout) {
      const rect = placementRect(placement, brief), id = `reading-room.${brief}.${placement.id}`;
      result.colliders.push({ id, rect });
      result.props.push({ id, kind: `reading-${placement.id}`, position: { x: rect.x, y: rect.y }, width: rect.width, height: rect.height, layer: 'object', variant: placement.rotation });
      if (placement.id === 'table') {
        result.occluders.push({ id, rect, height: 1.2, fadeWhenPlayerBehind: false });
        if (state.completed.includes(brief)) result.props.push({ id: `${id}.book`, kind: 'reading-open-book', position: { x: rect.x + rect.width * .3, y: rect.y + rect.height * .3 }, width: .8, height: .65, layer: 'object', variant: brief });
      }
    }
    if (state.completed.includes(brief)) result.props.push({ id: `reading-room.${brief}.sunlight`, kind: 'reading-sunlight', position: { x: region.x + 2.5 * region.cellSize, y: region.y }, width: 2.8, height: 4.2, layer: 'ground', variant: brief });
    if (state.brief === brief && state.selected && state.draft) {
      const p = { id: state.selected, ...state.draft }, rect = placementRect(p, brief);
      result.props.push({ id: 'reading-room.draft', kind: 'reading-draft', position: { x: rect.x, y: rect.y }, width: rect.width, height: rect.height, layer: 'ground', variant: legal(brief, state.layouts[brief], p) ? 'valid' : 'blocked' });
    }
  }
  return result;
}
