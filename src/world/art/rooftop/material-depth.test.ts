import {expect, it} from 'vitest';
import {drawMap} from './index';
import {rooftopMap} from '../../maps/rooftop';
import type {WorldRenderView} from '../../render-contract';
import {worldMapSchema} from '../../schema';

type Paint = {alpha: number; points: {x: number; y: number}[]; color: string};
function groundPaint(kind: string, width = 1.4, height = 1.4) {
  const paint: Paint[] = [], stack: {alpha: number; color: string}[] = [];
  let points: Paint['points'] = [];
  const ctx = {
    globalAlpha: .45, fillStyle: '', strokeStyle: '', lineWidth: 1, imageSmoothingEnabled: true,
    save() { stack.push({alpha: this.globalAlpha, color: this.fillStyle}); },
    restore() { const prior = stack.pop()!; this.globalAlpha = prior.alpha; this.fillStyle = prior.color; },
    beginPath() { points = []; }, moveTo(x: number, y: number) { points.push({x, y}); },
    lineTo(x: number, y: number) { points.push({x, y}); }, closePath() {}, stroke() {}, fillRect() {},
    fill() { paint.push({alpha: this.globalAlpha, points: [...points], color: this.fillStyle}); },
  };
  const view: WorldRenderView = {project: (p, z = 0) => ({x: p.x * 100, y: (p.y - z) * 100}),
    playerPosition: {x: 10, y: 12}, width: 1440, height: 1000, elapsedMs: 0, reducedMotion: true, pass: 'ground',
    shadeColor: base => { expect(String(base).startsWith('shaded:')).toBe(false); return `shaded:${base}`; }};
  const map = worldMapSchema.parse({...rooftopMap, terrain: [], props: [{id: 'fixture', kind, position: {x: 10, y: 12}, width, height, variant: 0, layer: 'object'}]});
  drawMap(ctx as unknown as CanvasRenderingContext2D, map, view);
  expect(ctx.globalAlpha).toBe(.45); expect(stack).toHaveLength(0);
  return paint.filter(p => Math.abs(p.alpha - .45 * .34) < .00001);
}
it('attaches compact contact shade to pot bases and actual canopy supports below object depth', () => {
  for (const kind of ['garden-tree', 'raised-bed', 'tree-bed', 'border-pot']) {
    const [contact, ...extra] = groundPaint(kind);
    expect(extra).toHaveLength(0); expect(contact.color).toMatch(/^shaded:/);
    expect(Math.min(...contact.points.map(p => p.x))).toBe(994);
    expect(Math.max(...contact.points.map(p => p.x))).toBe(1147);
    expect(Math.min(...contact.points.map(p => p.y))).toBe(1191);
    expect(Math.max(...contact.points.map(p => p.y))).toBe(1344);
  }
  const shade = groundPaint('garden-shade', 2, 2.2);
  expect(shade).toHaveLength(2);
  expect(shade.every(p => Math.max(...p.points.map(q => q.x)) - Math.min(...p.points.map(q => q.x)) === 24)).toBe(true);
  expect(groundPaint('post', .35, .35)).toHaveLength(1);
  const bench = groundPaint('bench', 4, 1);
  expect(bench).toHaveLength(2);
  expect(bench.every(p => Math.max(...p.points.map(q => q.x)) - Math.min(...p.points.map(q => q.x)) === 27)).toBe(true);
  const table = groundPaint('tea-table', 3, 2);
  expect(table).toHaveLength(4);
  expect(table.every(p => Math.max(...p.points.map(q => q.x)) - Math.min(...p.points.map(q => q.x)) === 26)).toBe(true);
  expect(groundPaint('pergola', 13, 3)).toHaveLength(0);
  expect(groundPaint('warm-window')).toHaveLength(0);
});
