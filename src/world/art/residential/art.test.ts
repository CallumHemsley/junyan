import { describe, expect, it } from 'vitest';
import { mapDefinitions } from '../../maps/residential';
import { stairSurfaces } from '../../maps/residential/elevation';
import { restaurantMap } from '../../restaurant';
import { worldMapSchema } from '../../schema';
import { drawMap, drawResidentialFloor, type ResidentialArtApi, renderFurnitureObjects, renderObjects } from './index';
import { initialState, reduce } from '../../../features/apartment/rules';
import { furnitureColliders } from '../../../features/apartment/world';
import type { WorldRenderView } from '../../render-contract';
const view: WorldRenderView = { project: p => p, elapsedMs: 0, reducedMotion: true, playerPosition: { x: 15, y: 14 }, width: 390, height: 844, pass: 'objects' };

describe('residential object composition', () => {
  it('paints every tread and landing at the same absolute height used for feet', () => {
    const boxes: { x: number; y: number; right: number; front: number; top: number }[] = [];
    const api: ResidentialArtApi = { box(x, y, _z, right, front, top) { boxes.push({ x, y, right, front, top }); }, sphere() {}, capsule() {}, castShadow() {} };
    drawResidentialFloor(api, 'residential-stairs');
    for (const surface of stairSurfaces) {
      const x = surface.rect.x + surface.rect.width / 2, y = surface.rect.y + surface.rect.height / 2;
      expect(boxes.some(b => x >= b.x && x <= b.right && y >= b.y && y <= b.front && Math.abs(b.top - surface.height) < .00001), surface.id).toBe(true);
    }
  });
  it('covers timber terrain completely with clipped continuous boards', () => {
    for (const map of mapDefinitions.filter(map => map.id !== 'residential-stairs')) {
      const faces: {x: number; y: number; right: number; front: number}[] = [];
      const api: ResidentialArtApi = {box(x, y, z, right, front, top) { if (z === top) faces.push({x, y, right, front}); }, sphere() {}, capsule() {}, castShadow() {}};
      drawResidentialFloor(api, map.id);
      for (const {rect: r} of map.terrain.filter(terrain => terrain.material === 'timber')) {
        expect(faces.some(face => face.front - face.y > 4)).toBe(true);
        for (let x = r.x + .125; x < r.x + r.width; x += .25) for (let y = r.y + .125; y < r.y + r.height; y += .25)
          expect(faces.some(face => x >= face.x && x <= face.right && y >= face.y && y <= face.front), `${map.id} timber gap at ${x},${y}`).toBe(true);
      }
      for (const face of faces) expect(map.terrain.some(({rect: r, material}) => material === 'timber' && face.x >= r.x && face.y >= r.y && face.right <= r.x + r.width && face.front <= r.y + r.height)).toBe(true);
    }
  });
  it('rasterizes long timber faces whole while still subdividing solid stair slabs', () => {
    const topFaces: {colour: string; points: {x: number; y: number}[]}[] = [];
    let points: {x: number; y: number}[] = [];
    const ctx = {fillStyle: '', globalAlpha: 1, beginPath() {points = [];}, moveTo(x: number, y: number) {points.push({x, y});}, lineTo(x: number, y: number) {points.push({x, y});}, closePath() {}, fill() {topFaces.push({colour: this.fillStyle, points: [...points]});}, save() {}, restore() {}, ellipse() {}};
    const ground = {...view, pass: 'ground' as const, project: (p: {x: number; y: number}, z = 0) => ({x: p.x * 100, y: (p.y - z) * 100})};
    drawMap(ctx as unknown as CanvasRenderingContext2D, worldMapSchema.parse(mapDefinitions.find(map => map.id === 'apartment')), ground);
    const boards = topFaces.filter(face => /^rgb\((177|179|181|183|185),/.test(face.colour));
    expect(boards.some(face => Math.max(...face.points.map(p => p.y)) - Math.min(...face.points.map(p => p.y)) > 400)).toBe(true);
    const lastBoard = topFaces.map(face => boards.includes(face)).lastIndexOf(true);
    expect(topFaces.findIndex(face => face.colour === 'rgb(174,180,146)')).toBeGreaterThan(lastBoard);
    topFaces.length = 0;
    drawMap(ctx as unknown as CanvasRenderingContext2D, worldMapSchema.parse(mapDefinitions.find(map => map.id === 'residential-stairs')), ground);
    const slabs = topFaces.filter(face => /^rgb\((165|167|169|171|173|175|177),/.test(face.colour));
    expect(slabs.length).toBeGreaterThan(100);
    expect(slabs.every(face => Math.max(...face.points.map(p => p.x)) - Math.min(...face.points.map(p => p.x)) <= 100)).toBe(true);
  });
  it('never paints or registers props for an unowned map', () => {
    const context = new Proxy({} as CanvasRenderingContext2D, { get() { throw new Error('Residential art painted an unowned map'); } });
    for (const pass of ['ground', 'objects', 'foreground'] as const) drawMap(context, restaurantMap, { ...view, pass });
    expect(renderObjects(restaurantMap, view)).toEqual([]);
  });
  it('overrides every static object fallback and keeps unique depth IDs', () => {
    for (const definition of mapDefinitions) {
      const map = worldMapSchema.parse(definition), objects = renderObjects(map, view), ids = objects.map(o => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const prop of map.props.filter(p => p.layer === 'object')) expect(ids).toContain(prop.id);
    }
  });
  it('renders committed furniture and all gifted items with matching solid IDs', () => {
    let home = reduce(initialState(), { type: 'accept-starter' }, 1);
    for (const giftId of ['repairs.stool', 'garden.planter', 'cats.cushion'] as const) home = reduce(home, { type: 'receive-gift', giftId }, 1);
    for (const [id, x, y] of [['repairs.stool', 2, 0], ['garden.planter', 3, 0], ['cats.cushion', 4, 0]] as const) {
      home = reduce(home, { type: 'select', id }, 1);home = reduce(home, { type: 'place', x, y }, 1);
    }
    expect(home.placements.map(p => p.id)).toEqual(['bed', 'repairs.stool', 'garden.planter', 'cats.cushion']);
    expect(renderFurnitureObjects(home).map(o => o.id)).toEqual(furnitureColliders(home).map(c => c.id));
    const draft = reduce(home, { type: 'select', id: 'chair' }, 1);
    expect(renderFurnitureObjects(draft).map(o => o.id)).toEqual(renderFurnitureObjects(home).map(o => o.id));
  });
  it('keeps static solids outside every valid furniture placement cell', () => {
    const apartment = mapDefinitions.find(m => m.id === 'apartment')!;
    for (const { rect } of apartment.colliders) expect(rect.x + rect.width <= 4 || rect.x >= 16 || rect.y + rect.height <= 4 || rect.y >= 14).toBe(true);
  });
});
