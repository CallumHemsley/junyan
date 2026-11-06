import { describe, expect, it } from 'vitest';
import { drawApartmentFurniture, renderFurnitureObjects, type ResidentialArtApi } from './index';
import { initialState, type ItemId, type Placement } from '../../../features/apartment/rules';
import { furnitureWorldRect } from '../../../features/apartment/world';
import type { WorldRenderView } from '../../render-contract';

const paid = ['blue-vase', 'large-basket', 'small-lamp'] as const;
describe('paid apartment world artwork', () => {
  it('gives all purchases grounded bodies inside their saved cell in both rotations', () => {
    const signatures = new Set<string>();
    for (const id of paid) for (const rotation of [0, 1] as const) for (const [x, y] of [[2, 0], [4, 3]]) {
      const placement: Placement = { id, x, y, rotation }, rect = furnitureWorldRect(placement, 'small');
      const bodies: number[][] = [], colours: unknown[] = [];
      const api: ResidentialArtApi = {
        box(x, y, z, right, front, top, colour) { bodies.push([x, y, right, front, z, top]);colours.push(colour); },
        sphere(x, y, z, radius, colour) { bodies.push([x - radius, y - radius, x + radius, y + radius, z - radius, z + radius]);colours.push(colour); },
        capsule(a, b, ar, br, colour) { const r = Math.max(ar, br);bodies.push([Math.min(a[0], b[0]) - r, Math.min(a[1], b[1]) - r, Math.max(a[0], b[0]) + r, Math.max(a[1], b[1]) + r, Math.min(a[2], b[2]) - r, Math.max(a[2], b[2]) + r]);colours.push(colour(b[2])); },
        castShadow() {},
      };
      drawApartmentFurniture(api, { ...initialState(), placements: [placement] });
      expect(bodies.length, id).toBeGreaterThan(3);
      expect(rect.width).toBe(2);expect(rect.height).toBe(2);
      for (const [left, back, right, front] of bodies) {
        expect(left, id).toBeGreaterThanOrEqual(rect.x);expect(back, id).toBeGreaterThanOrEqual(rect.y);
        expect(right, id).toBeLessThanOrEqual(rect.x + rect.width);expect(front, id).toBeLessThanOrEqual(rect.y + rect.height);
      }
      expect(Math.min(...bodies.map(b => b[4])), id).toBeLessThanOrEqual(.05);
      expect(Math.max(...bodies.map(b => b[5])), id).toBeGreaterThan(.9);
      if (!rotation && x === 2) signatures.add(JSON.stringify(colours));
    }
    expect(signatures.size).toBe(3);
  });

  it('uses each committed footprint for depth, shades every material, and restores inherited alpha', () => {
    for (const id of paid) {
      const placement: Placement = { id: id as ItemId, x: 3, y: 2, rotation: 1 };
      const state = { ...initialState(), placements: [placement] }, rect = furnitureWorldRect(placement, state.rugSize);
      const object = renderFurnitureObjects(state)[0], fills: unknown[] = [], stack: number[] = [];
      const context = { globalAlpha: .37, fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: 'butt',
        beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, ellipse() {},
        fill() { fills.push(this.fillStyle); }, stroke() { fills.push(this.strokeStyle); },
        save() { stack.push(this.globalAlpha); }, restore() { this.globalAlpha = stack.pop()!; },
      };
      const view: WorldRenderView = { project: (p, z = 0) => ({ x: (p.x - p.y) * 15, y: (p.x + p.y) * 7.5 - z * 15 }), shadeColor: () => '#123456', elapsedMs: 0, reducedMotion: true, playerPosition: { x: 0, y: 0 }, width: 390, height: 844, pass: 'objects' };
      expect(object.id).toBe(`apartment.furniture.${id}`);
      expect(object.position).toEqual({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
      object.draw(context as unknown as CanvasRenderingContext2D, view);
      expect(fills.length, id).toBeGreaterThan(5);
      expect(new Set(fills)).toEqual(new Set(['#123456']));
      expect(context.globalAlpha).toBe(.37);
    }
  });
});
