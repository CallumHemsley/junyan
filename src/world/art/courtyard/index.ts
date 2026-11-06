import type { DrawMap, WorldRenderView } from '../../render-contract';

type Point = { x: number; y: number };
export type CourtyardView = WorldRenderView;
const color = {
  soil: '#6c7c60', moss: '#85916c', stone: '#b9b199', stoneLight: '#c5bea7',
  stoneDark: '#9e9c87', grout: '#9c9a83', brick: '#b19476', brickLight: '#c8b090',
  brickDark: '#8e7d68', cream: '#e2d7b8', linen: '#dbd6bd', wood: '#8b6b4b',
  woodDark: '#675746', roof: '#5b7778', roofLight: '#75918d', roofDark: '#455e61',
  leaf: '#55765d', leafLight: '#9cab79', leafDark: '#3e6150', leafMid: '#758d64',
  ink: '#333d39', glass: '#8eaaa5', brass: '#b99f69', shadow: '#526652',
};
function painter(ctx: CanvasRenderingContext2D, view: CourtyardView) {
  const polygon = (points: [number, number, number][], fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    points.forEach(([x, y, z], i) => {
      const p = view.project({ x, y }, z);
      if (i === 0) ctx.moveTo(Math.round(p.x), Math.round(p.y));
      else ctx.lineTo(Math.round(p.x), Math.round(p.y));
    });
    ctx.closePath(); ctx.fill();
  };
  const floor = (x: number, y: number, w: number, h: number, fill: string, z = 0) =>
    polygon([[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z]], fill);
  const box = (x: number, y: number, w: number, d: number, h: number, top: string, left = top, right = left, z = 0) => {
    polygon([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left);
    polygon([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right);
    floor(x, y, w, d, top, z + h);
  };
  const line = (a: [number, number, number], b: [number, number, number], fill: string, width = 1) => {
    const p = view.project({ x: a[0], y: a[1] }, a[2]), q = view.project({ x: b[0], y: b[1] }, b[2]);
    ctx.strokeStyle = fill; ctx.lineWidth = width; ctx.beginPath();
    ctx.moveTo(Math.round(p.x), Math.round(p.y)); ctx.lineTo(Math.round(q.x), Math.round(q.y)); ctx.stroke();
  };
  return { polygon, floor, box, line };
}
const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
};
function visible(view: CourtyardView, x: number, y: number, extent = 150) {
  const p = view.project({ x, y });
  return p.x > -extent && p.y > -extent && p.x < view.width + extent && p.y < view.height + extent;
}

export const drawMap: DrawMap = (ctx, map, view) => {
  ctx.save(); ctx.imageSmoothingEnabled = false;
  const { box, floor, polygon, line } = painter(ctx, view);
  if (view.pass === 'ground') {
    for (const terrain of map.terrain) {
      const { x, y, width, height } = terrain.rect;
      const earth = terrain.material === 'moss-earth';
      const brick = terrain.material === 'brick-paving';
      for (let yy = y; yy < y + height; yy++) for (let xx = x; xx < x + width; xx++) {
        if (!visible(view, xx, yy, 40)) continue;
        const n = hash(xx, yy);
        const cluster = Math.sin(xx * .43) * Math.cos(yy * .39) + Math.sin((xx + yy) * .19) * .5;
        const fill = earth ? cluster > .65 ? color.moss : cluster < -.5 ? '#847f62' : color.soil
          : brick ? n < .22 ? '#b4a68c' : '#a99b82'
          : n < .18 ? color.stoneLight : n < .36 ? color.stoneDark : color.stone;
        floor(xx, yy, Math.min(1, x + width - xx), Math.min(1, y + height - yy), fill);
        if (earth) {
          if (cluster > .75 && n > .4) { floor(xx + .12, yy + .25, .4, .3, color.leafMid, .01); floor(xx + .25, yy + .2, .3, .17, color.leafLight, .01); }
          if (cluster < -.6 && n > .7) floor(xx + .2, yy + .3, .3, .15, '#a39876', .01);
        } else {
          if (n > .3) line([xx + .03, yy + .02, .01], [xx + .92, yy + .02, .01], color.grout);
          if (n > .7) floor(xx + .55, yy + .6, .13, .09, '#d0c8ad', .01);
          if (n < .08) { floor(xx + .04, yy + .1, .3, .07, color.leafMid, .02); floor(xx + .12, yy + .2, .07, .18, color.leafMid, .02); }
        }
      }
    }
  }
  if (view.pass === 'ground') for (const p of map.props) {
    if (!visible(view, p.position.x, p.position.y, 120)) continue;
    const shadow = p.kind === 'laundry' || p.kind === 'bicycle-shed' || p.kind === 'courtyard-tree';
    if (shadow) { ctx.globalAlpha = .16; floor(p.position.x + .5, p.position.y + .4, p.width + .8, p.height + .6, color.ink, .03); ctx.globalAlpha = 1; }
  }
  const props = map.props.filter(p => (view.pass === 'ground' ? p.layer === 'ground' : view.pass === 'foreground' ? p.layer === 'foreground' : p.layer === 'object'))
    .sort((a, b) => a.position.x + a.position.y - b.position.x - b.position.y);
  for (const p of props) {
    const { x, y } = p.position, w = p.width, d = p.height, v = Number(p.variant) || 0;
    if (!visible(view, x + w / 2, y + d / 2, 230)) continue;
    const closestX = Math.max(x, Math.min(view.playerPosition.x, x + w));
    const closestY = Math.max(y, Math.min(view.playerPosition.y, y + d));
    ctx.globalAlpha = view.pass === 'foreground' && Math.hypot(view.playerPosition.x - closestX, view.playerPosition.y - closestY) < 2 ? .42 : 1;
    const pot = (px: number, py: number, variety: number) => {
      box(px, py, .8, .8, .55, '#a98b64', '#a08360', '#8e7557');
      box(px - .07, py - .07, .94, .94, .13, '#baa078', '#aa8d67', '#987c5c', .48);
      floor(px + .08, py + .08, .64, .64, '#62624b', .62);
      if (variety % 3 === 0) {
        for (let i = 0; i < 5; i++) { const a = i * 2.4; line([px + .4, py + .4, .65], [px + .4 + Math.cos(a) * .5, py + .4 + Math.sin(a) * .5, 1 + i % 2 * .4], color.leaf, 3); }
      } else if (variety % 3 === 1) {
        box(px + .15, py + .14, .55, .52, .5, color.leafLight, color.leafMid, color.leaf, .6);
        box(px + .32, py + .18, .3, .28, .3, color.leafMid, color.leaf, color.leafDark, 1);
      } else {
        for (let i = 0; i < 4; i++) { const dx = i % 2 * .38, dy = Math.floor(i / 2) * .35; box(px + dx, py + dy, .3, .3, .65, color.leafMid, color.leaf, color.leafDark, .6); floor(px + dx, py + dy, .3, .3, i % 2 ? color.cream : color.brass, 1.3); }
      }
    };
    const wheel = (cx: number, cy: number, z: number, r: number) => {
      for (let k = 0; k < 24; k++) {
        const a = k * Math.PI / 12, b = (k + 1) * Math.PI / 12;
        line([cx + Math.cos(a) * r, cy, z + Math.sin(a) * r], [cx + Math.cos(b) * r, cy, z + Math.sin(b) * r], color.ink, 2);
        if (k % 4 === 0) line([cx, cy, z], [cx + Math.cos(a) * r, cy, z + Math.sin(a) * r], '#b6b5a0');
      }
    };
    switch (p.kind) {
      case 'row-house': {
        const h = 3.6 + v % 2 * .65;
        box(x, y, w, d, h, color.brickLight, v % 2 ? '#c0ad8d' : color.brick, color.brickDark);
        for (let z = .4; z < h; z += .5) line([x, y + d + .01, z], [x + w, y + d + .01, z], '#af967b');
        box(x - .15, y - .15, w + .3, d + .3, .16, color.woodDark, color.woodDark, color.woodDark, h - .12);
        box(x - .35, y - .35, w + .7, d + .7, .2, color.roof, color.roofDark, color.roofDark, h);
        polygon([[x - .35, y - .35, h + .2], [x + w + .35, y - .35, h + .2], [x + w + .35, y + d / 2, h + 1.1], [x - .35, y + d / 2, h + 1.1]], color.roofDark);
        polygon([[x - .35, y + d / 2, h + 1.1], [x + w + .35, y + d / 2, h + 1.1], [x + w + .35, y + d + .35, h + .2], [x - .35, y + d + .35, h + .2]], color.roof);
        for (let rx = x - .2; rx < x + w + .2; rx += .55) { line([rx, y + d / 2, h + 1.11], [rx, y + d + .3, h + .22], color.roofLight); }
        line([x - .4, y + d / 2, h + 1.12], [x + w + .4, y + d / 2, h + 1.12], '#91a39a', 2);
        box(x + w * .54, y + .5, .7, .8, .85, '#ac9c83', '#968871', '#827963', h + .27);
        const door = x + Math.min(w / 2, 3);
        polygon([[door - .6, y + d + .02, 0], [door + .6, y + d + .02, 0], [door + .6, y + d + .02, 2.4], [door - .6, y + d + .02, 2.4]], color.woodDark);
        line([door + .35, y + d + .04, 1.1], [door + .35, y + d + .04, 1.25], color.brass, 2);
        for (let wx = x + .7; wx < x + w - 1; wx += 3.3) {
          if (Math.abs(wx + .65 - door) < 1.1) continue;
          polygon([[wx, y + d + .03, 1.2], [wx + 1.3, y + d + .03, 1.2], [wx + 1.3, y + d + .03, 2.6], [wx, y + d + .03, 2.6]], color.roofDark);
          polygon([[wx + .1, y + d + .05, 1.35], [wx + 1.2, y + d + .05, 1.35], [wx + 1.2, y + d + .05, 2.48], [wx + .1, y + d + .05, 2.48]], v % 3 === 0 ? '#c5bb8e' : color.glass);
          line([wx + .65, y + d + .07, 1.3], [wx + .65, y + d + .07, 2.55], color.woodDark);
          line([wx, y + d + .07, 1.9], [wx + 1.3, y + d + .07, 1.9], color.woodDark);
          box(wx - .12, y + d, 1.55, .23, .16, color.cream, color.brickDark, color.brickDark, 1.12);
          if (v % 2) {
            polygon([[wx - .3, y + d + .03, 1.25], [wx - .08, y + d + .03, 1.25], [wx - .08, y + d + .03, 2.6], [wx - .3, y + d + .03, 2.6]], '#7a8f7c');
            polygon([[wx + 1.38, y + d + .03, 1.25], [wx + 1.6, y + d + .03, 1.25], [wx + 1.6, y + d + .03, 2.6], [wx + 1.38, y + d + .03, 2.6]], '#7a8f7c');
          }
        }
        box(x + .25, y + d, .2, .25, 2.95, color.roofDark, color.roofDark, color.roofDark);
        break;
      }
      case 'doorway':
        for (const dx of [-.4, w]) box(x + dx, y, .4, d, 3.2, color.cream, color.brickLight, color.brickDark);
        box(x - .5, y, w + 1, d, .4, color.roof, color.roofDark, color.roofDark, 3.15); break;
      case 'window':
        box(x, y, w, .18, 1.5, color.wood, color.wood, color.woodDark, 1.3);
        box(x + .12, y + .2, w - .24, .06, 1.22, color.glass, color.glass, color.glass, 1.43);
        line([x + w / 2, y + .28, 1.43], [x + w / 2, y + .28, 2.67], color.cream, 2);
        box(x - .15, y + .15, w + .3, .45, .16, color.wood, color.wood, color.woodDark, 1.2); break;
      case 'stoop': case 'doorstep':
        box(x, y, w, d, .15, color.stoneLight, color.stoneDark, color.stoneDark);
        box(x + .12, y, w - .24, d * .6, .13, color.cream, color.stoneDark, color.stoneDark, .15); break;
      case 'bicycle': {
        const yy = y + d / 2, left = x + .35, right = x + w - .35, center = x + w * .52;
        wheel(left, yy, .75, .7); wheel(right, yy, .75, .7);
        const seat: [number, number, number] = [center - .35, yy, 1.65], crank: [number, number, number] = [center, yy, .55], front: [number, number, number] = [right - .2, yy, 1.6];
        for (const [a, b] of [[[left, yy, .75], seat], [seat, crank], [crank, [left, yy, .75]], [seat, front], [front, crank], [front, [right, yy, .75]]] as [[number, number, number], [number, number, number]][]) line(a, b, v ? '#b3a27b' : '#7d9a94', 2);
        line([center - .6, yy, 1.78], [center, yy, 1.78], color.ink, 3);
        line(front, [right - .15, yy, 2], color.ink, 2);
        line([right - .15, yy - .25, 2], [right - .15, yy + .3, 2], color.ink, 2); break;
      }
      case 'bicycle-shed': case 'canopy': case 'garden-arch': {
        const h = p.kind === 'garden-arch' ? 3.6 : 2.7;
        for (const dx of [0, w - .15]) box(x + dx, y, .15, .15, h, color.wood, color.wood, color.woodDark);
        if (p.kind !== 'garden-arch') {
          box(x - .25, y - .25, w + .5, d + .35, .15, color.roof, color.roofDark, color.roofDark, h);
          for (let xx = x; xx < x + w; xx += .55) line([xx, y, h + .16], [xx, y + d, h + .16], color.roofLight);
        } else {
          box(x - .2, y, w + .4, d, .2, color.wood, color.wood, color.woodDark, h);
          for (let dy = 0; dy < d; dy += .55) box(x - .3, y + dy, w + .6, .17, .1, color.leafMid, color.leaf, color.leafDark, h + .2);
        }
        break;
      }
      case 'bench':
        for (const dx of [.3, w - .55]) for (const dy of [.12, d - .3]) box(x + dx, y + dy, .16, .16, .65, color.ink);
        for (let k = 0; k < 4; k++) box(x, y + k * d / 4, w, d / 4 - .04, .15, v === 1 ? '#a69a79' : color.wood, color.woodDark, color.woodDark, .65);
        for (const dx of [.3, w - .55]) box(x + dx, y, .14, .14, 1.5, color.ink);
        for (const z of [1, 1.3]) box(x, y, w, .15, .21, color.wood, color.woodDark, color.woodDark, z); break;
      case 'laundry': {
        const sway = view.reducedMotion ? 0 : Math.sin(view.elapsedMs / 1400 + x) * .08;
        for (const dx of [0, w]) box(x + dx, y, .08, .08, 2.5, color.woodDark);
        line([x, y, 2.4], [x + w, y, 2.4], color.linen);
        for (let k = 0; k < 4; k++) {
          const xx = x + .45 + k * (w - .5) / 4;
          polygon([[xx, y, 2.35], [xx + .8, y, 2.35], [xx + .8 + sway, y + .08, 1.2 + k % 2 * .25], [xx + sway, y + .08, 1.2 + k % 2 * .25]], [color.linen, '#91a6a0', '#c5b48a', '#aaa99a'][(k + v) % 4]);
          line([xx + .08, y, 2.3], [xx + .08, y, 2.5], color.wood, 2);
        }
        break;
      }
      case 'planter': pot(x, y, v); break;
      case 'raised-bed':
        box(x, y, w, d, .42, color.woodDark, color.wood, color.woodDark);
        floor(x + .13, y + .13, w - .26, d - .26, '#615d47', .44);
        for (let yy = y + .4; yy < y + d - .2; yy += .65) for (let xx = x + .3; xx < x + w - .2; xx += .6) {
          box(xx, yy, .4, .34, .25, color.leafLight, color.leafMid, color.leaf, .43);
          line([xx + .1, yy + .1, .65], [xx + .23, yy + .15, .88], color.leaf, 2);
        }
        break;
      case 'courtyard-tree': {
        const sway = view.reducedMotion ? 0 : Math.sin(view.elapsedMs / 2000 + x) * .06;
        box(x + .45, y + .45, .3, .3, 3, color.wood, color.woodDark, color.woodDark);
        for (const [dx, dy, z, size] of [[-.7, -.5, 2.6, 1.8], [.3, -.6, 3.1, 1.6], [-.35, .5, 3.2, 1.7], [-.3, -.1, 3.9, 1.5]]) {
          box(x + dx + sway, y + dy, size, size * .8, .65, v === 1 ? '#a0a971' : color.leafMid, color.leaf, color.leafDark, z);
          floor(x + dx + .15 + sway, y + dy + .1, size * .55, size * .28, color.leafLight, z + .66);
        }
        break;
      }
      case 'drain':
        floor(x, y, w, d, color.ink, .02);
        for (let dx = .12; dx < w; dx += .22) floor(x + dx, y, .09, d, '#899184', .03); break;
      case 'pawprints':
        for (const [dx, dy] of [[0, 0], [.26, .19]]) {
          floor(x + dx, y + dy, .12, .12, '#858574', .02);
          for (let k = 0; k < 3; k++) floor(x + dx - .06 + k * .08, y + dy - .1, .045, .06, '#858574', .02);
        }
        break;
      case 'fallen-leaves':
        for (let k = 0; k < 6; k++) floor(x + hash(k, x) * w, y + hash(k, y) * d, .16, .1, v === 1 ? '#c3b77e' : v === 2 ? '#b4a879' : color.leafMid, .02); break;
      case 'well-cover':
        floor(x, y, w, d, color.stoneDark, .02); floor(x + .15, y + .15, w - .3, d - .3, color.stoneLight, .03);
        line([x + .3, y + d / 2, .04], [x + w - .3, y + d / 2, .04], '#8b9181'); break;
      case 'woven-mat':
        floor(x, y, w, d, color.brass, .02);
        for (let dx = .1; dx < w; dx += .16) line([x + dx, y, .03], [x + dx, y + d, .03], '#aa946b'); break;
      case 'stone-table':
        box(x + w * .35, y + d * .35, w * .3, d * .3, .75, color.stoneDark);
        box(x, y, w, d, .2, color.stoneLight, color.stoneDark, color.stoneDark, .75);
        box(x + .4, y + .35, .3, .3, .2, color.cream, color.cream, color.brickLight, .95); break;
      case 'stool':
        for (const dx of [.05, w - .15]) for (const dy of [.05, d - .15]) box(x + dx, y + dy, .12, .12, .5, color.woodDark);
        box(x, y, w, d, .13, color.wood, color.woodDark, color.woodDark, .5); break;
      case 'wash-basin':
        box(x, y, w, d, .75, color.stoneLight, color.stoneDark, color.stoneDark);
        floor(x + .13, y + .12, w - .26, d - .24, color.roofDark, .76);
        floor(x + .25, y + .23, w - .5, d - .46, color.glass, .77);
        line([x + w / 2, y, .8], [x + w / 2, y, 1.25], color.roof, 2); break;
      case 'water-jar': case 'bucket':
        box(x + .1, y + .1, w - .2, d - .2, p.kind === 'water-jar' ? 1.2 : .45, color.roofLight, color.roof, color.roofDark);
        floor(x, y, w, d, color.roofDark, p.kind === 'water-jar' ? 1.24 : .48);
        floor(x + .15, y + .15, w - .3, d - .3, color.glass, p.kind === 'water-jar' ? 1.25 : .49); break;
      case 'bowl':
        box(x, y, w, d, .13, color.cream, color.stoneDark, color.stoneDark);
        floor(x + .1, y + .1, w - .2, d - .2, color.glass, .14); break;
      case 'bird-bath':
        box(x + .35, y + .35, .3, .3, 1.2, color.stoneDark);
        box(x, y, w, d, .14, color.stoneLight, color.stoneDark, color.stoneDark, 1.2);
        floor(x + .14, y + .14, w - .28, d - .28, color.glass, 1.35); break;
      case 'basket':
        box(x, y, w, d, .6, '#b8a078', '#a58a63', '#927953');
        for (let z = .1; z < .6; z += .15) line([x, y + d, z], [x + w, y + d, z], '#cfb98c'); break;
      case 'watering-can':
        box(x, y, w, d, .5, color.roofLight, color.roof, color.roofDark);
        line([x + w, y + d / 2, .3], [x + w + .45, y + d / 2, .75], color.roof, 3); break;
      case 'utility-box':
        box(x, y, w, d, 1.05, '#a8a997', '#929985', '#7b8877');
        line([x + .1, y + d + .02, .5], [x + w - .1, y + d + .02, .5], color.ink); break;
    }
  }
  ctx.restore();
};

export function drawCat(ctx: CanvasRenderingContext2D, view: CourtyardView, point: Point, black: boolean, relaxed: boolean) {
  const { box, line, polygon } = painter(ctx, view);
  const { x, y } = point, fur = black ? '#39433f' : '#e8e5d6', shade = black ? '#536058' : '#c5c8b8';
  const head = relaxed ? .7 : .49;
  box(x - .45, y - .17, .85, .36, .4, fur, shade, shade, .12);
  box(x + .25, y - .19, .36, .38, .35, fur, fur, shade, head - .15);
  for (const dy of [-.18, .1]) {
    polygon([[x + .3, y + dy, head + .15], [x + .45, y + dy, head + .15], [x + .34, y + dy, head + .43]], fur);
    box(x + .1, y + dy, .3, .12, .12, fur);
  }
  line([x + .62, y + .21, head], [x + .65, y + .21, head], black ? '#c7b573' : '#637b6e', 2);
  line([x + .62, y + .15, head - .12], [x + .76, y + .33, head - .12], '#a9ae9e');
  const wave = view.reducedMotion ? 0 : Math.sin(view.elapsedMs / 850) * .07;
  line([x - .42, y, .4], [x - .7, y + .15, black ? .9 + wave : .18], fur, 3);
  line([x - .7, y + .15, black ? .9 + wave : .18], [x - .45, y + .38, black ? 1.1 + wave : .18], shade, 2);
}
