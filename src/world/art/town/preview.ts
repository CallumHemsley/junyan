import { drawMap, renderObjects } from './index';
import { paintWorld } from '../../painter';
import { createGame, reduceGame, getOrder, orderTotal } from '../../../game';
import { content } from '../../../content';
import { KITCHEN, TABLES } from '../../../contracts';
import { validateSavedGame } from '../../../save';
import definition from '../../maps/town/map.json';
import { worldMapSchema, type Point } from '../../schema';
import { project, unproject } from '../../camera';
import { findPath } from '../../geometry';
import type { WorldRenderView } from '../../render-contract';

const map = worldMapSchema.parse(definition);
const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
let focus: Point = map.defaultSpawn;
let player: Point = map.defaultSpawn;
let elapsedMs = 0;
function render() {
  canvas.width = Math.round(innerWidth / 2); canvas.height = Math.round(innerHeight / 2);
  const camera = { width: canvas.width, height: canvas.height, focus, scale: 17 };
  const base = { project: (p: Point, z = 0) => project(p, camera, z), elapsedMs, reducedMotion: true, playerPosition: player, width: canvas.width, height: canvas.height };
  drawMap(ctx, map, { ...base, pass: 'ground' });
  const view: WorldRenderView = { ...base, pass: 'objects' };
  for (const object of renderObjects(map, view).sort((a,b) => a.position.x+a.position.y-b.position.x-b.position.y)) object.draw(ctx, view);
  drawMap(ctx, map, { ...base, pass: 'foreground' });
  const p = project(player, camera);
  ctx.fillStyle = '#f5e8ca'; ctx.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 12, 5, 10);
  ctx.fillStyle = '#302b2a'; ctx.fillRect(Math.round(p.x) - 3, Math.round(p.y) - 15, 6, 4);
}
const query = new URLSearchParams(location.search);
const landmark = map.landmarks.find(p => p.id === `town.${query.get('landmark')}`);
if (landmark) focus = player = landmark.position;
addEventListener('resize', render);
Object.assign(window, { townPreview: {
  render(position: Point, time = 0) { focus = player = position; elapsedMs = time; render(); },
  production(position: Point, phase: 'morning' | 'evening', reducedMotion = true) {
    focus = player = position;
    canvas.width = Math.round(innerWidth / 2); canvas.height = Math.round(innerHeight / 2);
    const camera = { width: canvas.width, height: canvas.height, focus, scale: 17 };
    let game = createGame(content, 42);
    if (phase === 'evening') for (const table of TABLES.slice(0, 3)) {
      const approach = { x: table.x, y: table.y + 1.3 };
      game = reduceGame(game, { type: 'move', position: approach }, content);
      game = reduceGame(game, { type: 'interact', table: table.table }, content);
      const order = getOrder(game, table.table, content)!;
      game = reduceGame(game, { type: 'move', position: KITCHEN }, content);
      for (const item of order.items) for (let i = 0; i < item.quantity; i++) game = reduceGame(game, { type: 'pickup', foodId: item.foodId }, content);
      game = reduceGame(game, { type: 'move', position: approach }, content);
      game = reduceGame(game, { type: 'deliver', table: table.table, now: 1000 }, content);
      game = reduceGame(game, { type: 'pay', table: table.table, change: order.paid - orderTotal(order, content) }, content);
    }
    if (!validateSavedGame(game, content) || game.served !== (phase === 'morning' ? 0 : 3)) throw new Error('Invalid day-phase fixture');
    const world = { version: 1 as const, mapId: 'town', position, facing: 'south' as const, returnPositions: {}, activeActivity: null, activeAnchorId: null };
    paintWorld(ctx, map, { project: (p, z) => project(p, camera, z), elapsedMs: 1200, reducedMotion, playerPosition: position, width: canvas.width, height: canvas.height, pass: 'ground' }, 'south', false, camera.scale, game, world);
    return { phase, served: game.served, validSave: true, particlesDisabled: reducedMotion, renderer: 'production paintWorld', camera };
  },
  shadeProbe() {
    const originalAlpha = ctx.globalAlpha;
    ctx.globalAlpha = .45;
    let calls = 0;
    const view: WorldRenderView = { project: p => ({ x: p.x, y: p.y }), elapsedMs: 0, reducedMotion: true, playerPosition: { x: 34, y: 32 }, width: 640, height: 400, pass: 'ground', shadeColor() { calls++; return '#010203'; } };
    drawMap(ctx, map, view);
    for (const object of renderObjects(map, view)) object.draw(ctx, view);
    const result = { calls, inheritedAlpha: ctx.globalAlpha };
    ctx.globalAlpha = originalAlpha;
    return result;
  },
  path(target: Point) { return findPath(map, player, target); },
  ground(client: Point) { return unproject({ x: client.x / 2, y: client.y / 2 }, { width: canvas.width, height: canvas.height, focus, scale: 17 }); },
  map,
} });
render();
