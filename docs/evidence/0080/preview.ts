import { courtyardMap } from '../../../src/world/maps/courtyard';
import { catHabitat } from '../../../src/world/maps/courtyard/habitat';
import { drawMap, drawCat } from '../../../src/world/art/courtyard';
import { worldMapSchema } from '../../../src/world/schema';
import { movePlayer, findPath, canStand } from '../../../src/world/geometry';
import { project, pointerGround } from '../../../src/world/camera';
import { initialState, reduce } from '../../../src/features/cats/rules';
import type { WorldRenderView } from '../../../src/world/render-contract';

const map = worldMapSchema.parse(courtyardMap);
const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
let position = { ...map.defaultSpawn }, path: { x: number; y: number }[] = [], last = 0;
let state = initialState(), day = 1;
const keys = new Set<string>();
const camera = () => ({ focus: position, width: canvas.width, height: canvas.height, scale: innerWidth < 600 ? 18 : 22 });
function resize() { canvas.width = Math.min(innerWidth, 1200); canvas.height = innerHeight - 52; }
resize(); addEventListener('resize', resize);
canvas.addEventListener('keydown', event => { if (event.key.startsWith('Arrow')) { keys.add(event.key); path = []; event.preventDefault(); } });
canvas.addEventListener('keyup', event => { keys.delete(event.key); event.preventDefault(); });
canvas.addEventListener('blur', () => keys.clear());
canvas.addEventListener('pointerdown', event => { canvas.focus(); path = findPath(map, position, pointerGround({ x: event.clientX, y: event.clientY }, canvas.getBoundingClientRect(), camera())); });
document.querySelector('#rain')!.addEventListener('click', () => {
  for (const action of [{ type: 'select', target: 'white' }, { type: 'crouch' }, { type: 'wait' }, { type: 'approach' }, { type: 'follow' }, { type: 'reunite' }] as const) state = reduce(state, action, 1);
  state = reduce(state, { type: 'begin' }, 2); day = 2;
});
function draw(now: number) {
  const dt = Math.min(.04, (now - last) / 1000); last = now;
  const dx = Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft')), dy = Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp'));
  if (dx || dy) { const length = Math.hypot(dx, dy); position = { ...position, ...movePlayer(map, position, { x: dx / length * dt * 5, y: dy / length * dt * 5 }) }; }
  if (path.length) {
    const next = path[0], distance = Math.hypot(next.x - position.x, next.y - position.y);
    if (distance < .08) { position = { ...position, ...next }; path.shift(); }
    else { const amount = Math.min(dt * 8, distance); position = { ...position, ...movePlayer(map, position, { x: (next.x - position.x) / distance * amount, y: (next.y - position.y) / distance * amount }) }; }
  }
  ctx.fillStyle = '#66765d'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const view: WorldRenderView = { project: (p, z) => project(p, camera(), z), playerPosition: position, elapsedMs: now, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, width: canvas.width, height: canvas.height, pass: 'ground' };
  drawMap(ctx, map, view); drawMap(ctx, map, { ...view, pass: 'objects' });
  const habitats = catHabitat(state, day);
  drawCat(ctx, view, habitats.white, false, habitats.white.relaxed); drawCat(ctx, view, habitats.black, true, habitats.black.relaxed);
  const p = view.project(position);
  ctx.fillStyle = '#40554a'; ctx.fillRect(p.x - 4, p.y - 10, 3, 10); ctx.fillRect(p.x + 1, p.y - 10, 3, 10);
  ctx.fillStyle = '#e5d9ba'; ctx.fillRect(p.x - 5, p.y - 24, 10, 15);
  ctx.fillStyle = '#d6b18d'; ctx.fillRect(p.x - 4, p.y - 31, 8, 9);
  ctx.fillStyle = '#4b463b'; ctx.fillRect(p.x - 5, p.y - 33, 10, 5);
  drawMap(ctx, map, { ...view, pass: 'foreground' });
  document.querySelector('#status')!.textContent = `${position.x.toFixed(1)}, ${position.y.toFixed(1)}. ${path.length} path points.`;
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
Object.assign(window, { courtyardProof: { get position() { return position; }, get path() { return path; }, get map() { return map; }, project: (p: { x: number; y: number }) => project(p, camera()), focus(p: { x: number; y: number }) { if (!canStand(map, p)) throw Error('Blocked proof focus'); position = { ...position, ...p }; path = []; } } });
