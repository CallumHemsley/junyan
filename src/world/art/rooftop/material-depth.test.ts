import {expect, it} from 'vitest';
import {drawMap} from './index';
import {rooftopMap} from '../../maps/rooftop';
import type {WorldRenderView} from '../../render-contract';
import {worldMapSchema} from '../../schema';
import {sampleDayLight} from '../../atmosphere';

type Paint = {alpha: number; points: {x: number; y: number}[]; paths: {x: number; y: number}[][]; color: string};
function roofPaint(kind: string, width = 1.4, height = 1.4, overrides: Partial<WorldRenderView> = {}) {
  const paint: Paint[] = [], stack: {alpha: number; color: string}[] = [];
  let points: Paint['points'] = [];
  let paths: Paint['paths'] = [];
  const ctx = {
    globalAlpha: .45, fillStyle: '', strokeStyle: '', lineWidth: 1, imageSmoothingEnabled: true,
    save() { stack.push({alpha: this.globalAlpha, color: this.fillStyle}); },
    restore() { const prior = stack.pop()!; this.globalAlpha = prior.alpha; this.fillStyle = prior.color; },
    beginPath() { points = []; paths = []; }, moveTo(x: number, y: number) { paths.push([{x, y}]); points.push({x, y}); },
    lineTo(x: number, y: number) { points.push({x, y}); paths[paths.length - 1].push({x, y}); }, closePath() {}, clip() {}, stroke() {}, fillRect() {},
    fill() { paint.push({alpha: this.globalAlpha, points: [...points], paths: paths.map(p => [...p]), color: this.fillStyle}); },
  };
  const view: WorldRenderView = {project: (p, z = 0) => ({x: p.x * 100, y: (p.y - z) * 100}),
    playerPosition: {x: 10, y: 12}, width: 1440, height: 1000, elapsedMs: 0, reducedMotion: true, pass: 'ground',
    shadeColor: base => { expect(String(base).startsWith('shaded:')).toBe(false); return `shaded:${base}`; }, ...overrides};
  const map = worldMapSchema.parse({...rooftopMap, terrain: rooftopMap.terrain.slice(0, 1), props: [{id: 'fixture', kind, position: {x: 10, y: 12}, width, height, variant: 0, layer: 'object'}]});
  drawMap(ctx as unknown as CanvasRenderingContext2D, map, view);
  expect(ctx.globalAlpha).toBe(.45); expect(stack).toHaveLength(0);
  return paint;
}
const groundPaint = (kind: string, width = 1.4, height = 1.4) => roofPaint(kind, width, height).filter(p => Math.abs(p.alpha - .45 * .34) < .00001);
const castPaint = (kind: string, width = 1.4, height = 1.4, overrides: Partial<WorldRenderView> = {}) => roofPaint(kind, width, height, {castLight: sampleDayLight('morning'), ...overrides}).filter(p => p.color.startsWith('rgb('));
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

it('uses sampled direction, height, RGB and opacity without material shading a cast twice', () => {
  for (const phase of ['morning', 'noon', 'evening', 'night'] as const) {
    const light = sampleDayLight(phase);
    const [post, ...extra] = castPaint('post', .35, .35, {castLight: light});
    expect(extra).toHaveLength(0);
    expect(post.color).toBe(`rgb(${light.shadow.join(',')})`);
    expect(post.alpha).toBeCloseTo(.45 * light.shadowOpacity);
    const xs = post.points.map(p => p.x), ys = post.points.map(p => p.y);
    expect(Math.min(...xs)).toBe(Math.round((10 + Math.min(0, light.shadowOffset[0] * 3.3)) * 100));
    expect(Math.max(...xs)).toBe(Math.round((10.35 + Math.max(0, light.shadowOffset[0] * 3.3)) * 100));
    expect(Math.min(...ys)).toBe(1198);
    expect(Math.max(...ys)).toBe(Math.round((12.35 + light.shadowOffset[1] * 3.3 - .02) * 100));
  }
});

it('keeps slat gaps and actual supports in a single fill per object', () => {
  const [pergola] = castPaint('pergola', 13, 3);
  expect(pergola.paths).toHaveLength(20);
  expect(pergola.paths.every(p => Math.max(...p.map(q => q.x)) - Math.min(...p.map(q => q.x)) === 16)).toBe(true);
  const light = sampleDayLight('morning');
  expect(Math.min(...pergola.points.map(p => p.x))).toBe(Math.round((10 + light.shadowOffset[0] * 3.43) * 100));
  const [shade, ...extra] = castPaint('garden-shade', 2, 2.2);
  expect(extra).toHaveLength(0); expect(shade.paths).toHaveLength(9);
  expect(castPaint('tea-table', 3, 2)[0].paths).toHaveLength(5);
  expect(castPaint('bench', 4, 1)[0].paths).toHaveLength(10);
  const bed = castPaint('raised-bed', 7, 4)[0];
  expect(Math.max(...bed.points.map(p => p.x))).toBe(Math.round((17 + light.shadowOffset[0] * .57) * 100));
});

it('does not add roof casts for global tree/lamp owners, ground marks or unpainted props', () => {
  for (const kind of ['tree-bed', 'mature-tree', 'tree', 'willow', 'bamboo', 'lamp', 'lantern', 'street-lamp', 'floor-lamp', 'wall-lamp', 'task-lamp', 'warm-window', 'parapet', 'weathering', 'worn-paving', 'unknown']) {
    expect(castPaint(kind), kind).toHaveLength(0);
  }
  expect(roofPaint('post').filter(p => p.color.startsWith('rgb('))).toHaveLength(0);
});

it('keeps sampled casts identical across animation clocks and reduced motion', () => {
  for (const kind of ['pergola', 'garden-shade', 'bench', 'tea-table', 'post', 'laundry']) {
    const still = castPaint(kind, 4, 3);
    expect(castPaint(kind, 4, 3, {elapsedMs: 94000, reducedMotion: false})).toEqual(still);
    expect(castPaint(kind, 4, 3, {elapsedMs: 94000, reducedMotion: true})).toEqual(still);
  }
});
