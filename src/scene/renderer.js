/*
Adapted from Pixel Plays engine.js — https://github.com/amirmushichge/pixel-plays
MIT License

Copyright (c) 2026 Amir Mushich

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
export const WIDTH = 360, HEIGHT = 280;
const S = 18, SIN = .5, COS = Math.sqrt(3) / 2, R2 = Math.SQRT2;
const OX = WIDTH / 2, OY = 150;
export function projectPosition(position, z = 0) {
  const x = position.x - 6, y = position.y - 5;
  return {left: (OX + (x-y)/R2*S)/WIDTH*100,
    top: (OY + ((x+y)/R2*SIN-z*COS)*S)/HEIGHT*100};
}
export function groundPosition(left, top) {
  const u = (left/100*WIDTH-OX)/S, v = (top/100*HEIGHT-OY)/(S*SIN);
  return {x: Math.max(0, Math.min(12, (u+v)/R2+6)),
    y: Math.max(0, Math.min(10, (v-u)/R2+5))};
}
export function createRenderer(canvas, tables, appearances = {}) {
const W = WIDTH, H = HEIGHT, SHADOW_X = .7, SHADOW_Y = .3;
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Restaurant scene requires a 2D canvas');
const image = ctx.createImageData(W, H);
const pix = new Uint32Array(image.data.buffer);
const zb = new Float32Array(W * H);
const bakedPix = new Uint32Array(W * H);
const bakedZ = new Float32Array(W * H);
const ground = new Uint8Array(W * H);
const shadowMask = new Uint8Array(W * H);
const groundZ = new Float32Array(W * H);
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
const COOL = [46, 38, 84], WARM = [255, 232, 180];
const SHOE = [226, 222, 212], BARK = [92, 74, 60];
const GRASS = [[34, 62, 50], [52, 88, 52], [82, 118, 54], [124, 146, 62], [168, 172, 76]];
const GRADIENT_Y = COS / (S * SIN), EDGE = .28;

const rgb = (r, g, b) => (255 << 24 | Math.min(255, b | 0) << 16 | Math.min(255, g | 0) << 8 | Math.min(255, r | 0)) >>> 0;
// hue-shifted ramp: shadows drift to violet, lights drift to warm yellow
const ramps = new WeakMap();
function rampOf(c) {
  let ramp = ramps.get(c);
  if (ramp) return ramp;
  const mix = (m, tint, k) => rgb(lerp(c[0] * m, tint[0], k), lerp(c[1] * m, tint[1], k), lerp(c[2] * m, tint[2], k));
  ramp = [mix(.4, COOL, .34), mix(.62, COOL, .18), mix(.84, COOL, .05), mix(1, WARM, 0), mix(1.1, WARM, .22)];
  ramps.set(c, ramp);
  return ramp;
}
const bayerAt = (ix, iy) => BAYER[(iy & 3) * 4 + (ix & 3)];
function tint(i, r, g, b) {
  const c = pix[i];
  pix[i] = rgb((c & 255) * r, (c >> 8 & 255) * g, (c >> 16 & 255) * b);
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = ease(x - ix), fy = ease(y - iy);
  return lerp(lerp(hash(ix, iy), hash(ix + 1, iy), fx), lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), fx), fy);
}
function project(x, y, z) {
  const u = (x - y) / R2, v = (x + y) / R2;
  return { sx: OX + u * S, sy: OY + (v * SIN - z * COS) * S, d: v * COS + z * SIN };
}
function unproject(sx, sy) {
  const u = (sx - OX) / S, v = (sy - OY) / (S * SIN);
  return { x: (u + v) / R2, y: (v - u) / R2 };
}

let capture = null; // when set, sphere() records pixels instead of drawing them
function sphere(x, y, z, r, c, mode) {
  const ramp = rampOf(c);
  const p = project(x, y, z), rp = Math.max(r * S, .75);
  const y0 = Math.max(0, Math.floor(p.sy - rp)), y1 = Math.min(H - 1, Math.ceil(p.sy + rp));
  const x0 = Math.max(0, Math.floor(p.sx - rp)), x1 = Math.min(W - 1, Math.ceil(p.sx + rp));
  for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
    const dx = (ix + .5 - p.sx) / rp, dy = (iy + .5 - p.sy) / rp, nn = dx * dx + dy * dy;
    if (nn > 1) continue;
    const nz = Math.sqrt(1 - nn), d = p.d + r * nz, i = iy * W + ix;
    if (d <= zb[i]) continue;
    let l = clamp(-.55 * dx - .6 * dy + .58 * nz, 0, 1);
    if (mode === 'rough') l += (hash(ix, iy) - .5) * .55;
    if (dy > .35) l = Math.max(l, .12 + dy * .24); // warm light bouncing off the ground
    if (capture) {
      capture.push(ix, iy, d, ramp[clamp(Math.floor(l * 4.4 + .2 + (bayerAt(ix, iy) - .5) * .7), 0, 4)]);
      continue;
    }
    zb[i] = d;
    if (mode === 'gloss' && l > .9) { pix[i] = rgb(255, 250, 232); continue; }
    // figures get flat bands with no dither, so they read as sharp shapes against the textured ground
    if (mode === 'solid') { pix[i] = ramp[clamp(Math.floor(l * 4.4 + .2), 1, 4)]; continue; }
    pix[i] = ramp[clamp(Math.floor(l * 4.4 + .2 + (bayerAt(ix, iy) - .5) * .7), 0, 4)];
  }
}
function capsule(a, b, r0, r1, colorOf, mode) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const n = Math.max(1, Math.ceil(len / (Math.min(r0, r1) * .45)));
  for (let k = 0; k <= n; k++) {
    const t = k / n, z = lerp(a[2], b[2], t);
    sphere(lerp(a[0], b[0], t), lerp(a[1], b[1], t), z, lerp(r0, r1, t), colorOf(z), mode);
  }
}
function box(x0, y0, z0, x1, y1, z1, c, seed = 0) {
  const ramp = rampOf(c);
  const paint = (x, y, z, base, grain) => {
    const p = project(x, y, z), ix = p.sx | 0, iy = p.sy | 0;
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) return;
    const i = iy * W + ix;
    if (p.d <= zb[i]) return;
    zb[i] = p.d;
    pix[i] = ramp[clamp(Math.floor(base + (grain - .5) * 1.3 + (bayerAt(ix, iy) - .5) * .5), 0, 4)];
  };
  const step = .045, longX = x1 - x0 >= y1 - y0;
  for (let a = x0; a <= x1; a += step) for (let b = y0; b <= y1; b += step) {
    paint(a, b, z1, 3.4, longX ? noise(a * .8 + seed, b * 9) : noise(a * 9, b * .8 + seed));
  }
  for (let a = x0; a <= x1; a += step) for (let b = z0; b <= z1; b += step) paint(a, y1, b, 2.3, noise(a * .8 + seed, b * 9));
  for (let a = y0; a <= y1; a += step) for (let b = z0; b <= z1; b += step) paint(x1, a, b, 1.2, noise(a * .8 + seed, b * 9));
}
function castShadow(x, y, z, r, strength = 1, dither = .4) {
  const p = project(x + SHADOW_X * z, y + SHADOW_Y * z, 0);
  const rx = r * S * 1.05, ry = rx * SIN + 1;
  const y0 = Math.max(0, Math.floor(p.sy - ry)), y1 = Math.min(H - 1, Math.ceil(p.sy + ry));
  const x0 = Math.max(0, Math.floor(p.sx - rx)), x1 = Math.min(W - 1, Math.ceil(p.sx + rx));
  for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
    const dx = (ix + .5 - p.sx) / rx, dy = (iy + .5 - p.sy) / ry;
    if (dx * dx + dy * dy + (bayerAt(ix, iy) - .5) * dither > 1) continue;
    const i = iy * W + ix;
    if (shadowMask[i] < strength) shadowMask[i] = strength;
  }
}
function applyShadows(refZ) {
  for (let i = 0; i < pix.length; i++) {
    const s = shadowMask[i];
    if (!s) continue;
    shadowMask[i] = 0;
    if (!ground[i] || zb[i] !== refZ[i]) continue;
    if (s === 1) tint(i, .54, .52, .72);
    else tint(i, .36, .34, .56);
  }
}
// pixel-art edges from the depth buffer. The ground is never touched, so nothing halos around a figure:
// an object darkens its own silhouette against the ground, and gets a warm rim only over another object
function shadeEdges() {
  for (let iy = 1; iy < H - 1; iy++) for (let ix = 1; ix < W - 1; ix++) {
    const i = iy * W + ix, d = zb[i];
    if (d < -1e8 || d === groundZ[i]) continue;
    const a = i - W, b = i + W, c = i - 1, e = i + 1;
    if (zb[a] === groundZ[a] || zb[b] === groundZ[b] || zb[c] === groundZ[c] || zb[e] === groundZ[e]) {
      tint(i, .68, .66, .76);
    } else if (d - zb[a] - GRADIENT_Y > EDGE || d - zb[c] > EDGE) {
      const p = pix[i];
      pix[i] = rgb(lerp(p & 255, WARM[0], .3), lerp(p >> 8 & 255, WARM[1], .3), lerp(p >> 16 & 255, WARM[2], .22));
    } else if (zb[e] - d > EDGE || zb[b] - GRADIENT_Y - d > EDGE) {
      tint(i, .74, .72, .82);
    }
  }
}

function figure(px, py, yaw, pose, palette, addBone) {
  const fx = Math.cos(yaw), fy = Math.sin(yaw), sx = -fy, sy = fx, base = pose.z || 0, k = pose.scale || 1;
  const P = (a, b, c) => [px + (fx * a + sx * b) * k, py + (fy * a + sy * b) * k, c * k + base];
  const add = (a, b, r0, r1, f) => addBone(a, b, r0 * k, r1 * k, f);
  const t = palette;
  const shirt = z => (Math.floor(z * 3.2) % 2 ? t.shirt : t.stripe); // about 3px bands: thinner ones read as noise
  const legs = () => t.legs, skin = () => t.skin;
  const crouch = pose.crouch || 0, lean = pose.lean || 0;
  const hipZ = 1.28 - crouch * .4;
  const hipA = -crouch * .15;
  const shA = hipA + Math.sin(lean) * .95, shZ = hipZ + Math.cos(lean) * .95;
  const neck = P(shA, 0, shZ + .08), head = P(shA + Math.sin(lean) * .32, 0, shZ + .36);
  const stance = pose.stance == null ? .2 : pose.stance;
  const footB = P(-stance * 1.2, .2, .12), footF = P(stance * 2, -.2, .12);
  const kneeB = P(-stance * .4 + crouch * .12, .22, .68 - crouch * .1);
  const kneeF = P(stance * 1.2 + crouch * .34, -.22, .72 - crouch * .08);
  const hipB = P(hipA, .15, hipZ), hipF = P(hipA, -.15, hipZ);
  add(hipB, kneeB, .17, .13, legs); add(kneeB, footB, .13, .1, legs);
  add(hipF, kneeF, .17, .13, legs); add(kneeF, footF, .13, .1, legs);
  add(footB, P(-stance * 1.2 + .16, .2, .08), .1, .09, () => SHOE);
  add(footF, P(stance * 2 + .16, -.2, .08), .1, .09, () => SHOE);
  add(P(hipA, 0, hipZ), neck, .3, .32, shirt);
  add(neck, head, .11, .12, skin);
  sphere2(add, head, .24, t.skin);
  sphere2(add, [head[0] - fx * .06, head[1] - fy * .06, head[2] + .08], .205, t.hair);
  if (t.accessory === 'bun') sphere2(add, [head[0]-fx*.18,head[1]-fy*.18,head[2]+.18], .14, t.hair);
  if (t.accessory === 'glasses') {
    for (const side of [-1,1]) sphere2(add,[head[0]+fx*.22+sx*side*.1,head[1]+fy*.22+sy*side*.1,head[2]+.02],.065,darkWood);
  }
  if (t.accessory === 'tie') add(P(shA+.3,0,shZ-.1),P(shA+.3,0,shZ-.55),.055,.035,()=>darkWood);
  if (t.accessory === 'backpack') add(P(hipA-.28,0,hipZ+.2),P(shA-.3,0,shZ-.1),.29,.26,()=>jade);
  const shR = P(shA, .36, shZ - .03), shL = P(shA, -.36, shZ - .03);
  const armR = pose.armR == null ? 0 : pose.armR, armL = pose.armL == null ? .08 : pose.armL;
  const elbowR = P(shA + Math.sin(armR) * .46, .4, shZ - .03 - Math.cos(armR) * .46);
  const handR = P(shA + Math.sin(armR + .18) * .95, .42, shZ - .03 - Math.cos(armR + .18) * .95);
  const elbowL = P(shA + Math.sin(armL) * .46, -.42, shZ - .03 - Math.cos(armL) * .46);
  const handL = P(shA + Math.sin(armL + .2) * .9, -.43, shZ - .03 - Math.cos(armL + .2) * .9);
  add(shR, elbowR, .12, .1, shirt); add(elbowR, handR, .09, .08, skin);
  add(shL, elbowL, .12, .1, shirt); add(elbowL, handL, .09, .08, skin);
  return handR;
}
function sphere2(add, c, r, color) { add(c, c, r, r, () => color); }
const dynamicAdd = (a, b, r0, r1, f) => { capsule(a, b, r0, r1, f, 'solid'); pendingShadows.push(a, r0, b, r1); };
const pendingShadows = [];
function flushShadows() {
  for (let i = 0; i < pendingShadows.length; i += 4) {
    const a = pendingShadows[i], ra = pendingShadows[i + 1], c = pendingShadows[i + 2];
    const n = Math.max(1, Math.ceil(Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]) / .25));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      castShadow(lerp(a[0], c[0], t), lerp(a[1], c[1], t), lerp(a[2], c[2], t), ra * .9, 1, 0);
    }
    if (a[2] < .25) castShadow(a[0], a[1], 0, .2, 2, 0); // contact under the feet
  }
}

// Scene palette follows Morning Steam: dough, tea wood, jade and a cool window.
const wood = [156, 111, 70], darkWood = [92, 69, 48], cream = [239, 220, 182];
const jade = [111, 154, 134], cool = [158, 175, 188], steam = [255, 250, 240];
const waiter = {shirt:[245,232,202], stripe:[245,232,202], legs:[63,78,74], hair:[54,43,34], skin:[228,177,132]};
function bowl(x,y,z,filled = true) {
  sphere(x,y,z,.28,jade,'solid');
  sphere(x-.035,y-.035,z+.13,.22,filled ? cream : [218,223,209],'solid');
}
function plant(x,y) {
  box(x-.28,y-.28,0,x+.28,y+.28,.55,[174,131,91]);
  for (let k=0;k<9;k++) {
    const a=k*2.4;
    capsule([x,y,.5],[x+Math.cos(a)*.43,y+Math.sin(a)*.43,.85+(k%3)*.19],.12,.07,()=>jade,'solid');
  }
}
function stool(x,y) {
  for (const dx of [-.23,.23]) box(x+dx-.06,y-.12,0,x+dx+.06,y+.12,.65,darkWood);
  box(x-.4,y-.35,.6,x+.4,y+.35,.76,wood);
}
function bake() {
  pix.fill(rgb(232,223,207)); zb.fill(-1e9);
  for (let iy=0;iy<H;iy++) for(let ix=0;ix<W;ix++) {
    const g=unproject(ix+.5,iy+.5), i=iy*W+ix;
    if (Math.abs(g.x)>6.65 || Math.abs(g.y)>5.65) continue;
    const gx=g.x+6.65, gy=g.y+5.65;
    const seam=gx%1.05<.045 || gy%1.05<.045;
    const tile=(Math.floor(gx/1.05)+Math.floor(gy/1.05))%2;
    const c=seam ? [175,159,133] : tile ? [221,204,170] : [232,216,183];
    const fleck=(hash(ix,iy)-.5)*7;
    pix[i]=rgb(c[0]+fleck,c[1]+fleck,c[2]+fleck);
    ground[i]=1; zb[i]=(g.x+g.y)/R2*COS;
  }
  groundZ.set(zb);
  // Two tall back walls; front walls are cut down to reveal the room.
  box(-6.7,-5.8,-.4,6.7,-5.55,3.2,cream);
  box(-6.8,-5.8,-.4,-6.55,5.65,3.2,[222,204,170]);
  box(-6.8,-5.8,3.2,6.7,-5.5,3.38,darkWood);
  box(-6.8,-5.8,3.2,-6.5,5.65,3.38,darkWood);
  box(-6.7,5.6,-.4,6.7,5.8,.06,wood);
  box(6.6,-5.8,-.4,6.8,5.8,.06,wood);
  // Window panes and deep wooden sills on the left wall.
  for (const y of [-3.6,.4,3.6]) {
    box(-6.5,y-.9,1.2,-6.40,y+.9,2.85,darkWood);
    box(-6.38,y-.79,1.34,-6.30,y+.79,2.73,cool);
    box(-6.29,y-.04,1.3,-6.24,y+.04,2.77,cream);
    box(-6.29,y-.82,2.04,-6.24,y+.82,2.13,cream);
    box(-6.5,y-1,1.15,-6.03,y+1,1.3,wood);
  }
  // Jade-tiled kitchen, warm wooden worktop, stacked bamboo steamers.
  box(-3.9,-5.4,0,4.9,-3.75,1.25,jade);
  for(let x=-3.8;x<4.9;x+=.7) box(x,-3.77,.12,x+.035,-3.73,1.22,cream);
  box(-4,-5.5,1.25,5,-3.65,1.44,wood);
  for (const x of [-2.8,-1.3]) {
    for(let k=0;k<3;k++) {
      box(x-.49,-4.8,1.45+k*.2,x+.49,-3.9,1.61+k*.2,[197,164,107]);
      box(x-.51,-4.82,1.6+k*.2,x+.51,-3.88,1.65+k*.2,cream);
    }
    for(let b=0;b<3;b++) sphere(x-.27+b*.27,-4.35,2.1,.17,cream,'solid');
  }
  for(const x of [.2,1.1,2]) bowl(x,-4.25,1.6);
  box(3.1,-4.9,1.44,4.4,-4,1.56,darkWood);
  for(let k=0;k<4;k++) capsule([3.3+k*.24,-4.65,1.68],[3.3+k*.24,-4.17,1.68],.1,.1,()=>[220,174,90],'solid');
  // Wall shelf and jars; lamp stem and cream shade.
  box(-3.8,-5.45,2.62,4.7,-5.0,2.76,wood);
  for(const x of [-3,-2.4,2.8,3.5,4.2]) {
    box(x-.16,-5.3,2.76,x+.16,-5.03,3.05,jade);
    box(x-.18,-5.32,3.05,x+.18,-5.01,3.1,cream);
  }
  capsule([.8,-2.6,3.8],[.8,-2.6,3.12],.035,.035,()=>darkWood,'solid');
  sphere(.8,-2.6,3.05,.48,[255,212,146],'solid');
  box(.3,-3.1,2.98,1.3,-2.1,3.06,cream);
  plant(-5.6,4.7); plant(5.7,-4.6); plant(-5.65,-4.8);
  for(const t of tables) {
    const x=t.x-6,y=t.y-5;
    for(const dx of [-.65,.65]) for(const dy of [-.5,.5]) box(x+dx-.09,y+dy-.09,0,x+dx+.09,y+dy+.09,1.05,darkWood);
    box(x-.98,y-.8,1.05,x+.98,y+.8,1.22,wood,t.table*9);
    box(x-.94,y-.76,1.22,x+.94,y+.76,1.27,[187,143,91]);
    stool(x,y-1.2); stool(x,y+1.2);
    box(x+.55,y-.53,1.27,x+.77,y-.3,1.52,cream);
    capsule([x+.67,y-.41,1.5],[x+.72,y-.45,1.85],.025,.025,()=>darkWood,'solid');
    castShadow(x,y,.4,1.1);
  }
  // A curled-up shop cat, tucked beside the front window.
  sphere(-5.6,2,.35,.4,[186,148,96],'solid');
  sphere(-5.4,1.8,.5,.23,[186,148,96],'solid');
  capsule([-5.9,2.05,.35],[-5.65,2.38,.36],.12,.08,()=>cream,'solid');
  applyShadows(groundZ);
  bakedPix.set(pix); bakedZ.set(zb);
}
bake();
function draw(state, player, time, moving) {
  pix.set(bakedPix); zb.set(bakedZ); pendingShadows.length=0;
  for (const t of tables) {
    const customer=state.customers.find(c=>c.table===t.table);
    if (!customer) continue;
    const x=t.x-6,y=t.y-5;
    const served=customer.phase==='served', eating=customer.phase==='checkout'||served;
    const appearance = appearances[customer.orderId];
    const palette = {...waiter, ...appearance, stripe:appearance?.shirt ?? waiter.stripe};
    figure(x,y-1.2,Math.PI/2,{crouch:1.05,scale:.88,armR:eating?.85:.35,armL:.3,lean:served?.1:appearance?.accessory==='glasses'?.08:0},palette,dynamicAdd);
    if(eating) { bowl(x-.35,y,1.43,!served); sphere(x+.3,y+.12,1.43,.21,cream,'solid'); }
    else bowl(x+.45,y+.3,1.42,false);
  }
  const x=player.x-6,y=player.y-5;
  figure(x,y,player.yaw,{stance:moving?Math.sin(time*12)*.17:.05,armR:1.18,armL:.3},waiter,dynamicAdd);
  // Apron and tray are geometry attached to the visual player, never state rules.
  const fx=Math.cos(player.yaw),fy=Math.sin(player.yaw);
  capsule([x+fx*.28,y+fy*.28,1.04],[x+fx*.29,y+fy*.29,1.9],.26,.22,()=>jade,'solid');
  box(x+.2,y+.2,1.72,x+1.18,y+.9,1.8,darkWood);
  state.tray.slice(0,6).forEach((_,i)=>bowl(x+.4+(i%3)*.25,y+.4+Math.floor(i/3)*.27,1.9));
  flushShadows(); applyShadows(bakedZ); shadeEdges();
  // Pixel wisps, stepped gently like the upstream wind animation.
  for(const source of [-2.8,-1.3]) for(let k=0;k<3;k++) {
    const phase=(time*.32+k/3)%1;
    const p=project(source+Math.sin(phase*7+k)*.12,-4.35,2.25+phase*.8);
    const ix=Math.round(p.sx),iy=Math.round(p.sy);
    if(phase>.1&&phase<.85) for(let n=0;n<3;n++) {
      const i=(iy-n)*W+ix+(n%2);
      if(i>=0&&i<pix.length) pix[i]=rgb(...steam);
    }
  }
  ctx.putImageData(image,0,0);
}
return {draw};
}
