import type { Point, Rect } from '../../schema';

type Surface = { id: string; kind: 'landing' | 'tread'; rect: Rect; height: number };
export const stairSurfaces: readonly Surface[] = [
  { id: 'hall-landing', kind: 'landing', rect: { x: 3, y: 33, width: 17, height: 7 }, height: 0 },
  ...Array.from({ length: 18 }, (_, index): Surface => ({ id: `lower-tread-${index}`, kind: 'tread', rect: { x: 3, y: 32.5 - index * .5, width: 5, height: .5 }, height: (index + 1) / 18 * 2.4 })),
  { id: 'home-landing', kind: 'landing', rect: { x: 3, y: 19, width: 17, height: 5 }, height: 2.4 },
  ...Array.from({ length: 20 }, (_, index): Surface => ({ id: `upper-tread-${index}`, kind: 'tread', rect: { x: 15, y: 18.5 - index * .5, width: 5, height: .5 }, height: 2.4 + (index + 1) / 20 * 2.4 })),
  { id: 'roof-landing', kind: 'landing', rect: { x: 3, y: 3, width: 17, height: 6 }, height: 4.8 },
];
const levels = [...new Set([0, ...stairSurfaces.map(surface => surface.height)])].sort((a, b) => a - b);
const flat = [0] as const;
export function surfaceLevels(mapId: string): readonly number[] { return mapId === 'residential-stairs' ? levels : flat; }
export function surfaceHeight(mapId: string, point: Point): number {
  if (mapId !== 'residential-stairs') return 0;
  return stairSurfaces.find(({ rect }) => point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height)?.height ?? 0;
}

export function supportHeight(mapId: string, point: Point): number {
  if (mapId !== 'residential-stairs') return 0;
  let height = 0, distance = Infinity;
  for (const surface of stairSurfaces) {
    const r = surface.rect, dx = Math.max(r.x - point.x, 0, point.x - r.x - r.width), dy = Math.max(r.y - point.y, 0, point.y - r.y - r.height);
    const next = Math.hypot(dx, dy);
    if (next < distance) { distance = next;height = surface.height; }
  }
  return height;
}
