import type { Point, WorldMapDefinition } from '../../world/schema';
import { navigationFor } from '../../world/life/navigation';
import type { ActorPose } from '../../world/life/model';
import { placementRect } from './world';
import { reduce, type Action, type State } from './rules';

export const readingHome = { x: 12.6, y: 6.5 };
export const readerRadius = .22;
const speed = 1.7;
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
export function pathDuration(path: readonly Point[]) {
  return path.slice(1).reduce((ms, point, i) => ms + distance(path[i], point) / speed * 1000, 0);
}
export function samplePath(path: readonly Point[], elapsedMs: number) {
  let remaining = Math.max(0, elapsedMs);
  for (let i = 1; i < path.length; i++) {
    const from = path[i - 1], to = path[i], duration = distance(from, to) / speed * 1000;
    if (remaining < duration) {
      const t = remaining / duration;
      return { position: { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }, from, to, index: i, walking: true };
    }
    remaining -= duration;
  }
  const position = path[path.length - 1];
  return { position, from: position, to: position, index: path.length - 1, walking: false };
}
function certified(map: WorldMapDefinition, path: readonly Point[]) {
  const nav = navigationFor(map);
  return path.length >= 2 && path.every(point => nav.canStand(point, readerRadius)) && path.slice(1).every((point, i) => nav.canWalk(path[i], point, readerRadius));
}
function readingTargets(state: State, brief = state.brief): Point[] {
  const table = state.completedLayouts[brief]?.find(p => p.id === 'table');
  if (!table) return [];
  const rect = placementRect(table, brief);
  return [
    { x: rect.x + rect.width * .65, y: rect.y + rect.height + .42 },
    { x: rect.x + rect.width + .42, y: rect.y + rect.height * .65 },
    { x: rect.x - .42, y: rect.y + rect.height * .65 },
    { x: rect.x + rect.width * .65, y: rect.y - .42 },
  ];
}
function approach(state: State, map: WorldMapDefinition): Point[] | null {
  const nav = navigationFor(map);
  // Read with a book in her hands, on real floor beside the earned table.
  for (const target of readingTargets(state)) {
    if (!nav.canStand(target, readerRadius)) continue;
    const path = [readingHome, ...nav.route(readingHome, target, readerRadius, [])];
    if (distance(path[path.length - 1], target) < 1e-6 && certified(map, path)) return path;
  }
  return null;
}
function reversePath(path: readonly Point[], elapsedMs: number): Point[] {
  const sample = samplePath(path, elapsedMs);
  return [sample.position, ...path.slice(0, sample.walking ? sample.index : path.length - 1).reverse()];
}
function validVisit(state: State, map: WorldMapDefinition): boolean {
  const use = state.use!;
  if (distance(use.path[0], readingHome) > 1e-6 || !readingTargets(state, use.brief).some(point => distance(point, use.path[use.path.length - 1]) < 1e-6) || !certified(map, use.path)) return false;
  if (!use.returnPath) return true;
  const expected = reversePath(use.path, use.returnAt! - use.startedAt);
  return use.returnPath.length === expected.length && use.returnPath.every((point, i) => distance(point, expected[i]) < 1e-6) && certified(map, use.returnPath);
}
export function readingUsePose(state: State, map: WorldMapDefinition, elapsedMs: number): Pick<ActorPose, 'position' | 'facing' | 'yaw' | 'action' | 'activity'> | null {
  const use = state.use;
  if (!use || !Number.isFinite(elapsedMs) || elapsedMs < use.startedAt || use.returnAt !== null && elapsedMs < use.returnAt || !validVisit(state, map)) return null;
  const returning = use.returnAt !== null;
  const path = returning ? use.returnPath! : use.path;
  const sample = samplePath(path, elapsedMs - (use.returnAt ?? use.startedAt));
  // Settle facing into the room so her held book remains visible, rather than hidden behind her back.
  const target = sample.walking ? sample.to : { x: sample.position.x, y: sample.position.y + 1 };
  const dx = target.x - sample.position.x, dy = target.y - sample.position.y;
  return { position: sample.position, yaw: Math.atan2(dy, dx), facing: Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'east' : 'west' : dy > 0 ? 'south' : 'north', action: sample.walking ? 'walk' : 'idle', activity: sample.walking ? 'walk' : 'work' };
}
export function queueReadingEdit(state: State, action: Action, elapsedMs: number): State | null {
  if (!state.use || (action.type !== 'restart' && action.type !== 'begin-brief')) return null;
  if (state.use.pending || !Number.isFinite(elapsedMs) || elapsedMs < state.use.startedAt) return state;
  // The next injected frame clock reverses at the actual visible position, never an older save checkpoint.
  return { ...state, selected: null, draft: null, use: { ...state.use, pending: action.type === 'restart' ? 'restart' : action.brief } };
}
function finishEdit(state: State): State {
  const pending = state.use?.pending, home = { ...state, use: null };
  return pending ? reduce(home, pending === 'restart' ? { type: 'restart' } : { type: 'begin-brief', brief: pending }) : home;
}
export function advanceReadingUse(state: State, map: WorldMapDefinition, elapsedMs: number, available: boolean, onMap: boolean): State {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return state;
  const use = state.use;
  if (use) {
    if (elapsedMs < use.startedAt || use.returnAt !== null && use.returnAt > elapsedMs || !validVisit(state, map)) return { ...state, use: null };
    if (!available) return finishEdit(state);
    if (use.pending && use.returnAt === null) {
      const returnPath = reversePath(use.path, elapsedMs - use.startedAt);
      return pathDuration(returnPath) < 1e-6 ? finishEdit(state) : { ...state, use: { ...use, returnAt: elapsedMs, returnPath } };
    }
    const complete = use.returnAt !== null && elapsedMs >= use.returnAt + pathDuration(use.returnPath!);
    if (complete) {
      return finishEdit(state);
    }
    return state;
  }
  if (!available || !onMap || state.status !== 'complete') return state;
  const path = approach(state, map);
  return path ? { ...state, use: { brief: state.brief, startedAt: elapsedMs, path, returnAt: null, returnPath: null, pending: null } } : state;
}
