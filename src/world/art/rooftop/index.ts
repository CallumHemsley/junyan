import type {DrawMap} from '../../render-contract';
import type {Point, WorldMapDefinition} from '../../schema';
type Prop = WorldMapDefinition['props'][number];
const palette = {
  ink: '#484c43', roof: '#c6c4ad', mortar: '#afb19e', edge: '#939987',
  cream: '#f5e8ca', jade: '#6f9a86', leaf: '#507856', leafLight: '#91aa72',
  wood: '#8f7957', woodLight: '#b79b6c', woodDark: '#685b44',
  soil: '#76634c', wetSoil: '#514f40', pot: '#b39a74', potLight: '#d1b489',
  pipe: '#8bada9', metal: '#7e9993', lavender: '#b9adcc', flower: '#e4c788',
};

export const drawMap: DrawMap = (ctx, map, view) => {
  const project = (x: number, y: number, z = 0) => {
    const p = view.project({x, y}, z);
    return {x: Math.round(p.x), y: Math.round(p.y)};
  };
  const polygon = (points: Point[], color: string) => {
    ctx.fillStyle = color; ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath(); ctx.fill();
  };
  const plane = (x: number, y: number, w: number, h: number, z: number, color: string) =>
    polygon([project(x, y, z), project(x + w, y, z), project(x + w, y + h, z), project(x, y + h, z)], color);
  const box = (x: number, y: number, w: number, h: number, z: number, height: number, top: string, front = palette.wood, side = palette.woodDark) => {
    polygon([project(x, y + h, z), project(x + w, y + h, z), project(x + w, y + h, z + height), project(x, y + h, z + height)], front);
    polygon([project(x + w, y, z), project(x + w, y + h, z), project(x + w, y + h, z + height), project(x + w, y, z + height)], side);
    plane(x, y, w, h, z + height, top);
  };
  const stem = (a: Point, b: Point, za: number, zb: number, color: string, width = 1) => {
    const p = project(a.x, a.y, za), q = project(b.x, b.y, zb);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
  };
  const cluster = (x: number, y: number, z: number, size: number, color: string, seed = 0) => {
    const p = project(x, y, z), px = Math.abs(project(x + size, y).x - project(x, y).x);
    const radius = Math.max(2, px);
    ctx.fillStyle = palette.leaf;
    ctx.fillRect(p.x - radius, p.y - radius * .65, radius * 2, Math.max(2, radius * 1.2));
    ctx.fillStyle = color;
    ctx.fillRect(p.x - radius * .8, p.y - radius, radius * 1.5, radius * 1.3);
    ctx.fillRect(p.x - radius * 1.15, p.y - radius * .35, radius * 1.8, radius * .65);
    ctx.fillStyle = palette.leafLight;
    for (let k = 0; k < 4; k++) ctx.fillRect(Math.round(p.x + ((k * 7 + seed * 3) % 13 - 6) / 8 * radius), Math.round(p.y + ((k * 3 + seed) % 5 - 4) / 6 * radius), 2, 1);
  };
  const bed = (p: Prop, kind: number) => {
    const {x, y} = p.position, w = p.width, h = p.height;
    box(x, y, w, h, 0, .55, palette.potLight, palette.pot, palette.woodDark);
    plane(x + .15, y + .15, w - .3, h - .3, .57, palette.soil);
    for (let a = .4; a < w - .1; a += .7) for (let b = .4; b < h - .1; b += .65) {
      const tall = kind === 2 ? 1.15 + ((a * 5 + b * 7) % 4) * .14 : .8;
      stem({x: x + a, y: y + b}, {x: x + a, y: y + b}, .55, tall, palette.leaf);
      cluster(x + a, y + b, tall, .3, kind === 1 ? palette.leafLight : palette.jade, Math.floor(a * 10));
      if (kind === 2) {
        const q = project(x + a, y + b, tall + .1);
        ctx.fillStyle = (Math.floor(a * 10 + b) % 2) ? palette.lavender : palette.flower;
        ctx.fillRect(q.x - 2, q.y - 2, 4, 4); ctx.fillStyle = palette.cream; ctx.fillRect(q.x, q.y - 1, 1, 1);
      }
    }
  };
  const tree = (x: number, y: number, growth = 3, droop = false) => {
    const height = 1.4 + growth * .48, lean = droop ? .5 : 0;
    stem({x, y}, {x: x + lean, y}, .55, height, palette.woodDark, 3);
    for (let i = 0; i < 3 + growth; i++) {
      const a = i * 2.4, dx = Math.cos(a) * (.3 + growth * .12), dy = Math.sin(a) * (.25 + growth * .1);
      stem({x, y}, {x: x + dx + lean, y: y + dy}, height - .65, height - .2 + i % 2 * .2, palette.woodDark);
      cluster(x + dx + lean, y + dy, height + i % 2 * .3 - (droop ? .5 : 0), .4 + growth * .07, i % 2 ? palette.jade : palette.leafLight, i);
    }
  };
  const bench = (p: Prop) => {
    const {x, y} = p.position, w = p.width;
    for (const dx of [.2, w - .4]) box(x + dx, y + .1, .16, .7, 0, .7, palette.woodDark);
    for (let k = 0; k < 3; k++) box(x, y + k * .28, w, .22, .65, .12, palette.woodLight);
    for (const dx of [.1, w - .2]) box(x + dx, y + .08, .12, .12, .7, 1.1, palette.woodDark);
    for (let k = 0; k < 3; k++) box(x, y + .03, w, .12, 1 + k * .25, .18, palette.woodLight);
  };
  const skyline = () => {
    for (let layer = 0; layer < 3; layer++) for (let i = 0; i < 13; i++) {
      const x = -8 + i * 5.1 + layer * 1.7, y = -16 + layer * 5 + (i % 3),
        h = 2.6 + (i * 7 % 9) * .5, w = 3 + i % 3;
      const colors = [['#bccacd', '#b0c1c5', '#aabdc2'], ['#aabbb8', '#99aba8', '#92a7a4'], ['#a8ad9b', '#929b89', '#838f7e']][layer];
      box(x, y, w, 3.4, -4, h, colors[0], colors[1], colors[2]);
      box(x - .15, y - .15, w + .3, 3.7, h - 4, .22, colors[2], colors[1], colors[2]);
      if (layer > 0) {
        for (let floor = -2.8; floor < h - 4 - .8; floor += 1.1)
          for (let window = .5; window < w - .2; window += .9) plane(x + window, y + 3.42, .35, .04, floor + .55, '#d8d5bc');
        if (i % 3 === 0) box(x + .5, y + .5, 1, 1, h - 3.8, .7, '#9dada5', colors[2], colors[2]);
        if (i % 4 === 0) stem({x: x + 1, y: y + 1}, {x: x + 1, y: y + 1}, h - 3.7, h - 1.7, colors[2]);
      }
    }
  };
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if (view.pass === 'ground') {
    skyline();
    for (const {rect: r, material} of map.terrain) {
      const wood = material === 'roof-wood', brick = material === 'roof-brick';
      for (let y = r.y; y < r.y + r.height; y++) for (let x = r.x; x < r.x + r.width; x++) {
        const n = (x * 17 + y * 31) % 7;
        const base = wood ? ['#a28e68', '#ad9872', '#b09b73'][n % 3] : brick ? ['#bcbaa2', '#c7c2a6', '#b7b79f'][n % 3] : ['#c6c4ad', '#cecab3', '#c2c1ab'][n % 3];
        plane(x + .018, y + .018, Math.min(.97, r.x + r.width - x), Math.min(.97, r.y + r.height - y), .005, base);
        if (n === 0) plane(x + .2, y + .35, .35, .06, .01, wood ? '#918362' : '#b3b59f');
      }
    }
  }
  if (view.pass === 'ground') {
    ctx.save(); ctx.globalAlpha = .13;
    for (const p of map.props) {
      if (p.layer === 'ground' || p.kind === 'parapet') continue;
      if (p.kind === 'pergola' || p.kind === 'garden-shade') {
        for (let k = 0; k < p.width; k += .65) plane(p.position.x + k + .6, p.position.y + .7, .18, p.height, .02, '#526851');
      } else plane(p.position.x + .5, p.position.y + .45, p.width + .1, p.height + .2, .02, '#526851');
    }
    ctx.restore();
  }
  const props = map.props.filter(p => view.pass === 'ground' ? p.layer === 'ground' : view.pass === 'foreground' ? p.layer === 'foreground' : p.layer === 'object').sort((a, b) => a.position.x + a.position.y - b.position.x - b.position.y);
  for (const p of props) {
    const {x, y} = p.position, w = p.width, h = p.height, variant = Number(p.variant) || 0;
    if (p.kind === 'parapet') {
      box(x, y, w, h, -.35, 1.1, '#d2ceb4', '#a6ac95', '#939c88');
      box(x - .08, y - .08, w + .16, h + .16, .75, .14, '#e3dcc0', '#b1b69d', '#9ba58e');
      for (let i = 1; i < Math.max(w, h); i += 2.7) plane(x + (w > h ? i : .2), y + (w > h ? .2 : i), .3, .4, .9, '#b7bea2');
    } else if (p.kind === 'stairhead') {
      box(x, y, w, h, 0, 3.7, '#b6bdab', '#a6ad98', '#8c9a89');
      for (let k = 0; k < 8; k++) box(x + k * w / 8 - .2, y - .2, w / 8, h + .4, 3.7, .22, k % 2 ? '#83958b' : '#94a496', '#72867d', '#687d74');
      polygon([project(x + w + .01, y + 2.8), project(x + w + .01, y + 5.2), project(x + w + .01, y + 5.2, 2.8), project(x + w + .01, y + 2.8, 2.8)], '#4b5d53');
      box(x + w, y + 2.55, .18, 2.95, 2.8, .16, palette.cream);
      for (let k = 0; k < 4; k++) box(x + .4 + k * .75, y + h + .02, .32, .08, 2.1, .75, '#b9c9bd', '#98b6ab', '#78988e');
    } else if (p.kind === 'stairs') {
      for (let k = 0; k < 6; k++) box(x + k * w / 6, y, w / 6, h, 0, .6 - k * .085, '#d8d2b7', '#b9bba4', '#a7ae98');
      stem({x: x + .2, y}, {x: x + w, y}, 1.2, .7, palette.woodDark, 2);
      stem({x: x + .2, y: y + h}, {x: x + w, y: y + h}, 1.2, .7, palette.woodDark, 2);
    } else if (p.kind === 'water-tank') {
      box(x - .15, y - .15, w + .3, h + .3, 0, .3, '#8f9a89');
      box(x, y, w, h, .3, 2.7, '#a8b6a3', '#839e90', '#658b7e');
      for (const z of [.6, 2.1, 2.85]) box(x - .08, y - .08, w + .16, h + .16, z, .1, '#c3c9ae', '#9cad98', '#7e9c89');
      box(x + 1.1, y + 1.1, 1.8, 1.8, 3, .18, '#c6c9ac', '#879f8d', '#6d897e');
      stem({x: x + w, y: y + 3}, {x: x + w + .5, y: y + 3}, 1.1, 1.1, palette.pipe, 3);
    } else if (p.kind === 'basin') {
      box(x, y, w, h, 0, .8, '#b9bda8', '#929c8e', '#7d8e83');
      plane(x + .2, y + .2, w - .4, h - .4, .82, '#657f76');
      plane(x + .4, y + .4, w - .8, h - .8, .83, '#a9c1b4');
      stem({x: x + .3, y: y + .3}, {x: x + .3, y: y + .3}, .8, 1.65, palette.pipe, 3);
      stem({x: x + .3, y: y + .3}, {x: x + .8, y: y + .3}, 1.65, 1.65, palette.pipe, 3);
    } else if (p.kind === 'tool-bay') {
      box(x, y, w, h, 0, 1.65, '#a59b7d', '#928b70', '#7b7b64');
      for (let k = 0; k < 5; k++) box(x + .2 + k * .7, y + h, .07, .08, .2, 1.25, palette.woodDark);
      box(x - .1, y - .1, w + .2, h + .2, 1.65, .18, '#b9b79a');
      for (let k = 0; k < 3; k++) stem({x: x + .4 + k, y: y + .5}, {x: x + .6 + k, y: y + .8}, 1.8, 2.7, palette.woodDark, 2);
    } else if (p.kind === 'raised-bed' || p.kind === 'trellis-bed' || p.kind === 'tree-bed') {
      bed(p, p.kind === 'tree-bed' ? 0 : variant);
      if (p.kind === 'tree-bed') for (let k = 1; k < w; k += 2.3) tree(x + k, y + h / 2, 3);
      if (p.kind === 'trellis-bed') {
        for (let k = 0; k <= w; k += 2) stem({x: x + k, y: y + h / 2}, {x: x + k, y: y + h / 2}, .5, 3, palette.wood, 2);
        for (let z = 1; z < 3.1; z += .6) stem({x, y: y + h / 2}, {x: x + w, y: y + h / 2}, z, z, palette.woodLight);
        for (let k = 0; k < w; k += .7) cluster(x + k, y + h / 2, 1.3 + k % 1.7, .35, palette.jade, Math.floor(k * 10));
      }
    } else if (p.kind === 'bench') bench(p);
    else if (p.kind === 'tea-table') {
      for (const dx of [.15, w - .3]) for (const dy of [.15, h - .3]) box(x + dx, y + dy, .15, .15, 0, .9, palette.woodDark);
      box(x, y, w, h, .9, .13, palette.woodLight);
      box(x + .4, y + .5, .35, .35, 1.03, .3, '#b9cbb6', '#96b7a7', '#779b8a');
      for (const dx of [1, 1.5]) box(x + dx, y + .8, .22, .22, 1.03, .15, palette.cream);
    } else if (p.kind === 'post') box(x, y, w, h, 0, 3.3, palette.woodLight);
    else if (p.kind === 'pergola' || p.kind === 'garden-shade') {
      const shade = p.kind === 'garden-shade', z = shade ? 2.85 : 3.3;
      const behind = view.playerPosition.x >= x - .5 && view.playerPosition.x <= x + w + .5 && view.playerPosition.y >= y - 2 && view.playerPosition.y <= y + h + .5;
      ctx.save(); ctx.globalAlpha = behind ? .33 : 1;
      for (let k = 0; k < w; k += shade ? .3 : .65) box(x + k, y, shade ? .2 : .16, h, z, .13, shade ? (Math.floor(k * 10) % 2 ? palette.cream : '#b8c5a4') : palette.woodLight);
      if (!shade) for (let k = .6; k < w; k += 1.1) {
        cluster(x + k, y + .2, z + .15, .38, palette.jade, Math.floor(k));
        if (Math.floor(k) % 3 === 0) {
          const q = project(x + k, y + .4, z - .1);ctx.fillStyle = palette.lavender; ctx.fillRect(q.x, q.y, 2, 5);
        }
      }
      ctx.restore();
      if (shade) for (const dx of [0, w - .2]) box(x + dx, y, .15, .15, 0, z, palette.wood);
    } else if (p.kind.startsWith('garden-')) {
      const growth = Math.floor(variant / 6), care = variant % 3, droop = variant % 6 >= 3;
      box(x, y, w, h, 0, .18, palette.woodDark);
      box(x + .1, y + .1, w - .2, h - .2, .18, .6, palette.potLight, palette.pot, '#8d7b5b');
      plane(x + .2, y + .2, w - .4, h - .4, .8, care ? palette.wetSoil : palette.soil);
      if (care === 2) plane(x - .08, y - .08, w + .16, h + .16, .185, '#a6bab1');
      if (p.kind === 'garden-tree') tree(x + w / 2, y + h / 2, growth, droop);
      else {
        if (p.kind === 'garden-climber') {
          for (const dx of [.1, w - .1]) stem({x: x + dx, y: y + .2}, {x: x + dx, y: y + .2}, .4, 3.2, palette.woodLight);
          for (let z = .8; z < 3.3; z += .5) stem({x: x + .1, y: y + .2}, {x: x + w - .1, y: y + .2}, z, z, palette.woodLight);
        }
        const sway = view.reducedMotion ? 0 : Math.sin(view.elapsedMs / 1200 + x) * .05;
        const height = .9 + growth * .45;
        for (let k = 0; k < 3 + growth * 2; k++) {
          const a = k * 2.4, dx = Math.cos(a) * .4 + sway, dy = Math.sin(a) * .4;
          const top = droop ? height * .65 : height;
          stem({x: x + .7, y: y + .7}, {x: x + .7 + dx, y: y + .7 + dy}, .8, top, palette.leaf, 2);
          cluster(x + .7 + dx, y + .7 + dy, top, .22, k % 2 ? palette.jade : palette.leafLight, k);
          if (growth && p.kind === 'garden-flower') {
            const q = project(x + .7 + dx, y + .7 + dy, top + .15);
            ctx.fillStyle = k % 2 ? palette.lavender : palette.cream; ctx.fillRect(q.x - 2, q.y - 2, 4, 4);ctx.fillStyle = palette.flower;ctx.fillRect(q.x, q.y, 1, 1);
          }
        }
      }
    } else if (p.kind === 'border-pot') {
      box(x, y, w, h, 0, .6, palette.potLight, palette.pot, palette.woodDark); cluster(x + .5, y + .5, .85, .4, palette.jade, variant);
    } else if (p.kind === 'compost') {
      box(x, y, w, h, 0, 1, palette.woodDark);
      for (let k = 0; k < 4; k++) box(x, y + h, w, .05, .15 + k * .22, .12, palette.woodLight);
      plane(x + .2, y + .2, w - .4, h - .4, 1.01, '#7b8160');
    } else if (p.kind === 'pipe') box(x, y, w, h, .02, .08, palette.pipe, palette.metal, palette.metal);
    else if (p.kind === 'drain') {
      plane(x, y, w, h, .02, palette.edge);
      for (let k = 0; k < 4; k++) plane(x + .1 + k * .14, y + .1, .07, h - .2, .025, palette.ink);
    } else if (p.kind === 'weathering') {
      for (let k = 0; k < 6; k++) plane(x + ((k * 7) % 11) / 10, y + ((k * 3) % 7) / 10, .12 + k % 2 * .14, .07, .02, k % 2 ? '#aab29a' : '#b4b9a0');
    } else if (p.kind === 'sun-clock') {
      box(x, y, w, h, 0, .7, '#cec8aa', '#b2b196', '#959f88');
      stem({x: x + .5, y: y + .5}, {x: x + .7, y: y + .5}, .7, 1.1, palette.woodDark);
    }
  }
  ctx.restore();
};
