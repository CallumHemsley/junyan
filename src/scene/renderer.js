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
export const COLORS = {
  cream: [245,232,202], jade: [111,154,134], ink: [48,43,42],
  skin: [232,183,143], cheek: [208,149,117], hair: [65,48,39],
  wood: [115,86,58], shoe: [66,68,65], brass: [190,157,97],
};

export function customerPose(phase, accessory) {
  const served = phase === 'served', eating = phase === 'checkout' || served;
  return {crouch:1.05,scale:.88,armR:eating?.85:.35,armL:.3,greeting:!eating,
    lean:served?.1:accessory==='glasses'?.08:0};
}

export function characterFigure(px, py, yaw, pose, palette, addBone) {
  const forwardX = Math.cos(yaw), forwardY = Math.sin(yaw);
  const sideX = -forwardY, sideY = forwardX, scale = pose.scale || 1;
  const base = pose.z || 0, seated = Boolean(pose.crouch), kind = palette.accessory || 'waiter';
  const local = (forward, side, height) => [px + (forwardX*forward + sideX*side)*scale, py + (forwardY*forward + sideY*side)*scale, base + height*scale];
  const bone = (start, end, startRadius, endRadius, color) => addBone(local(...start), local(...end), startRadius*scale, endRadius*scale, () => color);
  const dot = (position, radius, color) => bone(position, position, radius, radius, color);
  const skin = palette.skin || COLORS.skin, hair = palette.hair || COLORS.hair;
  const shirt = palette.shirt || COLORS.cream, trousers = palette.legs || COLORS.shoe;
  const hip = seated ? .76 : .92, shoulder = seated ? 1.47 : 1.59;
  const headHeight = seated ? 1.97 : 2.09, lean = pose.lean || 0;
  const headForward = .025 + lean*.65;
  const stride = pose.stance || 0;
  for (const side of [-1,1]) {
    const footForward = seated ? .39 : stride*side;
    bone([0,side*.17,hip],[seated?.36:footForward*.4,side*.19,seated?.46:.48],.19,.15,trousers);
    bone([seated?.36:footForward*.4,side*.19,seated?.46:.48],[footForward,side*.19,.13],.15,.12,trousers);
    bone([footForward-.035,side*.19,.12],[footForward+.20,side*.19,.10],.13,.115,COLORS.shoe);
  }
  bone([0,0,hip],[lean*.25,0,shoulder],kind==='bun'?.36:.32,kind==='bun'?.38:.35,shirt);
  bone([headForward,0,shoulder+.02],[headForward,0,headHeight-.20],.13,.14,skin);
  dot([headForward,0,headHeight],.37,skin);
  dot([headForward+.12,0,headHeight-.035],.30,[239,191,152]);
  for (const side of [-1,1]) dot([headForward-.015,side*.31,headHeight-.035],.085,skin);
  if (kind === 'glasses') {
    dot([headForward-.13,0,headHeight+.18],.31,hair);
    bone([headForward+.12,-.22,headHeight+.27],[headForward+.20,.12,headHeight+.23],.14,.10,hair);
    for (const side of [-1,1]) bone([headForward-.10,side*.27,headHeight+.10],[headForward-.08,side*.31,headHeight-.06],.12,.10,hair);
  } else {
    dot([headForward-.08,0,headHeight+.14],kind==='tie'?.33:.355,hair);
    bone([headForward-.19,-.12,headHeight+.03],[headForward-.19,.12,headHeight+.03],.24,.24,hair);
    for (const side of [-1,1]) {
      bone([headForward+.10,side*.27,headHeight+.17],[headForward+.035,side*.315,headHeight-.10],.135,.095,hair);
    }
    if (kind === 'bun') {
      bone([headForward+.24,-.21,headHeight+.29],[headForward+.25,.21,headHeight+.29],.12,.12,hair);
      bone([headForward+.17,0,headHeight+.32],[headForward-.32,0,headHeight+.22],.17,.19,hair);
      dot([headForward-.36,0,headHeight+.32],.20,hair);
      dot([headForward-.45,0,headHeight+.40],.055,COLORS.jade);
    } else if (kind === 'tie') {
      bone([headForward+.23,-.22,headHeight+.25],[headForward+.30,.07,headHeight+.30],.135,.115,hair);
      bone([headForward+.28,.17,headHeight+.31],[headForward+.12,.29,headHeight+.19],.10,.11,hair);
    } else if (kind === 'backpack') {
      bone([headForward+.27,-.21,headHeight+.25],[headForward+.29,.19,headHeight+.24],.115,.115,hair);
      for (const side of [-1,1]) bone([headForward+.16,side*.28,headHeight+.10],[headForward+.10,side*.32,headHeight-.19],.115,.085,hair);
      bone([headForward-.27,0,headHeight+.14],[headForward-.43,0,headHeight+.01],.18,.15,hair);
      bone([headForward-.43,0,headHeight+.01],[headForward-.49,0,headHeight-.33],.15,.095,hair);
      dot([headForward-.44,0,headHeight+.05],.065,COLORS.brass);
    } else {
      bone([headForward+.26,-.22,headHeight+.27],[headForward+.29,.02,headHeight+.24],.13,.12,hair);
      bone([headForward+.29,.02,headHeight+.24],[headForward+.23,.22,headHeight+.27],.12,.12,hair);
    }
  }
  if (kind === 'nurse') {
    dot([headForward-.34,0,headHeight-.12],.17,hair);
    bone([headForward-.02,-.24,headHeight+.37],[headForward-.02,.24,headHeight+.37],.11,.11,COLORS.cream);
    bone([headForward+.10,-.25,headHeight+.31],[headForward+.10,.25,headHeight+.31],.045,.045,COLORS.jade);
  } else if (kind === 'aunt') {
    for (const side of [-1,1]) bone([headForward-.05,side*.31,headHeight+.12],[headForward-.06,side*.36,headHeight-.30],.17,.15,hair);
    bone([headForward-.30,-.22,headHeight-.04],[headForward-.30,.22,headHeight-.04],.22,.22,hair);
    bone([headForward-.24,-.26,headHeight-.28],[headForward-.24,.26,headHeight-.28],.15,.15,hair);
  }
  for (const side of [-1,1]) {
    dot([headForward+.367,side*.19,headHeight-.07],.06,COLORS.cheek);
    if (kind === 'glasses') {
      dot([headForward+.40,side*.135,headHeight+.04],.085,COLORS.wood);
      dot([headForward+.45,side*.135,headHeight+.045],.059,[237,222,189]);
      dot([headForward+.493,side*.13,headHeight+.04],.028,COLORS.ink);
    } else {
      bone([headForward+.33,side*.12,headHeight],[headForward+.33,side*.12,headHeight+.075],.065,.065,COLORS.cream);
      bone([headForward+.36,side*.12,headHeight+.005],[headForward+.36,side*.12,headHeight+.070],.04,.04,COLORS.ink);
    }
  }
  dot([headForward+.44,0,headHeight-.025],.055,skin);
  bone([headForward+.40,-.055,headHeight-.14],[headForward+.42,0,headHeight-.155],.018,.021,[176,119,88]);
  bone([headForward+.42,0,headHeight-.155],[headForward+.40,.055,headHeight-.14],.021,.018,[176,119,88]);
  if (kind === 'glasses') bone([headForward+.42,-.07,headHeight+.045],[headForward+.42,.07,headHeight+.045],.023,.023,COLORS.wood);
  if (kind === 'tie' || kind === 'glasses' || kind === 'bun') {
    bone([.295,-.11,shoulder-.04],[.30,0,shoulder-.25],.073,.065,COLORS.cream);
    bone([.295,.11,shoulder-.04],[.30,0,shoulder-.25],.073,.065,COLORS.cream);
  }
  if (kind === 'tie') bone([.35,0,shoulder-.20],[.34,0,shoulder-.49],.043,.055,COLORS.wood);
  if (kind === 'doctor') {
    for (const side of [-1,1]) {
      bone([.24,side*.13,shoulder-.02],[.33,side*.06,shoulder-.30],.075,.065,[226,214,186]);
      bone([.27,side*.20,shoulder-.06],[.36,side*.12,shoulder-.42],.03,.03,COLORS.ink);
      bone([0,side*.22,hip+.05],[.02,side*.27,hip-.42],.24,.27,shirt);
    }
    dot([.38,.10,shoulder-.47],.055,[176,180,180]);
  }
  if (kind === 'nurse') bone([.30,-.12,shoulder-.06],[.33,0,shoulder-.22],.05,.05,COLORS.cream);
  if (kind === 'aunt') {
    bone([.30,0,hip+.15],[.31,0,shoulder-.10],.13,.12,COLORS.cream);
    bone([.27,-.24,shoulder-.02],[.30,.24,hip+.10],.04,.04,COLORS.wood);
  }
  if (kind === 'bun') bone([.34,0,hip+.13],[.35,0,shoulder-.28],.18,.16,COLORS.cream);
  if (kind === 'backpack') {
    bone([-.29,0,hip+.07],[-.31,0,shoulder-.13],.29,.25,COLORS.brass);
    for (const side of [-1,1]) bone([.08,side*.29,shoulder-.02],[.28,side*.25,hip+.13],.055,.055,COLORS.brass);
  }
  for (const side of [-1,1]) {
    const wave = kind === 'backpack' && side === -1 && !pose.carry && pose.greeting !== false;
    const arm = side === 1 ? pose.armR : pose.armL;
    const lift = Math.sin(arm || 0);
    const shoulderPoint = [lean*.25,side*.34,shoulder-.06];
    const elbow = side===1 && pose.elbowR ? pose.elbowR : pose.lying ? [.03,side*.42,shoulder-.42] : pose.carry ? [.26,side*.43,1.12] : wave ? [.12,side*.48,1.39] : [.13+lift*.22,side*.41,shoulder-.40+lift*.12];
    const hand = side===1 && pose.handR ? pose.handR : pose.lying ? [.05,side*.38,hip+.05] : pose.carry ? [.57,side*.34,1.22] : wave ? [.26,side*.49,1.74] : [seated?.50:.20,side*.38,arm == null ? (seated?1.20:1.00) : (seated?1.08:.90)+lift*.40];
    bone(shoulderPoint,elbow,.16,.125,shirt);
    dot(elbow,.132,COLORS.cream);
    bone(elbow,hand,.105,.09,skin);
    dot(hand,.12,skin);
  }
  if (pose.carry) {
    bone([.28,0,.85],[.32,0,shoulder-.14],.245,.22,COLORS.jade);
    bone([.45,-.12,1.12],[.45,.12,1.12],.035,.035,[160,190,165]);
    for (const side of [-1,1]) bone([.03,side*.24,shoulder+.01],[.32,side*.18,shoulder-.30],.045,.045,COLORS.jade);
    bone([-.30,-.17,1.12],[-.30,.17,1.12],.035,.035,COLORS.cream);
  }
  return {local,bone,dot,headHeight};
}

export function characterTray(rig, foods, addBox) {
  const {bone,dot} = rig;
  addBox([.43,-.43,1.245],[1.01,.43,1.30],COLORS.wood,rig.local);
  for (const side of [-1,1]) bone([.43,side*.43,1.32],[1.01,side*.43,1.32],.035,.035,COLORS.brass);
  for (const forward of [.43,1.01]) bone([forward,-.43,1.32],[forward,.43,1.32],.035,.035,COLORS.brass);
  foods.slice(0,6).forEach((food,index) => {
    const forward = .58+Math.floor(index/3)*.27, side=(index%3-1)*.26;
    dot([forward,side,1.41],.12,COLORS.jade);
    dot([forward+.005,side,1.46],.10,COLORS.cream);
  });
}
export function createRenderer(canvas, scene) {
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
function box(x0, y0, z0, x1, y1, z1, c, seed = 0, transform = null) {
  const ramp = rampOf(c);
  const paint = (x, y, z, base, grain) => {
    const p = project(...(transform ? transform(x,y,z) : [x,y,z])), ix = p.sx | 0, iy = p.sy | 0;
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
  if (transform) {
    for (let a = x0; a <= x1; a += step) for (let b = z0; b <= z1; b += step) paint(a, y0, b, 2.3, noise(a * .8 + seed, b * 9));
    for (let a = y0; a <= y1; a += step) for (let b = z0; b <= z1; b += step) paint(x0, a, b, 1.2, noise(a * .8 + seed, b * 9));
    for (let a = x0; a <= x1; a += step) for (let b = y0; b <= y1; b += step) paint(a, b, z0, 1.2, noise(a * .8 + seed, b * 9));
  }
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

const api = {W,H,R2,COS,pix,zb,ground,groundZ,bakedZ,rgb,hash,project,unproject,
  box,sphere,capsule,castShadow,applyShadows,flushShadows,shadeEdges,dynamicAdd};
scene.bake(api);
applyShadows(groundZ);
bakedPix.set(pix); bakedZ.set(zb);
return {
  draw(...args) {
    pix.set(bakedPix); zb.set(bakedZ); pendingShadows.length=0;
    scene.draw(api, ...args);
    ctx.putImageData(image,0,0);
  },
};
}
