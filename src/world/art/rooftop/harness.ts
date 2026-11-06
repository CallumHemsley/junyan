import {drawMap} from './index';
import {rooftopForGarden} from '../../maps/rooftop';
import {worldMapSchema} from '../../schema';
import {project, type Camera} from '../../camera';
import {initialState, reduce, plantIds, type State} from '../../../features/garden/rules';

if (import.meta.env.DEV && new URLSearchParams(location.search).get('test') === '1') {
  const canvas = document.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  let state = reduce(initialState(), {type: 'sync'}, 1);
  state = reduce(state, {type: 'tidy', value: true}, 1);
  let focus = {x: 24, y: 18}, close = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function render() {
    canvas.width = innerWidth; canvas.height = innerHeight;
    const camera: Camera = {focus, width: canvas.width, height: canvas.height, scale: close ? 24 : Math.min(canvas.width / 86, canvas.height / 52)};
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#9eafbc'); gradient.addColorStop(.65, '#c2d0ca'); gradient.addColorStop(1, '#e5dec3');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const map = worldMapSchema.parse(rooftopForGarden(state));
    for (const pass of ['ground', 'objects', 'foreground'] as const) drawMap(ctx, map, {
      project: (p, z) => project(p, camera, z), width: canvas.width, height: canvas.height,
      elapsedMs: 1200, reducedMotion: motion.matches, playerPosition: focus, pass,
    });
  }
  const mature = () => {
    const next = structuredClone(state);
    for (const id of plantIds) {next.plants[id].growth = 3; next.plants[id].care = 'ready'; next.plants[id].drooping = false; next.plants[id].result = null;}
    next.planterEarned = true; state = next; render();
  };
  const views = [
    ['全景', () => {focus = {x: 24, y: 18}; close = false; render();}],
    ['楼梯', () => {focus = {x: 10, y: 26}; close = true; render();}],
    ['花园', () => {focus = {x: 24, y: 20}; close = true; render();}],
    ['凉棚', () => {focus = {x: 35, y: 27}; close = true; render();}],
    ['远景', () => {focus = {x: 31, y: 8}; close = true; render();}],
    ['长成', mature],
    ['积水', () => {const next = structuredClone(state); next.plants.flower.care = 'extra'; next.plants.flower.drooping = true; state = next; render();}],
  ] as const;
  for (const [name, action] of views) {
    const button = document.createElement('button'); button.textContent = name; button.onclick = action; document.querySelector('nav')!.append(button);
  }
  Object.assign(window, {__ROOF_PREVIEW__: {
    view: (x: number, y: number, zoom = true) => {focus = {x, y}; close = zoom; render();},
    state: () => state, setState: (next: State) => {state = next; render();}, mature,
  }});
  addEventListener('resize', render); motion.addEventListener('change', render); render();
}
