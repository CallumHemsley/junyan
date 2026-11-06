import { drawFurniture, drawMap } from './index';
import { mapDefinitions } from '../../maps/residential';
import { worldMapSchema } from '../../schema';
import { project } from '../../camera';
import type { WorldRenderView } from '../../render-contract';
import { initialState, reduce } from '../../../features/apartment/rules';
import { characterFigure, createRenderer } from '../../../scene/renderer.js';

const params = new URLSearchParams(location.search);
const map = worldMapSchema.parse(mapDefinitions.find(map => map.id === params.get('map')) ?? mapDefinitions[2]);
const canvas = document.querySelector('canvas')!;
canvas.width = Math.round(innerWidth / 2);canvas.height = Math.round(innerHeight / 2);
const ctx = canvas.getContext('2d')!;
ctx.imageSmoothingEnabled = false;
ctx.fillStyle = '#283735';ctx.fillRect(0, 0, canvas.width, canvas.height);
const player = { x: Number(params.get('x') ?? map.defaultSpawn.x), y: Number(params.get('y') ?? map.defaultSpawn.y) };
const camera = { focus: player, width: canvas.width, height: canvas.height, scale: innerWidth < 600 ? 14 : 17 };
const view: WorldRenderView = { project: (point, z) => project(point, camera, z), playerPosition: player, elapsedMs: 0, reducedMotion: true, width: canvas.width, height: canvas.height, pass: 'ground' };
let home = reduce(initialState(), { type: 'accept-starter' }, 1);
for (const [id, x, y] of [['rug', 2, 1], ['table', 2, 1], ['chair', 4, 1], ['cushion', 3, 3]] as const) {
  home = reduce(home, { type: 'select', id }, 1);home = reduce(home, { type: 'place', x, y }, 1);
}
drawMap(ctx, map, view);
view.pass = 'objects';drawMap(ctx, map, view);
if (map.id === 'apartment') drawFurniture(ctx, home, view);
const actor = document.createElement('canvas');
const actorRenderer = createRenderer(actor, {
  bake(api) { api.pix.fill(0);api.zb.fill(-1e9);api.groundZ.fill(-1e9); },
  draw(api) { characterFigure(0, 0, Math.PI / 4, { scale: .9 }, { shirt: [245, 232, 202], hair: [54, 43, 34], legs: [63, 78, 74] }, api.dynamicAdd);api.shadeEdges(); },
});
actorRenderer.draw();
const at = view.project(player), ratio = camera.scale / (18 / Math.SQRT2);
ctx.drawImage(actor, 130, 80, 100, 80, at.x - 50 * ratio, at.y - 70 * ratio, 100 * ratio, 80 * ratio);
view.pass = 'foreground';drawMap(ctx, map, view);
canvas.dataset.ready = 'true';
