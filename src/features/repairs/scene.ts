import { characterFigure, type Scene, type SceneApi, type ScenePoint } from '../../scene/renderer.js';
import { content } from '../../content';
import { speakerFor } from './content';
import { currentBench, type Lamp, type State, type Toy } from './rules';

type Color = [number, number, number];
const wood: Color = [156, 111, 70], dark: Color = [92, 69, 48], cream: Color = [239, 220, 182];
const jade: Color = [111, 154, 134], metal: Color = [153, 159, 151], ink: Color = [58, 58, 52];
const warm: Color = [255, 212, 146];
function stroke(api: SceneApi, a: ScenePoint, b: ScenePoint, r: number, color: Color) {
  api.capsule(a, b, r, r, () => color, 'solid');
}
function lamp(api: SceneApi, state: Lamp, x: number, y: number, z: number, scale = 1, time = 0) {
  const { box, sphere } = api;
  const lit = state.power === 'on';
  if (lit) {
    const glow: Color = state.fitting === 'loose' ? [210 + Math.round(Math.sin(time * 1.2) * 4), 176, 117] : warm;
    box(x - .95 * scale, y - .6 * scale, z + .005, x + .95 * scale, y + .6 * scale, z + .018, glow);
  }
  box(x - .62 * scale, y - .4 * scale, z + .03, x + .62 * scale, y + .4 * scale, z + .2 * scale, jade);
  stroke(api, [x, y, z + .15 * scale], [x, y, z + 1.6 * scale], .1 * scale, dark);
  box(x - .4 * scale, y - .4 * scale, z + 1.5 * scale, x + .4 * scale, y + .4 * scale, z + 1.7 * scale, metal);
  for (let i = 0; i < (state.fitting === 'loose' ? 3 : 1); i++) {
    box(x - .23 * scale, y - .23 * scale, z + (1.7 + i * .09) * scale, x + .23 * scale, y + .23 * scale, z + (1.74 + i * .09) * scale, dark);
  }
  const bulbZ = z + (state.fitting === 'loose' ? 2.25 : 2.05) * scale;
  sphere(x, y, bulbZ, .48 * scale, lit ? warm : [224, 222, 199], 'solid');
  sphere(x - .12 * scale, y - .13 * scale, bulbZ + .18 * scale, .13 * scale, lit ? [255, 243, 204] : [249, 244, 222], 'solid');
  stroke(api, [x + .5 * scale, y, z + .1], [x + 1.05 * scale, y + .7 * scale, z + .03], .035, ink);
}
function toy(api: SceneApi, state: Toy, x: number, y: number, z: number, scale = 1, time = 0) {
  const { box, sphere } = api;
  const travel = state.test === 'moving' ? Math.sin(time * 1.2) * .22 : 0;
  x += travel;
  box(x - 1.25 * scale, y - .65 * scale, z + .25 * scale, x + 1.25 * scale, y + .65 * scale, z + .67 * scale, jade);
  box(x - 1.1 * scale, y - .5 * scale, z + .68 * scale, x + .6 * scale, y + .5 * scale, z + .73 * scale, dark);
  for (const dx of [-.8, .8]) for (const dy of [-.65, .65]) {
    const wx = x + dx * scale, wy = y + dy * scale, wz = z + .25 * scale;
    sphere(wx, wy, wz, .32 * scale, ink, 'solid');
    sphere(wx + .04, wy + .09, wz + .04, .14 * scale, cream, 'solid');
    const angle = state.test === 'moving' ? time * 2.5 : 0;
    stroke(api, [wx - Math.cos(angle) * .16 * scale, wy + .14, wz - Math.sin(angle) * .16 * scale], [wx + Math.cos(angle) * .16 * scale, wy + .14, wz + Math.sin(angle) * .16 * scale], .035, metal);
  }
  box(x + .55 * scale, y - .56 * scale, z + .65 * scale, x + 1.15 * scale, y + .56 * scale, z + 1.12 * scale, cream);
  box(x + .65 * scale, y + .565 * scale, z + .8 * scale, x + 1.08 * scale, y + .6 * scale, z + 1.04 * scale, [158, 175, 188]);
  box(x - .88 * scale, y - .3 * scale, z + .73 * scale, x - .22 * scale, y + .3 * scale, z + .95 * scale, state.cell === 'fresh' ? [211, 183, 111] : [181, 169, 139]);
  box(x - .83 * scale, y - .31 * scale, z + .96 * scale, x - .62 * scale, y + .31 * scale, z + 1.0 * scale, metal);
  box(x - .57 * scale, y - .27 * scale, z + 1.005 * scale, x - .29 * scale, y + .27 * scale, z + 1.025 * scale, state.cell === 'fresh' ? cream : dark);
  stroke(api, [x - .1 * scale, y - .3 * scale, z + .8 * scale], [x + .1 * scale, y + .1 * scale, z + 1.0 * scale], .055 * scale, dark);
  stroke(api, [x + .1 * scale, y + .1 * scale, z + 1.0 * scale], [x + (state.lead === 'loose' ? .05 : -.2) * scale, y + (state.lead === 'loose' ? .75 : .35) * scale, z + (state.lead === 'loose' ? 1.4 : 1.05) * scale], .08 * scale, metal);
  sphere(x - .2 * scale, y + .35 * scale, z + 1.05 * scale, .11 * scale, [219, 201, 153], 'solid');
  if (state.cover === 'closed') box(x - 1.14 * scale, y - .52 * scale, z + 1.02 * scale, x + .5 * scale, y + .52 * scale, z + 1.14 * scale, jade);
  else box(x - 1.1 * scale, y + 1.15 * scale, z + .03, x + .5 * scale, y + 2.05 * scale, z + .15 * scale, jade);
}
function stool(api: SceneApi, x: number, y: number) {
  for (const dx of [-.36, .36]) for (const dy of [-.28, .28]) api.box(x + dx - .07, y + dy - .07, 0, x + dx + .07, y + dy + .07, .85, dark);
  api.box(x - .52, y - .45, .85, x + .52, y + .45, 1, wood);
}
export const workshopScene: Scene<[State, number]> = {
  bake(api) {
    const { W, H, pix, zb, ground, groundZ, rgb, hash, unproject, box } = api;
    pix.fill(rgb(232, 223, 207));
    zb.fill(-1e9);
    for (let iy = 0; iy < H; iy++) for (let ix = 0; ix < W; ix++) {
      const g = unproject(ix + .5, iy + .5), i = iy * W + ix;
      if (Math.abs(g.x) > 6 || Math.abs(g.y) > 5) continue;
      const seam = (g.x + 6) % .95 < .035;
      const shade = Math.round((hash(ix, iy) - .5) * 7);
      pix[i] = seam ? rgb(167, 139, 104) : rgb(217 + shade, 191 + shade, 151 + shade);
      ground[i] = 1; zb[i] = (g.x + g.y) / api.R2 * api.COS;
    }
    groundZ.set(zb);
    box(-6.1, -5.2, -.2, 6.1, -5, 3.7, cream);
    box(-6.2, -5.2, -.2, -6, 5.1, 3.7, [222, 204, 170]);
    box(-6.15, -5.1, 3.65, 6.1, -4.9, 3.8, dark);
    box(-6.1, -5, 3.65, -5.9, 5, 3.8, dark);
    box(-5.98, -3.9, 1.2, -5.86, -.9, 3.25, dark);
    box(-5.84, -3.8, 1.35, -5.8, -1.02, 3.1, [158, 175, 188]);
    box(-5.78, -2.5, 1.3, -5.72, -2.4, 3.15, cream);
    box(-5.78, -3.85, 2.2, -5.72, -.95, 2.3, cream);
    box(-5.9, -4, 1.1, -5.4, -.8, 1.25, wood);
    for (const z of [1.1, 2.8]) {
      box(-3.5, -4.9, z, 5.1, -3.9, z + .15, wood);
      for (const x of [-3, 4.5]) box(x, -4.85, .15, x + .13, -4.05, 2.95, dark);
    }
    for (const x of [-2.5, -1.8, 3.6, 4.4]) {
      box(x, -4.75, 2.95, x + .45, -4.15, 3.42, x > 0 ? jade : metal);
      box(x - .02, -4.78, 3.42, x + .48, -4.12, 3.5, dark);
    }
    box(-.7, -4.9, 1.8, 2.8, -4.75, 2.65, [182, 153, 111]);
    for (const x of [-.3, .5, 1.3, 2.1]) {
      stroke(api, [x, -4.65, 2.35], [x, -4.65, 1.95], .055, metal);
      stroke(api, [x, -4.65, 1.95], [x + .12, -4.65, 1.8], .075, dark);
    }
    for (const x of [-2.8, 2.8]) for (const y of [-.8, 2.2]) box(x - .13, y - .13, .05, x + .13, y + .13, 1.5, dark);
    box(-3.15, -1.3, 1.5, 3.15, 2.65, 1.75, wood);
    box(-3.02, -1.17, 1.75, 3.02, 2.52, 1.8, [185, 145, 96]);
    box(-2.7, -1, 1.81, 2.7, 1.8, 1.84, [130, 151, 121]);
    stroke(api, [2.4, 1.9, 1.89], [1.5, 2.1, 1.89], .07, metal);
    stroke(api, [2.7, 1.8, 1.89], [2.35, 1.9, 1.89], .11, dark);
    box(-2.6, 1.8, 1.8, -1.5, 2.35, 1.95, dark);
    for (const x of [-2.4, -2.05, -1.7]) api.sphere(x, 2, 1.98, .1, metal, 'solid');
    stool(api, -4.7, 3.1);
  },
  draw(api, state, time) {
    const bench = currentBench(state);
    const member = content.characters.find(character => character.id === (speakerFor(state.feedback).id === 'lamp' ? 'lin-jie' : 'xiao-zhou'))!;
    characterFigure(-4.3, .4, .1, { scale: 1.15, armR: .45, armL: .25 }, member.appearance, api.dynamicAdd);
    if (state.completed.includes('lamp')) lamp(api, { kind: 'lamp', fitting: 'seated', power: 'on', test: 'steady' }, -.7, -4.35, 1.26, .65);
    if (state.completed.includes('toy')) toy(api, { kind: 'toy', cover: 'closed', lead: 'connected', cell: 'fresh', test: 'moving' }, 2.2, -4.35, 1.26, .55);
    if (state.completed.length === 2) stool(api, 4.5, 2.3);
    if (bench?.kind === 'lamp') lamp(api, bench, 0, .2, 1.85, 2.0, time);
    if (bench?.kind === 'toy') toy(api, bench, 0, .1, 1.85, 2.1, time);
    api.flushShadows();
    api.applyShadows(api.bakedZ);
    api.shadeEdges();
  },
};
