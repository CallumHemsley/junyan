import type { Point } from '../../schema';

export function surfaceHeight(mapId: string, point: Point): number {
  if (mapId !== 'residential-stairs') return 0;
  if (point.y >= 33) return 0;
  if (point.y >= 24) return (33 - point.y) / 9 * 2.4;
  if (point.y >= 19) return 2.4;
  if (point.y >= 9) return 2.4 + (19 - point.y) / 10 * 2.4;
  return 4.8;
}
