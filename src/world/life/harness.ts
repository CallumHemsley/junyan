import { worldMapSchema } from '../schema';
import type { WorldMapDefinition, Point } from '../schema';
import { canStand, movePlayer, findPath } from '../geometry';
import { project, pointerGround } from '../camera';
import { advanceLife, compileLife, drawLifeActor, drawLifeReactions, initialLifeState, interactLife, nearbyLife, navigationFor, restoreLife, sampleLife } from './index';
import type { LifeContext, LifePlan } from './index';
import type { WorldRenderView } from '../render-contract';
import type { Line } from '../../contracts';
import { wordText, wordPronunciation, lineLabel } from './word-display';

const snapshots = await fetch('/output/verification/world/0087/maps.json').then(response => response.json()) as { sha: string; path: string; map: unknown }[];
const maps = snapshots.map(item => worldMapSchema.parse(item.map));
const actorUrl = '/output/verification/world/0087/characters/src/world/characters/index.ts';
const adapterUrl = '/output/verification/world/0087/characters/src/world/characters/adapter.ts';
const { sampleActor } = await import(/* @vite-ignore */ actorUrl);
const { paintActorCanvas } = await import(/* @vite-ignore */ adapterUrl);
const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
const hud = document.querySelector<HTMLDivElement>('#hud')!;
const speech = document.querySelector<HTMLDivElement>('#speech')!;
const card = document.querySelector<HTMLDivElement>('#card')!;
const keys = new Set<string>();
const storageKey = 'junyan-life-0087-proof';
let map = maps[0], plan: LifePlan, navigation = navigationFor(map);
let player: Point = map.defaultSpawn;
let elapsedMs = 0, last = performance.now(), path: Point[] = [], travelled = 0;
let life = restoreLife(JSON.parse(localStorage.getItem(storageKey) ?? 'null'));
elapsedMs = life.elapsedMs;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let choices = '', currentActors = sampleLife(compileLife(map, navigation), context());
let errors: string[] = [], frameCount = 0;
function context(): LifeContext {
  return { day: 2, elapsedMs, seed: 42, player, reducedMotion: reduced.matches, gardenMature: true,
    cats: { story: { node: 'reunited', day: 1 }, repeat: { status: 'idle' } } };
}
function setMap(id: string) {
  const next = maps.find(item => item.id === id);
  if (!next) throw Error(`Unknown proof map ${id}`);
  map = next; navigation = navigationFor(map); plan = compileLife(map, navigation);
  player = { x: map.defaultSpawn.x, y: map.defaultSpawn.y }; path = []; keys.clear(); choices = ''; travelled = 0;
}
setMap(map.id);
function save() { localStorage.setItem(storageKey, JSON.stringify(life)); }
function show(line: Line) {
  speech.replaceChildren();
  for (const word of line.tokens) {
    const button = document.createElement('button'); button.textContent = wordText(word);
    button.onclick = () => { card.textContent = `${wordText(word)} ${wordPronunciation(word)}`; };
    speech.append(button);
  }
  const replay = document.createElement('button'); replay.textContent = '↻'; replay.ariaLabel = '再听';
  replay.onclick = () => { void new Audio(line.audio).play().catch(error => errors.push(String(error))); };
  speech.append(replay);
}
function use(id: string) {
  const result = interactLife(life, plan, currentActors, context(), id, navigation);
  life = result.state; save();
  if (result.line) show(result.line);
  return result;
}
function polygon(points: Point[], color: string, view: WorldRenderView) {
  ctx.fillStyle = color; ctx.beginPath(); points.forEach((point, i) => { const p = view.project(point); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath(); ctx.fill();
}
function rect(rect: { x: number; y: number; width: number; height: number }, color: string, view: WorldRenderView) {
  polygon([{ x: rect.x, y: rect.y }, { x: rect.x + rect.width, y: rect.y }, { x: rect.x + rect.width, y: rect.y + rect.height }, { x: rect.x, y: rect.y + rect.height }], color, view);
}
function draw() {
  canvas.width = Math.max(1, Math.round(innerWidth / 2)); canvas.height = Math.max(1, Math.round(innerHeight / 2));
  ctx.imageSmoothingEnabled = false;
  const camera = { focus: player, width: canvas.width, height: canvas.height, scale: 14 };
  const view: WorldRenderView = { project: (p, z = 0) => project(p, camera, z), elapsedMs, reducedMotion: reduced.matches, playerPosition: player, width: canvas.width, height: canvas.height, pass: 'objects' };
  ctx.fillStyle = '#a5b28d'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  map.terrain.forEach(tile => rect(tile.rect, /water|pond|river/.test(tile.material) ? '#719595' : /grass|garden|plant|moss/.test(tile.material) ? '#8da77c' : /wood|deck/.test(tile.material) ? '#bca17c' : '#c9c0a3', view));
  map.walkable.forEach(tile => rect(tile, '#c9c0a350', view));
  map.colliders.forEach(item => rect(item.rect, /water|pond/.test(item.id) ? '#6d9192' : '#657f65', view));
  map.exits.forEach(item => rect(item.rect, '#e5d8b3', view));
  currentActors = sampleLife(plan, context(), navigation, life);
  const figures = [...currentActors, { id: 'player', characterId: 'xiao-zhou', kind: 'resident' as const, position: player, facing: 'south' as const, action: keys.size || path.length ? 'walk' as const : 'idle' as const, activity: 'idle' as const, phaseMs: elapsedMs, radius: .22 }].sort((a, b) => a.position.x + a.position.y - b.position.x - b.position.y);
  for (const actor of figures) drawLifeActor(ctx, actor, view, (ctx, pose, view, posture) => {
    const p = view.project(pose.position);
    const sample = sampleActor({ characterId: pose.characterId, facing: pose.facing, action: pose.action, elapsedMs: pose.phaseMs, reducedMotion: view.reducedMotion, posture });
    paintActorCanvas(ctx, sample, Math.round(p.x), Math.round(p.y), .7);
  }, life);
  drawLifeReactions(ctx, life, map.id, [...map.landmarks, ...currentActors.map(actor => ({ id: actor.id, position: actor.position }))], view);
  const nearby = nearbyLife(plan, currentActors, player, navigation);
  const key = nearby.map(item => item.id).join('|');
  if (key !== choices) {
    choices = key; hud.replaceChildren();
    for (const option of nearby.slice(0, 4)) {
      const button = document.createElement('button'); button.dataset.action = option.id;
      button.textContent = lineLabel(option.label); button.onclick = () => use(option.id); hud.append(button);
    }
  }
  frameCount++;
}
window.addEventListener('keydown', event => { if (event.key.startsWith('Arrow') || ['w', 'a', 's', 'd'].includes(event.key)) { event.preventDefault(); keys.add(event.key); path = []; } });
window.addEventListener('keyup', event => keys.delete(event.key));
window.addEventListener('blur', () => keys.clear());
document.addEventListener('visibilitychange', () => { last = performance.now(); keys.clear(); save(); });
window.addEventListener('pagehide', save);
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-key]')) {
  button.onpointerdown = event => { button.setPointerCapture(event.pointerId); keys.add(button.dataset.key!); path = []; };
  button.onpointerup = button.onpointercancel = () => keys.delete(button.dataset.key!);
}
canvas.onpointerdown = event => {
  const camera = { focus: player, width: canvas.width, height: canvas.height, scale: 14 };
  const target = pointerGround({ x: event.clientX, y: event.clientY }, canvas.getBoundingClientRect(), camera);
  path = findPath(map, player, target);
};
function frame(now: number) {
  const dt = document.hidden ? 0 : Math.min(50, now - last); last = now; life = advanceLife(life, dt, !document.hidden); elapsedMs = life.elapsedMs;
  let dx = Number(keys.has('ArrowRight') || keys.has('d')) - Number(keys.has('ArrowLeft') || keys.has('a'));
  let dy = Number(keys.has('ArrowDown') || keys.has('s')) - Number(keys.has('ArrowUp') || keys.has('w'));
  if (path.length) {
    const target = path[0], distance = Math.hypot(target.x - player.x, target.y - player.y);
    if (distance < .15) path.shift(); else { dx = target.x - player.x; dy = target.y - player.y; }
  }
  if (dx || dy) {
    const length = Math.hypot(dx, dy), speed = 3.8 * dt / 1000;
    const next = movePlayer(map, player, { x: dx / length * speed, y: dy / length * speed });
    travelled += Math.hypot(next.x - player.x, next.y - player.y); player = next;
  }
  draw(); requestAnimationFrame(frame);
}
window.addEventListener('error', event => errors.push(event.message));
Object.assign(window, { __LIFE_PROOF__: {
  setMap,
  seedApproach: (point: Point) => { if (!canStand(map, point)) throw Error('Blocked proof approach'); player = point; path = []; },
  inspect: () => ({ mapId: map.id, player, travelled, elapsedMs, frameCount, actors: currentActors, diagnostics: plan.diagnostics, life, errors, sources: snapshots.map(({ sha, path, map }) => ({ sha, path, mapId: (map as WorldMapDefinition).id })) }),
  approach: (point: Point) => { path = findPath(map, player, point); return path; },
  nearby: () => nearbyLife(plan, currentActors, player, navigation),
  stand: (point: Point) => canStand(map, point),
  reset: () => { life = initialLifeState(); save(); },
  landmarks: () => map.landmarks,
} });
requestAnimationFrame(frame);
