import {expect, it} from 'vitest';
import {renderObjects} from './index';
import {rooftopMap} from '../../maps/rooftop';
import {worldMapSchema, type Point} from '../../schema';
import type {WorldRenderView} from '../../render-contract';

function paintTree(growth: number, droop: boolean, x = 24) {
  const fills: {color: string; points: Point[]}[] = [], branches: Point[] = [];
  let points: Point[] = [];
  const ctx = {
    fillStyle: '', strokeStyle: '', lineWidth: 1,
    save() {}, restore() {}, beginPath() { points = []; }, closePath() {},
    moveTo(x: number, y: number) { points.push({x, y}); }, lineTo(x: number, y: number) { points.push({x, y}); },
    fill() { fills.push({color: this.fillStyle, points: [...points]}); },
    stroke() { if (this.strokeStyle === '#495040' && this.lineWidth === 2) branches.push(points[1]); },
  };
  const view: WorldRenderView = {
    project: (p, z = 0) => ({x: (p.x - p.y) * 22, y: ((p.x + p.y) * .5 - z) * 22}),
    elapsedMs: 0, reducedMotion: true, playerPosition: {x: 24, y: 27}, width: 390, height: 844, pass: 'objects',
  };
  const map = worldMapSchema.parse({...rooftopMap, props: [{id: 'tree', kind: 'garden-tree', position: {x, y: 29}, width: 1.4, height: 1.4, layer: 'object', variant: growth * 6 + (droop ? 3 : 0)}]});
  const object = renderObjects(map, view)[0];
  object.draw(ctx as unknown as CanvasRenderingContext2D, view);
  return {crown: fills.find(fill => fill.color === '#2f503d')!.points, branches, object};
}

it('keeps all three boughs with the lowered crown at every saved growth and both crown hands', () => {
  for (const x of [24, 25]) for (const growth of [0, 1, 2, 3]) {
    const healthy = paintTree(growth, false, x), drooped = paintTree(growth, true, x);
    expect(healthy.branches).toHaveLength(3); expect(drooped.branches).toHaveLength(3);
    const shift = {x: drooped.crown[0].x - healthy.crown[0].x, y: drooped.crown[0].y - healthy.crown[0].y};
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(drooped.branches[i].x - healthy.branches[i].x - shift.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(drooped.branches[i].y - healthy.branches[i].y - shift.y)).toBeLessThanOrEqual(1);
    }
    for (const tree of [healthy, drooped]) for (const tip of tree.branches) {
      expect(tip.x).toBeGreaterThanOrEqual(Math.min(...tree.crown.map(p => p.x)) - 2);
      expect(tip.x).toBeLessThanOrEqual(Math.max(...tree.crown.map(p => p.x)) + 2);
      expect(tip.y).toBeGreaterThanOrEqual(Math.min(...tree.crown.map(p => p.y)) - 2);
    }
    expect(drooped.object.occlusion).toEqual(healthy.object.occlusion);
  }
});
