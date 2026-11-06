import type { FramePoint } from '../../world/camera';
import type { Rect } from '../../world/schema';
import { readingRoomMap } from '../../world/maps/reading-room';
import { readingWindowFrame } from '../../world/art/reading-room/window-geometry';
import { briefIds, type BriefId } from './content';
import { legal, type State } from './rules';
import { placementRect, regions } from './world';

function extent(rect: Rect, bottom: number, top: number): FramePoint[] {
  return [bottom, top].flatMap(z => [
    { x: rect.x, y: rect.y, z }, { x: rect.x + rect.width, y: rect.y, z },
    { x: rect.x, y: rect.y + rect.height, z }, { x: rect.x + rect.width, y: rect.y + rect.height, z },
  ]);
}
function briefFrame(brief: BriefId): FramePoint[] {
  const region = regions[brief], points: FramePoint[] = [];
  for (let x = 0; x < region.columns; x++) for (let y = 0; y < region.rows; y++) {
    const placement = { id: 'chair' as const, x, y, rotation: 0 as const };
    if (legal(brief, [], placement)) points.push(...extent(placementRect(placement, brief), 0, 1.7));
  }
  const window = readingRoomMap.props.find(prop => prop.id === `reading-room.${brief === 'window' ? 'broad' : 'alcove'}-window`)!;
  const frame = readingWindowFrame;
  points.push(...extent({ x: window.position.x - frame.overhang, y: window.position.y + frame.overhang, width: window.width + frame.overhang * 2, height: frame.sillY + frame.sillDepth - frame.overhang }, frame.bottom, frame.bottom + frame.height));
  return points;
}
const frames = { window: briefFrame(briefIds[0]), alcove: briefFrame(briefIds[1]) };

/** Presentation only: the full usable floor, furniture height and its authored window. */
export function readingRoomFrame(state: Pick<State, 'brief' | 'selected' | 'draft'>): readonly FramePoint[] {
  const frame = frames[state.brief];
  return state.selected && state.draft
    ? [...frame, ...extent(placementRect({ id: state.selected, ...state.draft }, state.brief), 0, 1.7)]
    : frame;
}
