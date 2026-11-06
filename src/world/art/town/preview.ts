import { drawMap, renderObjects } from './index';
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
  path(target: Point) { return findPath(map, player, target); },
  ground(client: Point) { return unproject({ x: client.x / 2, y: client.y / 2 }, { width: canvas.width, height: canvas.height, focus, scale: 17 }); },
  map,
} });
render();
