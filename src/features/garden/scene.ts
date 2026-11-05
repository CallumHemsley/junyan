import {characterFigure, type Scene, type SceneApi} from '../../scene/renderer.js';
import {content} from '../../content';
import {plantIds, weather, type State, type Site} from './rules';

export const sites: Record<Site, {x: number; y: number}> = {
  0: {x: -3.2, y: -.7}, 1: {x: -.3, y: -.7}, 2: {x: 2.6, y: -.7},
  3: {x: -3.2, y: 2.3}, 4: {x: -.3, y: 2.3}, 5: {x: 2.6, y: 2.3},
};
type Color = [number, number, number];
const wood: Color = [151, 119, 81], dark: Color = [87, 78, 58], jade: Color = [111, 154, 134];
const leaf: Color = [120, 147, 91], cream: Color = [239, 224, 190];
const lin = content.characters.find(character => character.id === 'lin-jie')!;

function bench(api: SceneApi) {
  const {box} = api;
  for (const x of [.2, 3.5]) for (const y of [-4.3, -3.5]) box(x, y, 0, x + .16, y + .16, .85, dark);
  for (let row = 0; row < 4; row++) box(-.1, -4.3 + row * .25, .84, 3.9, -4.1 + row * .25, .97, wood);
  for (const x of [.2, 3.5]) box(x, -4.45, .7, x + .14, -4.3, 1.9, dark);
  for (let row = 0; row < 3; row++) box(-.1, -4.48, 1.15 + row * .27, 3.9, -4.28, 1.34 + row * .27, wood);
}
export function gardenScene(): Scene<[state: State, time: number]> {
  return {
    bake(api) {
      const {W, H, pix, zb, ground, groundZ, rgb, hash, unproject, R2, COS, box, capsule} = api;
      zb.fill(-1e9);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const mist = Math.min(1, y / 200);
        pix[i] = rgb(192 + mist * 40, 208 + mist * 15, 206 - mist * 1);
        const g = unproject(x + .5, y + .5);
        if (Math.abs(g.x) > 6.1 || Math.abs(g.y) > 5.2) continue;
        const seam = (g.x + 6.1) % .95 < .035 || (g.y + 5.2) % .95 < .035;
        const n = (hash(x, y) - .5) * 7;
        const c = seam ? [176, 171, 147] : (Math.floor(g.x + 6.1) + Math.floor(g.y + 5.2)) % 2 ? [215, 211, 185] : [223, 217, 194];
        pix[i] = rgb(c[0] + n, c[1] + n, c[2] + n);
        ground[i] = 1; zb[i] = (g.x + g.y) / R2 * COS;
      }
      groundZ.set(zb);
      for (const [x, y, h, width] of [[-7, -7, 2.1, 2], [-3, -8, 3.3, 2.2], [1, -8, 2.7, 2.1], [5, -8, 4.1, 2.3], [-8, -3, 2.3, 1.5]]) {
        box(x, y, -1.4, x + width, y + 1.3, h, [166, 181, 177]);
        box(x - .1, y - .1, h, x + width + .1, y + 1.4, h + .15, [144, 161, 156]);
        for (let k = 0; k < 3; k++) box(x + .3 + k * .55, y + 1.31, .4, x + .55 + k * .55, y + 1.35, .9, [207, 213, 194]);
      }
      box(-6.2, -5.3, -.25, 6.2, -5.1, .6, [199, 193, 168]);
      box(-6.3, -5.3, -.25, -6.05, 5.3, .6, [199, 193, 168]);
      box(-6.3, -5.3, .6, -5.95, 5.3, .74, cream);
      box(-6.3, -5.4, .6, 6.3, -5.0, .74, cream);
      for (let x = -5.8; x < 6; x += 1.45) capsule([x, -5.2, .7], [x, -5.2, 1.6], .035, .035, () => dark, 'solid');
      capsule([-6, -5.2, 1.6], [6.1, -5.2, 1.6], .04, .04, () => dark, 'solid');
      box(-6.15, 5.2, -.25, 6.15, 5.35, .06, wood);
      box(6.05, -5.2, -.25, 6.22, 5.35, .06, wood);
      bench(api);
      box(-5.4, -4.6, 0, -3.2, -3.2, .18, dark);
      box(-5.35, -4.55, .18, -3.25, -3.25, .25, wood);
      box(-5.25, -4.45, .25, -3.35, -3.35, 1.65, [203, 198, 172]);
      for (let x = -5.1; x < -3.5; x += .22) box(x, -3.34, .65, x + .1, -3.30, 1.3, dark);
    },
    draw(api, state, time) {
      const {box, sphere, capsule, castShadow, applyShadows, groundZ, dynamicAdd, flushShadows, shadeEdges} = api;
      const sway = Math.sin(time * .9) * .035;
      if (!state.restored) for (const [x, y] of [[-2, 1], [1, 1], [3.4, 3.5]]) {
        box(x - .5, y - .4, 0, x + .5, y + .4, .75, wood);
        for (let z = .12; z < .7; z += .2) box(x - .51, y + .4, z, x + .51, y + .42, z + .035, dark);
        box(x - .07, y + .42, .02, x + .07, y + .44, .76, cream);
      }
      const shade = sites[state.shade];
      box(shade.x + .95, shade.y - .65, 0, shade.x + 1.04, shade.y + .65, .12, dark);
      for (const side of [-.7, .7]) capsule([shade.x + 1, shade.y + side, .1], [shade.x + 1, shade.y + side, 3.4], .05, .05, () => wood, 'solid');
      for (let slat = 0; slat < 5; slat++) box(shade.x - 1 + slat * .43, shade.y - .9, 3.35, shade.x - .78 + slat * .43, shade.y + .9, 3.43, slat % 2 ? cream : jade);
      castShadow(shade.x, shade.y, 3.4, 1.05, 1);
      for (const id of plantIds) {
        const pot = state.plants[id];
        const {x, y} = sites[pot.site];
        box(x - .46, y - .44, .04, x + .46, y + .44, .16, wood);
        box(x - .32, y - .31, .16, x + .32, y + .31, .68, [165, 133, 95]);
        box(x - .4, y - .39, .6, x + .4, y + .39, .76, [189, 156, 114]);
        box(x - .32, y - .31, .76, x + .32, y + .31, .79, pot.care === 'dry' ? [180, 158, 115] : [92, 83, 62]);
        if (pot.care === 'dry') capsule([x - .23, y, .8], [x + .2, y + .12, .8], .025, .02, () => dark, 'solid');
        if (pot.care === 'extra') box(x - .42, y - .41, .165, x + .42, y + .41, .205, [158, 175, 188]);
        const height = .6 + pot.growth * .34;
        const top = .8 + height * (pot.drooping ? .55 : 1);
        const lean = pot.drooping ? .4 : sway;
        capsule([x, y, .8], [x + lean, y, top], .065, .045, () => dark, 'solid');
        if (id === 'climber') {
          for (const side of [-.52, .52]) capsule([x + side, y - .32, .5], [x + side, y - .32, 2.9], .035, .035, () => wood, 'solid');
          for (let z = 1; z < 2.9; z += .45) capsule([x - .52, y - .32, z], [x + .52, y - .32, z], .03, .03, () => wood, 'solid');
        }
        for (let k = 0; k < 4 + pot.growth * 3; k++) {
          const a = k * 2.4;
          const z = .95 + (k % (3 + pot.growth)) * height / (3 + pot.growth);
          const length = id === 'tree' ? .38 + pot.growth * .08 : .3;
          const end: [number, number, number] = [x + Math.cos(a) * length + lean, y + Math.sin(a) * length, pot.drooping ? z - .25 : z + .12];
          capsule([x, y, z], end, .06, .09, () => k % 2 ? leaf : jade, 'solid');
          sphere(...end, id === 'tree' ? .22 : .12, k % 2 ? leaf : jade, 'solid');
        }
        if (id === 'flower' && pot.growth > 0) for (let k = 0; k < pot.growth + 1; k++) {
          const a = k * 2.1, fx = x + Math.cos(a) * .3 + lean, fy = y + Math.sin(a) * .3;
          for (let p = 0; p < 5; p++) sphere(fx + Math.cos(p * 1.26) * .12, fy + Math.sin(p * 1.26) * .12, top + .07, .115, k % 2 ? [184, 175, 203] : cream, 'solid');
          sphere(fx, fy, top + .15, .075, [211, 180, 99], 'solid');
        }
        if (id === 'tree' && pot.growth >= 2) for (let crown = 0; crown < 5; crown++) {
          const a = crown * 1.26;
          sphere(x + Math.cos(a) * .32 + lean, y + Math.sin(a) * .32, top - .12 + (crown % 2) * .18, .29 + pot.growth * .025, crown % 2 ? leaf : jade, 'solid');
        }
        if (id === 'tree' && pot.growth === 3) {
          sphere(x + .45, y, top + .21, .15, [192, 179, 138], 'solid');
          sphere(x + .57, y, top + .33, .1, dark, 'solid');
          capsule([x + .4, y, top + .2], [x + .15, y + .1, top + .3 + sway], .1, .025, () => dark, 'solid');
          sphere(x + .67, y, top + .32, .045, [211, 180, 99], 'solid');
        }
        castShadow(x, y, .3, .55);
      }
      const seated = state.planterEarned;
      characterFigure(seated ? 1.8 : 4.6, seated ? -3.7 : -2.7, Math.PI / 2,
        {scale: .92, crouch: seated ? 1 : 0, z: seated ? .15 : 0, armL: .35, armR: .4, lean: sway}, lin.appearance, dynamicAdd);
      flushShadows(); applyShadows(groundZ); shadeEdges();
      if (weather(state.day) === 'rain') for (let i = 0; i < 27; i++) {
        const x = ((i * 2.71 + time * .23) % 11) - 5.5, y = ((i * 1.13) % 9) - 4.5;
        const z = ((i * .31 - time * 3) % 3.5 + 3.5) % 3.5 + .4;
        capsule([x, y, z], [x - .05, y, z + .24], .012, .012, () => [168, 187, 193], 'solid');
      }
    },
  };
}
