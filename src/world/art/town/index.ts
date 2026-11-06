import type { Point, WorldMapDefinition } from '../../schema';
import variants from './variants.json';
import type { WorldRenderView, DrawMap, WorldRenderObject } from '../../render-contract';

type RGB = readonly number[];
type Prop = WorldMapDefinition['props'][number];
const C = {
  ink: [48, 56, 53], cream: [239, 224, 191], plaster: [198, 187, 157],
  jade: [111, 154, 134], slate: [84, 112, 119], wood: [133, 103, 72],
  brass: [190, 157, 97], leaf: [98, 133, 91], darkLeaf: [65, 103, 79],
  glass: [127, 164, 169], brick: [167, 147, 114], paving: [190, 185, 159],
};
const color = (c: RGB, value = 1) => `rgb(${c.map(v => Math.round(v * value)).join(',')})`;
const hash = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

export function drawProp(ctx: CanvasRenderingContext2D, prop: Prop, view: WorldRenderView) {
  const { x, y } = prop.position, w = prop.width, h = prop.height;
  const project = (a: number, b: number, z = 0) => view.project({ x: a, y: b }, z);
  const polygon = (points: Point[], fill: RGB, value = 1) => {
    ctx.fillStyle = color(fill, value);
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(Math.round(p.x), Math.round(p.y)) : ctx.moveTo(Math.round(p.x), Math.round(p.y)));
    ctx.closePath(); ctx.fill();
  };
  const face = (points: number[][], fill: RGB, value = 1) => polygon(points.map(p => project(p[0], p[1], p[2])), fill, value);
  const line = (a: number[], b: number[], fill: RGB, thickness = 1) => {
    const p = project(a[0], a[1], a[2]), q = project(b[0], b[1], b[2]);
    ctx.strokeStyle = color(fill); ctx.lineWidth = thickness;
    ctx.beginPath(); ctx.moveTo(Math.round(p.x) + .5, Math.round(p.y) + .5); ctx.lineTo(Math.round(q.x) + .5, Math.round(q.y) + .5); ctx.stroke();
  };
  const box = (a: number, b: number, z: number, width: number, depth: number, height: number, fill: RGB) => {
    face([[a, b + depth, z], [a + width, b + depth, z], [a + width, b + depth, z + height], [a, b + depth, z + height]], fill, .86);
    face([[a + width, b, z], [a + width, b + depth, z], [a + width, b + depth, z + height], [a + width, b, z + height]], fill, .68);
    face([[a, b, z + height], [a + width, b, z + height], [a + width, b + depth, z + height], [a, b + depth, z + height]], fill, 1.08);
  };
  const style = typeof prop.variant === 'number' ? variants[prop.variant] : prop.variant;
  const isBuilding = prop.kind.startsWith('building-');
  const zMax = isBuilding ? 10 : prop.kind === 'tree' ? 7 : 6;
  const corners = [project(x - 2, y - 2, zMax), project(x + w + 2, y + h + 2), project(x - 2, y + h + 2), project(x + w + 2, y - 2)];
  if (Math.max(...corners.map(p => p.x)) < -20 || Math.min(...corners.map(p => p.x)) > view.width + 20 || Math.max(...corners.map(p => p.y)) < -20 || Math.min(...corners.map(p => p.y)) > view.height + 20) return;
  ctx.save();


  if (isBuilding) {
    const residence = prop.kind === 'building-residence', shop = prop.kind === 'building-shop';
    const height = residence ? 7.2 : prop.kind === 'building-row' ? 6.4 : prop.kind === 'building-utility' ? 3.1 : 4.5;
    const wall = style?.includes('jade') ? [170, 186, 160] : residence ? [196, 190, 167] : prop.kind === 'building-tea' ? [180, 157, 122] : C.plaster;
    box(x, y, 0, w, h, height, wall);
    box(x, y, 0, w, h, .32, [115, 126, 116]);
    box(x - .15, y - .15, height, w + .3, h + .3, .28, C.wood);
    const roof = prop.kind === 'building-restaurant' ? [104, 129, 119] : prop.kind === 'building-tea' ? [117, 112, 96] : C.slate;
    const ridge = height + 1.5, mid = y + h * .46;
    face([[x - .3, y - .3, height + .28], [x + w + .3, y - .3, height + .28], [x + w + .3, mid, ridge], [x - .3, mid, ridge]], roof, .78);
    face([[x - .3, mid, ridge], [x + w + .3, mid, ridge], [x + w + .3, y + h + .35, height + .28], [x - .3, y + h + .35, height + .28]], roof, 1.1);
    face([[x + w + .3, y - .3, height + .28], [x + w + .3, mid, ridge], [x + w + .3, y + h + .35, height + .28]], wall, .64);
    for (let a = x; a < x + w; a += .55) line([a, mid, ridge + .02], [a, y + h + .33, height + .3], [78, 101, 103]);
    for (let b = mid + .7; b < y + h; b += .7) {
      const z = ridge - (b - mid) / (h * .54 + .35) * (ridge - height - .28);
      line([x - .25, b, z + .02], [x + w + .25, b, z + .02], [140, 156, 145]);
    }
    box(x + w * .17, y + h * .28, height + .4, .7, .7, 1.5, C.brick);
    box(x + w * .17 - .1, y + h * .28 - .1, height + 1.8, .9, .9, .18, C.cream);
    for (const z of residence ? [1.3, 4.3] : [1.4]) {
      for (let a = x + 1; a < x + w - 1.2; a += residence ? 3.6 : 3.2) {
        box(a, y + h + .02, z, 1.7, .13, 1.65, C.wood);
        box(a + .13, y + h + .16, z + .14, 1.44, .04, 1.37, C.glass);
        box(a + .82, y + h + .21, z + .1, .09, .03, 1.46, C.cream);
        box(a + .1, y + h + .21, z + .75, 1.5, .03, .09, C.cream);
        box(a - .12, y + h, z - .12, 1.95, .45, .16, C.cream);
        if (z > 3) {
          box(a - .05, y + h + .3, z - .07, 1.8, .35, .35, C.wood);
          for (let k = 0; k < 4; k++) box(a + k * .4, y + h + .3, z + .25, .3, .3, .32, k % 2 ? C.jade : C.leaf);
        }
      }
    }
    for (let b = y + 1; b < y + h - 1; b += 3.1) {
      box(x + w + .02, b, 2.1, .1, 1.25, 1.65, C.wood);
      box(x + w + .13, b + .12, 2.23, .04, 1.02, 1.39, C.glass);
      box(x + w + .18, b + .56, 2.2, .02, .09, 1.5, C.cream);
    }
    const isDoor = ['town.restaurant', 'town.residence', 'town.workshop'].includes(prop.id);
    const doorX = prop.id === 'town.residence' ? 10.5 : prop.id === 'town.workshop' ? 72 : 33;
    if (isDoor) {
      box(doorX - .15, y + h + .02, .1, 2.3, .24, 2.8, C.wood);
      box(doorX, y + h + .27, .1, 2, .04, 2.5, [43, 65, 62]);
      box(doorX + .12, y + h + .32, .25, 1.76, .04, 2.1, [78, 104, 96]);
      box(doorX + 1.6, y + h + .38, 1.15, .12, .04, .12, C.brass);
      box(doorX + .1, y + h + .34, 1.7, 1.8, .03, .12, C.wood);
    } else if (shop || prop.kind === 'building-shutter') {
      box(x + .6, y + h + .1, .2, w - 1.2, .15, 2.5, style?.includes('jade') ? C.jade : C.slate);
      for (let z = .35; z < 2.6; z += .26) line([x + .7, y + h + .26, z], [x + w - .7, y + h + .26, z], [72, 93, 91]);
      box(x + w / 2 - .12, y + h + .3, .3, .24, .08, .2, C.brass);
    }
    for (let z = .5; z < Math.min(height, 3); z += .48) {
      const offset = Math.round(z * 2) % 2 * .35;
      for (let a = x + .25 + offset; a < x + w - .3; a += 1.1) {
        if (hash(a, z + y) > .72) line([a, y + h + .015, z], [a + .65, y + h + .015, z], [172, 163, 137]);
      }
    }
    if (prop.kind === 'building-restaurant') {
      box(x + w + .05, y + 1.2, .1, .55, 2.5, 1.5, [138, 151, 140]);
      for (let k = 0; k < 4; k++) box(x + w + .07, y + 1.4 + k * .5, 1.6, .5, .35, .1, C.cream);
      box(x + w - .8, y + h - .6, height + .1, .3, .3, 1.3, C.slate);
    }
    if (prop.kind === 'building-tea') {
      for (const a of [x + .4, x + w - .6]) box(a, y + h + .1, 0, .16, .16, height - .2, C.wood);
      box(x + .3, y + h + .2, 3.5, w - .6, .1, .35, C.wood);
    }
    box(x + w - .25, y + h + .15, .2, .14, .14, height - .25, [130, 145, 134]);
    if (residence) {
      box(x + w + .05, y + h - 2.7, 3.6, .65, 1.5, .85, [210, 208, 186]);
      for (let b = 0; b < 6; b++) line([x + w + .72, y + h - 2.6 + b * .2, 3.7], [x + w + .72, y + h - 2.6 + b * .2, 4.3], C.slate);
    }
    if (prop.kind === 'building-workshop') {
      for (let a = x + .5; a < x + w - 1; a += 2.3) box(a, y + h * .25, height + .8, 1.4, 1.4, .18, [161, 185, 179]);
    }
  } else if (prop.kind === 'tree' || prop.kind === 'hedge') {
    const hedge = prop.kind === 'hedge', cx = x + w / 2, cy = y + h / 2;
    if (!hedge) {
      box(cx - .12, cy - .12, 0, .24, .24, 3.8, C.wood);
      line([cx, cy, 2], [cx - .7, cy - .2, 3.5], C.wood, 3);
      line([cx, cy, 2.5], [cx + .6, cy + .25, 4], C.wood, 3);
    }
    const count = hedge ? Math.max(3, Math.ceil((w + h) * 2)) : 18;
    for (let i = 0; i < count; i++) {
      const a = hash(i, x) * Math.PI * 2;
      const px = hedge ? x + hash(i + 3, y) * w : cx + Math.cos(a) * (i % 3) * .65;
      const py = hedge ? y + hash(i, y + 1) * h : cy + Math.sin(a) * (i % 3) * .65;
      const z = hedge ? .6 + hash(i, x + 1) * .3 : 3.1 + hash(i, y + 2) * 2.2;
      const r = hedge ? .45 : .7 + hash(i + 1, x) * .65;
      const leaf = style === 'ginkgo' ? [161, 166, 98] : i % 3 === 0 ? C.darkLeaf : C.leaf;
      const p = project(px, py, z);
      const scale = Math.abs(project(px + 1, py).x - p.x), rx = Math.max(3, Math.round(r * scale)), ry = Math.max(3, Math.round(rx * .78));
      for (let row = -ry; row <= ry; row++) {
        const span = Math.round(Math.sqrt(Math.max(0, 1 - row * row / (ry * ry))) * rx);
        const edge = (Math.floor(row / 3) + i) % 2;
        ctx.fillStyle = color(leaf, row < -ry * .3 ? 1.18 : row > ry * .3 ? .78 : 1);
        ctx.fillRect(Math.round(p.x) - span + edge, Math.round(p.y) + row, span * 2 - edge, 1);
        for (let col = -span + 2; col < span - 1; col += 4) if (hash(col + x * 11, row + y * 7 + i) > .64) {
          ctx.fillStyle = color(row < 0 ? [169, 187, 121] : [86, 124, 86]);
          ctx.fillRect(Math.round(p.x) + col, Math.round(p.y) + row, 2, 1);
        }
      }
    }
  } else if (prop.kind === 'awning') {
    for (let a = 0; a < w; a += .65) {
      const fill = Math.round(a / .65) % 2 ? C.cream : style === 'ochre' ? C.brass : C.jade;
      face([[x + a, y, 3.3], [x + Math.min(w, a + .65), y, 3.3], [x + Math.min(w, a + .65), y + h + .8, 2.85], [x + a, y + h + .8, 2.85]], fill);
      box(x + a, y + h + .8, 2.55, Math.min(.65, w - a), .05, .3, fill);
    }
  } else if (prop.kind === 'steps') {
    for (let i = 0; i < 4; i++) box(x, y + h * i / 4, .03, w, h / 4, .28 - i * .06, C.paving);
  } else if (prop.kind === 'fence' || prop.kind === 'closed-gate' || prop.kind === 'gate') {
    const height = prop.kind === 'gate' ? 3.5 : prop.kind === 'closed-gate' ? 1.8 : 1.25;
    const fill = style === 'iron' || style === 'locked' ? C.slate : C.wood;
    const horizontal = w > h, length = horizontal ? w : h;
    for (let i = 0; i <= length; i += prop.kind === 'gate' ? length : .8) box(x + (horizontal ? i : 0), y + (horizontal ? 0 : i), 0, .12, .12, height, fill);
    for (const z of prop.kind === 'gate' ? [height] : [.45, 1.05]) box(x, y, z, w, h, .14, fill);
    if (prop.kind === 'gate') box(x - .3, y - .2, height, w + .6, h + .4, .3, C.slate);
    if (prop.kind === 'closed-gate') {
      line([x, y + h, .2], [x + w, y + h, 1.6], C.wood, 2);
      line([x + w, y + h, .2], [x, y + h, 1.6], C.wood, 2);
      box(x + w / 2, y + h, .8, .3, .08, .35, C.brass);
    }
  } else if (prop.kind === 'bicycle') {
    const tube = (a: number[], b: number[], fill = C.jade) => line(a, b, fill, 2);
    for (const a of [x + .35, x + w - .35]) {
      let last = [a + .36, y + h / 2, .48];
      for (let i = 1; i <= 16; i++) {
        const angle = i / 16 * Math.PI * 2, next = [a + Math.cos(angle) * .36, y + h / 2, .48 + Math.sin(angle) * .36];
        tube(last, next, C.ink); last = next;
      }
    }
    const back = [x + .35, y + h / 2, .48], front = [x + w - .35, y + h / 2, .48], seat = [x + .65, y + h / 2, 1.05], crank = [x + .9, y + h / 2, .4], bar = [x + w - .5, y + h / 2, 1.05];
    for (const [a, b] of [[back, seat], [seat, crank], [crank, back], [crank, front], [seat, bar], [bar, front]]) tube(a, b);
    tube([x + .45, y + h / 2, 1.12], [x + .85, y + h / 2, 1.12], C.wood);
    tube(bar, [bar[0], bar[1], 1.3], C.ink);
  } else if (prop.kind === 'laundry') {
    line([x, y, 4.3], [x + w, y + h, 4.1], C.wood);
    for (let i = 0; i < Math.floor(w / .95); i++) {
      const px = x + .35 + i * 1.05, z = 4.15 - i * .015;
      const sway = view.reducedMotion ? 0 : Math.sin(view.elapsedMs / 1100 + i * .9) * .08;
      face([[px, y, z], [px + .65, y, z], [px + .72 + sway, y + .06, z - 1], [px + sway, y + .06, z - 1]], i % 3 ? C.cream : C.jade);
      line([px + .08, y, z + .05], [px + .08, y, z - .12], C.brass, 2);
    }
  } else if (prop.kind === 'street-lamp' || prop.kind === 'utility-pole') {
    const utility = prop.kind === 'utility-pole', z = utility ? 5.5 : 4;
    box(x, y, 0, .15, .15, z, C.wood);
    box(x - .25, y - .25, 0, .65, .65, .25, C.paving);
    box(x - .4, y, z, utility ? 1 : .8, .14, .12, C.wood);
    if (utility) for (const a of [-.25, .5]) box(x + a, y, z + .1, .18, .18, .3, C.cream);
    else {
      box(x + .25, y - .15, z - .5, .55, .5, .6, C.cream);
      box(x + .15, y - .25, z + .1, .75, .7, .12, C.slate);
    }
  } else if (prop.kind === 'drain' || prop.kind === 'gutter') {
    box(x, y, .015, w, h, .025, prop.kind === 'drain' ? C.slate : [134, 154, 132]);
    if (prop.kind === 'drain') for (let a = 0; a < Math.max(w, h); a += .18) {
      const horizontal = w > h;
      line([x + (horizontal ? a : 0), y + (horizontal ? 0 : a), .05], [x + (horizontal ? a : w), y + (horizontal ? h : a), .05], C.ink);
    }
  } else if (prop.kind === 'bench') {
    for (const a of [.2, w - .4]) box(x + a, y, 0, .14, h, .7, C.slate);
    for (let i = 0; i < 3; i++) box(x, y + i * h / 3, .7, w, h / 3 - .04, .12, C.wood);
    box(x, y, 1.2, w, .12, .45, C.wood);
  } else if (prop.kind === 'market-stall') {
    box(x, y, 0, w, h, .85, C.wood);
    box(x - .1, y - .1, .85, w + .2, h + .2, .14, C.brass);
    for (let a = 0; a < w - .3; a += .5) box(x + a + .1, y + .2, 1, .35, h - .4, .25, a % 1 ? C.leaf : C.cream);
    for (const a of [0, w - .15]) box(x + a, y, .8, .12, .12, 1.7, C.wood);
    box(x - .2, y - .2, 2.4, w + .4, h + .4, .12, C.jade);
  } else if (prop.kind === 'planter') {
    box(x, y, 0, w, h, .55, C.brick);
    box(x - .05, y - .05, .5, w + .1, h + .1, .15, C.brass);
    for (let i = 0; i < 5; i++) box(x + hash(i, x) * w, y + hash(i, y + 1) * h, .63, .2, .2, .25 + hash(i, x + 1) * .4, i % 2 ? C.leaf : C.jade);
  } else if (prop.kind === 'crates' || prop.kind === 'baskets') {
    const z = prop.kind === 'baskets' ? .55 : .95;
    box(x, y, 0, w, h, z, C.wood);
    for (let a = 0; a < w; a += .4) box(x + a, y + h, .05, .07, .07, z - .05, C.brass);
    box(x - .03, y - .03, z, w + .06, h + .06, .08, C.brass);
  } else if (prop.kind === 'pipes') {
    for (const z of [.7, 1.6]) box(x, y, z, w, h, .12, C.slate);
  } else if (prop.kind === 'stone-table') {
    box(x + w * .3, y + h * .3, 0, w * .4, h * .4, .9, C.paving);
    box(x, y, .9, w, h, .18, C.cream);
  } else {
    box(x, y, 0, w, h, prop.kind === 'bollard' ? .65 : .8, C.paving);
    box(x, y, .6, w, h, .1, C.cream);
  }
  ctx.restore();
}

export const drawMap: DrawMap = (ctx, map, view) => {
  if (map.id !== 'town') return;
  ctx.imageSmoothingEnabled = false;
  if (view.pass === 'ground') {
    ctx.fillStyle = color([104, 130, 103]); ctx.fillRect(0, 0, view.width, view.height);
    for (let x = 0; x < map.bounds.width; x += .75) for (let y = 0; y < map.bounds.height; y += .75) {
      const p = view.project({ x, y });
      if (p.x < -5 || p.x > view.width + 5 || p.y < -5 || p.y > view.height + 5) continue;
      const n = hash(x, y);
      ctx.fillStyle = color(n > .7 ? [151, 164, 111] : n > .3 ? [85, 118, 91] : [119, 146, 106]);
      ctx.fillRect(Math.round(p.x), Math.round(p.y), n > .7 ? 3 : 2, 1);
      if (n < .3) ctx.fillRect(Math.round(p.x) + 1, Math.round(p.y) - 2, 1, 3);
    }
    for (const terrain of map.terrain) {
      const r = terrain.rect;
      for (let x = Math.floor(r.x); x < r.x + r.width; x++) for (let y = Math.floor(r.y); y < r.y + r.height; y++) {
        const x0 = Math.max(r.x, x), y0 = Math.max(r.y, y), x1 = Math.min(r.x + r.width, x + 1), y1 = Math.min(r.y + r.height, y + 1);
        const points = [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }].map(p => view.project(p));
        if (Math.max(...points.map(p => p.x)) < 0 || Math.min(...points.map(p => p.x)) > view.width || Math.max(...points.map(p => p.y)) < 0 || Math.min(...points.map(p => p.y)) > view.height) continue;
        const base = terrain.material === 'road' ? [134, 142, 135] : terrain.material === 'brick' ? [178, 164, 134] : C.paving;
        ctx.fillStyle = color(base, .96 + hash(x, y) * .08);
        ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(Math.round(p.x), Math.round(p.y)) : ctx.moveTo(Math.round(p.x), Math.round(p.y))); ctx.closePath(); ctx.fill();
        if (terrain.material !== 'road') {
          ctx.strokeStyle = color(base, .86); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(Math.round(points[0].x) + .5, Math.round(points[0].y) + .5); ctx.lineTo(Math.round(points[1].x) + .5, Math.round(points[1].y) + .5); ctx.lineTo(Math.round(points[2].x) + .5, Math.round(points[2].y) + .5); ctx.stroke();
        }
        const p = view.project({ x: x0 + .3 + hash(x, y) * .4, y: y0 + .3 });
        ctx.fillStyle = color(base, .75); ctx.fillRect(Math.round(p.x), Math.round(p.y), terrain.material === 'road' ? 2 : 1, 1);
      }
    }
  }
  if (view.pass === 'objects') return;
  const layer = view.pass === 'ground' ? 'ground' : 'foreground';
  for (const prop of map.props.filter(p => p.layer === layer).sort((a, b) => a.position.x + a.position.y + (a.width + a.height) / 2 - b.position.x - b.position.y - (b.width + b.height) / 2)) drawProp(ctx, prop, view);
}


export function renderObjects(map: WorldMapDefinition, _view: WorldRenderView): WorldRenderObject[] {
  if (map.id !== 'town') return [];
  return map.props.filter(prop => prop.layer === 'object').map(prop => ({
    id: prop.id,
    position: { x: prop.position.x + prop.width / 2, y: prop.position.y + prop.height / 2 },
    occlusion: map.occluders.find(item => item.id === prop.id),
    draw(ctx, view) { drawProp(ctx, prop, view); },
  }));
}
