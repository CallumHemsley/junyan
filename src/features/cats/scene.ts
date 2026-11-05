import { characterFigure, type Scene, type SceneApi, type ScenePoint } from '../../scene/renderer.js';
import { sceneFacts, type State } from './rules';

type Color = [number, number, number];
export const landmarks = {
  bicycle: { x: 2.8, y: 6.3 }, bench: { x: 9.2, y: 4.4 },
  door: { x: 3.2, y: 1.5 }, window: { x: 8.8, y: 1.5 },
};
export function whitePosition(state: State, day: number) {
  const where = sceneFacts(state, day).white;
  return where === 'door' ? { x: 3.6, y: 2.5 } : where === 'window' ? { x: 8.4, y: 2.3 }
    : where === 'path' ? { x: 4.6, y: 4.3 } : where === 'open' ? { x: 3.4, y: 7.2 } : { x: 2.8, y: 6.3 };
}
const wood: Color = [143, 109, 77], dark: Color = [72, 65, 57], brick: Color = [191, 159, 128];
const jade: Color = [111, 145, 119], cream: Color = [236, 223, 198];
function bicycle(api: SceneApi, x: number, y: number) {
  const { capsule, sphere } = api;
  const tube = (a: ScenePoint, b: ScenePoint, color: Color = [91, 116, 116], r = .047) => capsule(a, b, r, r, () => color, 'solid');
  for (const cx of [x - .94, x + .94]) {
    for (let n = 0; n < 32; n++) {
      const a = n / 32 * Math.PI * 2, b = (n + 1) / 32 * Math.PI * 2;
      tube([cx + Math.cos(a) * .73, y, .8 + Math.sin(a) * .73], [cx + Math.cos(b) * .73, y, .8 + Math.sin(b) * .73], dark, .055);
      if (n % 4 === 0) tube([cx, y, .8], [cx + Math.cos(a) * .68, y, .8 + Math.sin(a) * .68], [190, 185, 168], .017);
    }
    sphere(cx, y, .8, .09, dark, 'solid');
  }
  const rear: ScenePoint = [x - .94, y, .8], crank: ScenePoint = [x, y, .55];
  const seat: ScenePoint = [x - .3, y, 1.62], front: ScenePoint = [x + .7, y, 1.62];
  for (const [a, b] of [[rear, crank], [rear, seat], [seat, crank], [seat, front], [front, crank], [front, [x + .94, y, .8]]] as [ScenePoint, ScenePoint][]) tube(a, b);
  tube(seat, [x - .36, y, 1.89]);
  tube([x - .66, y, 1.88], [x - .1, y, 1.88], dark, .09);
  tube(front, [x + .65, y, 2.03]);
  tube([x + .65, y - .26, 2.03], [x + .65, y + .26, 2.03], dark, .055);
  tube(crank, [x + .15, y + .23, .38], dark);
  tube([x + .02, y + .23, .38], [x + .29, y + .23, .38], dark);
}
function cat(api: SceneApi, x: number, y: number, black: boolean, relaxed: boolean, t: number) {
  const { capsule, sphere, castShadow } = api;
  const fur: Color = black ? [57, 59, 60] : [236, 231, 215];
  const shade: Color = black ? [76, 79, 78] : [212, 207, 192];
  const bone = (a: ScenePoint, b: ScenePoint, r: number, r1 = r, c = fur) => capsule(a, b, r, r1, () => c, 'solid');
  const z = relaxed ? .44 : .3;
  castShadow(x, y, 0, .64, .25);
  bone([x - .35, y, z], [x + .28, y, z], .33, .29);
  const lift = relaxed ? .19 : 0;
  sphere(x + .49, y - .02, .55 + lift, .29, fur, 'solid');
  for (const side of [-1, 1]) {
    bone([x + .39, y + side * .18, .72 + lift], [x + .42, y + side * .2, 1.02 + lift], .13, .015, side === -1 && !black ? shade : fur);
    bone([x + .1, y + side * .21, .25], [x + .38, y + side * .22, .12], .105, .09);
    sphere(x + .68, y + side * .13, .59 + lift, .033, black ? [214, 191, 121] : [91, 116, 107], 'solid');
    bone([x + .69, y + side * .03, .46 + lift], [x + .86, y + side * .24, .46 + lift], .012, .006, shade);
  }
  sphere(x + .73, y, .47 + lift, .035, [173, 136, 127], 'solid');
  if (black) {
    bone([x + .35, y - .03, .52], [x + .29, y - .02, .29], .12, .07, [197, 193, 174]);
    bone([x - .56, y, .43], [x - .72, y + .11, 1.06 + Math.sin(t * 1.4) * .035], .095, .065);
    bone([x - .72, y + .11, 1.06], [x - .55, y + .13, 1.24], .065, .035);
  } else {
    bone([x - .55, y, .3], [x - .67, y + .35, .23], .11, .09);
    bone([x - .67, y + .35, .23], [x - .22, y + .4, .2], .09, .055, shade);
  }
}
export function visualPose(state: State, day: number) {
  const white = whitePosition(state, day);
  const blackFriend = state.selected === 'black' && state.cats.black.satTogether;
  const whiteFriend = state.selected === 'white' && state.cats.white.rested;
  const following = state.story.node === 'doorway' || state.story.node === 'reunited' || state.repeat.status === 'active' && state.repeat.encounter.kind === 'route' && state.repeat.encounter.step === 'invite';
  const player = blackFriend ? { x: 8.15, y: 6.1 }
    : whiteFriend ? { x: white.x + 1.6, y: white.y - .8 }
    : following ? { x: white.x + 1.65, y: white.y - .85 }
    : state.feedback === 'space' ? { x: 5.1, y: 8.3 }
    : state.story.node === 'crouched' ? { x: 4.5, y: 5.5 } : { x: white.x + 1.8, y: white.y - .8 };
  return { white, player, sitting: blackFriend || whiteFriend || state.story.node === 'crouched' };
}
export type VisualPose = ReturnType<typeof visualPose>;
export const courtyardScene: Scene<[State, number, number, VisualPose]> = {
  bake(api) {
    const { W, H, pix, zb, ground, groundZ, rgb, unproject, hash, box, capsule, sphere, castShadow, R2, COS } = api;
    pix.fill(rgb(226, 219, 202)); zb.fill(-1e9);
    for (let sy = 0; sy < H; sy++) for (let sx = 0; sx < W; sx++) {
      const p = unproject(sx + .5, sy + .5), i = sy * W + sx;
      if (Math.abs(p.x) > 5.7 || Math.abs(p.y) > 4.8) continue;
      const seam = (p.x + 6) % 1 < .035 || (p.y + 5) % 1 < .035;
      const fleck = (hash(sx, sy) - .5) * 8;
      const color = seam ? [179, 167, 145] : [213 + fleck, 202 + fleck, 178 + fleck];
      pix[i] = rgb(...color as Color); ground[i] = 1; zb[i] = (p.x + p.y) / R2 * COS;
    }
    groundZ.set(zb);
    box(-5.8, -4.9, -.3, 5.8, -4.55, 3.45, brick);
    box(-5.8, -4.9, 3.45, 5.8, -4.48, 3.65, cream);
    for (let z = .3; z < 3.4; z += .45) for (let x = -5.6; x < 5.6; x += .9) {
      box(x + (Math.round(z * 2) % 2) * .35, -4.53, z, x + .02 + (Math.round(z * 2) % 2) * .35, -4.5, z + .39, [168, 139, 112]);
    }
    box(-3.9, -4.53, 0, -1.8, -4.25, 2.75, [109, 89, 68]);
    box(-3.7, -4.22, .1, -2, -4.17, 2.58, [146, 117, 82]);
    box(-3.8, -4.22, 0, -1.9, -3.3, .17, [172, 159, 137]);
    box(-4.15, -4.6, 2.8, -1.5, -3.18, 2.97, [105, 129, 119]);
    sphere(-2.22, -4.1, 1.35, .07, [199, 176, 114], 'solid');
    box(1.65, -4.51, 1.15, 4.1, -4.28, 2.8, wood);
    box(1.82, -4.24, 1.32, 3.94, -4.2, 2.65, [137, 161, 169]);
    box(2.8, -4.16, 1.32, 2.92, -4.1, 2.65, cream);
    box(1.8, -4.16, 1.94, 3.95, -4.1, 2.05, cream);
    box(1.5, -4.6, 1.07, 4.3, -3.92, 1.2, wood);
    for (const dx of [-.9, .9]) for (const dy of [-.28, .28]) box(3.2 + dx, -.6 + dy, 0, 3.3 + dx, -.5 + dy, .74, dark);
    for (let k = 0; k < 3; k++) box(1.95, -.98 + k * .24, .73, 4.5, -.8 + k * .24, .89, wood);
    for (const dx of [2.12, 4.22]) box(dx, -.97, .7, dx + .11, -.86, 1.65, dark);
    for (const z of [1.05, 1.42]) box(1.95, -.99, z, 4.5, -.81, z + .19, wood);
    castShadow(3.2, -.6, .1, 1.2, .3);
    bicycle(api, -3.2, 1.3);
    for (const [x, y] of [[-5, -3.7], [4.9, -3.5], [4.9, 3.5]]) {
      box(x - .36, y - .35, 0, x + .36, y + .35, .57, [163, 129, 97]);
      box(x - .42, y - .4, .48, x + .42, y + .4, .62, [182, 144, 106]);
      for (let k = 0; k < 8; k++) {
        const a = k * 2.4;
        capsule([x, y, .6], [x + Math.cos(a) * .44, y + Math.sin(a) * .44, .95 + k % 3 * .18], .1, .055, () => jade, 'solid');
      }
    }
    box(-5.8, 4.7, -.15, 5.8, 4.9, .02, wood);
    box(5.7, -4.8, -.15, 5.9, 4.9, .02, wood);
  },
  draw(api, state, day, time, pose) {
    const facts = sceneFacts(state, day), white = pose.white;
    cat(api, white.x - 6, white.y - 5, false, facts.close || state.cats.white.calm, time);
    cat(api, 3.35, .42, true, state.cats.black.greeted, time);
    characterFigure(pose.player.x - 6, pose.player.y - 5, state.selected === 'black' ? -.4 : -2.5, { crouch: pose.sitting ? 1 : 0, scale: .83 },
      { shirt: [232, 220, 190], hair: [61, 49, 40], legs: [79, 91, 83] }, api.dynamicAdd);
    characterFigure(-2.2, -2.4, 1.1, { scale: .83, greeting: state.story.node === 'reunited', armR: .4 },
      { shirt: [145, 151, 132], hair: [82, 70, 59], accessory: 'aunt' }, api.dynamicAdd);
    api.flushShadows(); api.applyShadows(api.bakedZ); api.shadeEdges();
    if (facts.routine === 'rainy') {
      for (let k = 0; k < 50; k++) {
        const x = (k * 71) % api.W, y = ((k * 37 + time * 70) % (api.H - 80)) + 60;
        const floor = api.unproject(x, y);
        if (floor.y < -2.9 || Math.abs(floor.x) > 5.4 || floor.y > 4.6) continue;
        for (let drop = 0; drop < 3; drop++) {
          const i = (Math.floor(y) - drop) * api.W + x + (drop === 2 ? 1 : 0);
          if (i >= 0 && i < api.pix.length) api.pix[i] = api.rgb(143, 168, 180);
        }
      }
    }
  },
};
