import type { DrawMap, WorldRenderObject, WorldRenderView } from '../../render-contract';
import type { WorldMapDefinition } from '../../schema';

type Prop = WorldMapDefinition['props'][number];
const wood = '#a27c50', pale = '#cfb687', ink = '#554b39', paper = '#e6d9b5';
function polygon(ctx: CanvasRenderingContext2D, view: WorldRenderView, points: [number, number, number][], colour: string) {
  ctx.fillStyle = view.shadeColor?.(colour) ?? colour; ctx.beginPath();
  points.forEach(([x, y, z], i) => { const p = view.project({ x, y }, z); if (i) ctx.lineTo(Math.round(p.x), Math.round(p.y)); else ctx.moveTo(Math.round(p.x), Math.round(p.y)); });
  ctx.closePath(); ctx.fill();
}
function box(ctx: CanvasRenderingContext2D, view: WorldRenderView, x: number, y: number, z: number, w: number, h: number, height: number, colour: string) {
  const hex = colour.replace('#', ''), channels = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  const dark = (amount: number) => `#${channels.map(v => Math.round(v * amount).toString(16).padStart(2, '0')).join('')}`;
  const top = z + height;
  polygon(ctx, view, [[x, y + h, z], [x + w, y + h, z], [x + w, y + h, top], [x, y + h, top]], dark(.77));
  polygon(ctx, view, [[x + w, y, z], [x + w, y + h, z], [x + w, y + h, top], [x + w, y, top]], dark(.65));
  polygon(ctx, view, [[x, y, top], [x + w, y, top], [x + w, y + h, top], [x, y + h, top]], colour);
}
function stroke(ctx: CanvasRenderingContext2D, view: WorldRenderView, a: [number, number, number], b: [number, number, number], colour: string, width = 1) {
  const start = view.project({ x: a[0], y: a[1] }, a[2]), end = view.project({ x: b[0], y: b[1] }, b[2]);
  ctx.strokeStyle = view.shadeColor?.(colour) ?? colour; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(Math.round(start.x), Math.round(start.y)); ctx.lineTo(Math.round(end.x), Math.round(end.y)); ctx.stroke();
}
function furniture(ctx: CanvasRenderingContext2D, view: WorldRenderView, prop: Prop) {
  const { x, y } = prop.position, w = prop.width, h = prop.height;
  const b = (dx: number, dy: number, z: number, width: number, depth: number, height: number, colour: string) => box(ctx, view, x + dx, y + dy, z, width, depth, height, colour);
  if (prop.kind === 'reading-table') {
    for (const dx of [.13, w - .26]) for (const dy of [.13, h - .26]) b(dx, dy, 0, .13, .13, 1.05, ink);
    b(.1, .1, .76, w - .2, .12, .13, wood); b(.1, h - .22, .76, w - .2, .12, .13, wood);
    b(0, 0, 1.02, w, h, .18, wood); b(.05, .05, 1.2, w - .1, h - .1, .035, pale);
    for (let at = .32; at < w - .1; at += .55) stroke(ctx, view, [x + at, y + .12, 1.237], [x + at, y + h - .12, 1.237], '#b79869');
    b(.16, .12, 1.24, .28, .07, .012, '#dcca9d');
  } else {
    for (const dx of [.15, w - .27]) for (const dy of [.15, h - .27]) b(dx, dy, 0, .12, .12, .67, ink);
    b(.06, .06, .67, w - .12, h - .12, .16, wood); b(.15, .15, .83, w - .3, h - .3, .04, pale);
    if (prop.variant === 1) {
      for (const dy of [.08, h - .2]) b(.07, dy, .7, .12, .12, 1, wood);
      for (const z of [1.1, 1.43]) b(.07, .08, z, .14, h - .16, .13, pale);
    } else {
      for (const dx of [.08, w - .2]) b(dx, .07, .7, .12, .12, 1, wood);
      for (const z of [1.1, 1.43]) b(.08, .07, z, w - .16, .14, .13, pale);
    }
  }
}
function drawProp(ctx: CanvasRenderingContext2D, view: WorldRenderView, p: Prop) {
  const { x, y } = p.position, w = p.width, h = p.height;
  const b = (dx: number, dy: number, z: number, width: number, depth: number, height: number, colour: string) => box(ctx, view, x + dx, y + dy, z, width, depth, height, colour);
  switch (p.kind) {
    case 'reading-wall':
      b(0, 0, 0, w, h, 2.9, '#e0d1ac'); b(0, 0, .08, w, h + .035, .18, '#827353'); b(0, 0, 2.67, w, h + .05, .1, pale);
      if (w > h) for (let at = .2; at < w; at += .65) b(at, h, .6, .025, .012, .7, '#d6c8a5');
      break;
    case 'reading-low-wall': b(0, 0, 0, w, h, .28, '#c3b18b'); b(0, 0, .28, w + .06, h, .07, pale); break;
    case 'reading-window': {
      b(-.15, .35, .86, w + .3, .2, 2.2, ink); b(-.05, .56, 1, w + .1, .045, 1.9, '#799a9d');
      for (let pane = 0; pane < w; pane += .75) {
        const span = Math.min(.56, w - pane - .1);
        b(pane + .09, .615, 1.09, span, .015, .55, '#7e9b8b');
        b(pane + .21, .635, 1.35, .055, .016, .65, '#567b70');
        b(pane + .12, .635, 1.72, Math.min(.3, span), .016, .2, '#668d7d');
        b(pane + .13, .635, 2.4, span * .55, .014, .3, '#c3d4cc');
        b(pane, .62, 1, .07, .05, 1.9, pale);
        b(pane + .1, .63, 2.1, Math.min(.48, w - pane - .1), .015, .12, '#bed2c8');
      }
      b(0, .62, 1.85, w, .07, .08, wood); b(-.25, .35, .8, w + .5, .6, .12, pale);
      for (const dx of [-.28, w + .05]) {
        b(dx, .28, .9, .22, .15, 2.1, '#b6b38c');
        for (let z = 1.05; z < 2.9; z += .23) b(dx, .44, z, .22, .025, .07, '#d0c69f');
      }
      break;
    }
    case 'reading-shelf': {
      const low = p.variant === 'low', scale = low ? .4 : 1;
      b(0, 0, .12, w, h, 1.95 * scale, '#805f40'); b(.09, .1, .24 * scale, w - .18, h - .1, 1.73 * scale, '#65533d');
      for (const z of [.24, .86, 1.48, 2.1]) b(-.04, -.03, z * scale, w + .08, h + .08, .1 * scale, wood);
      const colours = ['#839b8a', '#bfaa77', '#9b8f94', '#7e9ca4', '#d5c6a0', '#8f795e'];
      for (let level = 0; level < 3; level++) for (let i = 0; i < Math.floor((w - .2) / .18); i++) {
        const dx = .12 + i * .18, z = (.34 + level * .62) * scale, height = (.38 + ((i + level * 3) % 4) * .045) * scale;
        b(dx, h - .27, z, .145, .24, height, colours[(i + level * 2 + (low ? 0 : Number(p.variant))) % colours.length]);
        b(dx + .02, h - .021, z + .1 * scale, .105, .022, .025 * scale, '#deceaa');
      }
      b(-.06, -.02, 2.2 * scale, w + .12, h + .08, .1 * scale, pale);
      for (let stack = 0; stack < Math.max(1, Math.floor(w / .65)); stack++) {
        const dx = .14 + stack * .65, top = 2.3 * scale;
        for (let book = 0; book < 2 + stack % 2; book++) {
          b(dx + book % 2 * .04, .2 + stack % 2 * .12, top + book * .085, Math.min(.46, w - dx - .04), Math.min(.65, h - .26), .075, colours[(stack + book + (low ? 3 : 0)) % colours.length]);
          b(dx + .03, .21 + stack % 2 * .12, top + book * .085 + .025, Math.min(.4, w - dx - .09), Math.min(.61, h - .3), .028, paper);
        }
      }
      break;
    }
    case 'reading-table': case 'reading-chair': furniture(ctx, view, p); break;
    case 'reading-open-book':
      b(0, 0, 1.24, w, h, .05, '#839b8a'); b(.03, .02, 1.29, w / 2 - .04, h - .04, .03, paper); b(w / 2 + .01, .02, 1.29, w / 2 - .04, h - .04, .03, '#f2e6c6');
      for (let row = .15; row < h - .1; row += .11) { b(.08, row, 1.325, w * .3, .013, .003, '#b4aa8c'); b(w * .6, row, 1.325, w * .3, .013, .003, '#b4aa8c'); }
      b(w + .25, h * .5, 1.24, .2, .2, .18, '#b7c3a8'); b(w + .28, h * .5 + .03, 1.42, .14, .14, .015, '#71634d');
      break;
    case 'reading-cart':
      for (const dx of [.15, w - .3]) for (const dy of [.15, h - .3]) b(dx, dy, .05, .16, .16, .18, ink);
      for (const z of [.26, 1.02]) b(0, 0, z, w, h, .12, wood);
      for (const dx of [.05, w - .18]) for (const dy of [.05, h - .18]) b(dx, dy, .26, .13, .13, 1.2, '#667b70');
      for (let i = 0; i < 5; i++) b(.2 + i * .34, .2, 1.14, .27, h - .4, .13 + i % 2 * .09, ['#ad9871', '#839b8a', '#b4a0a5'][i % 3]);
      b(.1, h - .18, 1.45, w - .2, .1, .09, '#a2b39c'); break;
    case 'reading-notice':
      furniture(ctx, view, { ...p, kind: 'reading-table' });
      b(.25, .2, 1.24, w - .5, h - .4, .03, paper);
      for (const dx of [.45, 1.35]) { b(dx, .33, 1.28, .4, .28, .015, '#aabcab'); b(dx, .8, 1.28, .4, .04, .015, '#b9aa83'); }
      b(.05, .12, 1.24, .1, .7, .05, ink); break;
    case 'reading-plant':
      b(.2, .2, 0, w - .4, h - .4, .55, '#9c8761'); b(.16, .16, .5, w - .32, h - .32, .15, '#c2ac7e'); b(.26, .26, .66, w - .52, h - .52, .02, '#6a5941');
      for (let i = 0; i < 7; i++) {
        const angle = i * 2.4, dx = w / 2 + Math.cos(angle) * .36, dy = h / 2 + Math.sin(angle) * .3, z = .8 + i % 3 * .25;
        stroke(ctx, view, [x + w / 2, y + h / 2, .65], [x + dx, y + dy, z], '#708565');
        polygon(ctx, view, [[x + dx, y + dy, z], [x + dx + .22, y + dy + .08, z + .2], [x + dx + .06, y + dy + .2, z + .25], [x + dx - .12, y + dy + .05, z + .1]], i % 2 ? '#8ca17a' : '#6d8a6b');
      }
      break;
    case 'reading-lamp':
      b(0, 0, .02, w, h, .09, ink); b(w * .45, h * .45, .1, .07, .07, 1.8, '#8e7953');
      b(-.2, -.2, 1.6, w + .4, h + .4, .08, '#c3ab76'); b(-.14, -.14, 1.68, w + .28, h + .28, .4, '#e4d4a5'); b(-.04, -.04, 2.08, w + .08, h + .08, .08, pale); break;
    case 'reading-entry':
      for (const dx of [0, w - .18]) { b(dx, 0, 0, .18, h, 2.5, ink); b(dx + .03, .05, .15, .12, h - .1, 2.35, wood); }
      b(-.04, .1, 2.5, w + .08, h - .2, .18, pale);
      b(.2, .1, .02, w - .4, h - .2, .06, '#b4b5a0'); b(.25, .15, .08, w - .5, h - .3, .02, '#d3ceb0');
      for (const yy of [.2, h - .2]) stroke(ctx, view, [x + .3, y + yy, .105], [x + w - .3, y + yy, .105], '#8e947f');
      break;
  }
}
export const drawMap: DrawMap = (ctx, map, view) => {
  if (map.id !== 'reading-room' || view.pass !== 'ground') return;
  ctx.fillStyle = view.shadeColor?.('#857e65') ?? '#857e65'; ctx.fillRect(0, 0, view.width, view.height);
  box(ctx, view, 2, 3, -.12, 26, 17, .1, '#b89c6c');
  for (let y = 3; y < 20; y += .5) for (let x = 2; x < 28; x += 2) {
    const offset = Math.round(y * 2) % 2 ? 1 : 0, start = Math.max(2, x - offset), end = Math.min(28, x + 2 - offset);
    const c = ['#b89c6c', '#bfa575', '#c3aa7c', '#b49a6a'][(x * 3 + Math.round(y * 2)) % 4];
    box(ctx, view, start, y, -.1, end - start - .025, .48, .1, c);
    if ((x * 7 + y * 2) % 9 === 0) stroke(ctx, view, [start + .2, y + .2, .002], [end - .2, y + .23, .002], '#a68a5e');
  }
  for (const p of map.props.filter(prop => prop.layer === 'ground')) {
    const { x, y } = p.position, w = p.width, h = p.height;
    if (p.kind === 'reading-inlay') {
      const rug = p.variant === 1 ? '#9eaa94' : '#8c9d8d';
      box(ctx, view, x, y, .006, w, h, .015, '#6d7e72');
      box(ctx, view, x + .13, y + .13, .022, w - .26, h - .26, .005, rug);
      box(ctx, view, x + .35, y + .35, .028, w - .7, h - .7, .003, p.variant === 1 ? '#bdc0a2' : '#b0b99b');
      for (let at = .55; at < h - .4; at += .24) stroke(ctx, view, [x + .4, y + at, .033], [x + w - .4, y + at, .033], p.variant === 1 ? '#afb597' : '#a4af92');
      for (const yy of [y, y + h]) stroke(ctx, view, [x, yy, .012], [x + w, yy, .012], '#8e805d');
      for (const xx of [x, x + w]) stroke(ctx, view, [xx, y, .012], [xx, y + h, .012], '#8e805d');
    } else if (p.kind === 'reading-mat') {
      box(ctx, view, x, y, .01, w, h, .025, '#8e9478'); box(ctx, view, x + .12, y + .12, .04, w - .24, h - .24, .005, '#c5bc95');
      for (let at = .25; at < w - .2; at += .18) stroke(ctx, view, [x + at, y + .18, .046], [x + at, y + h - .18, .046], '#afa985');
    } else if (p.kind === 'reading-sunlight') {
      ctx.save(); ctx.globalAlpha *= .28;
      polygon(ctx, view, [[x, y, .02], [x + w, y, .02], [x + w + 1.3, y + h, .02], [x + 1.3, y + h, .02]], '#f6e3ab'); ctx.restore();
      for (const at of [.3, 1.5]) stroke(ctx, view, [x + at, y, .025], [x + at + 1.3, y + h, .025], '#cab584');
    } else if (p.kind === 'reading-draft') {
      ctx.save();ctx.globalAlpha *= .36;
      furniture(ctx, view, { ...p, kind: w === 1.5 && h === 1.5 ? 'reading-chair' : 'reading-table', variant: h > w ? 1 : 0 });ctx.restore();
      const colour = p.variant === 'valid' ? '#f1e6be' : '#6b5e49';
      for (const yy of [y, y + h]) stroke(ctx, view, [x, yy, .045], [x + w, yy, .045], colour, 2);
      for (const xx of [x, x + w]) stroke(ctx, view, [xx, y, .045], [xx, y + h, .045], colour, 2);
      if (p.variant === 'blocked') for (let at = .3; at < w; at += .4) stroke(ctx, view, [x + at, y, .05], [x + Math.min(w, at + .4), y + Math.min(h, .4), .05], colour);
    }
  }
};
export function renderObjects(map: WorldMapDefinition): WorldRenderObject[] {
  if (map.id !== 'reading-room') return [];
  return map.props.filter(p => p.layer === 'object').flatMap(p => {
    const parts = p.kind === 'reading-wall' ? Array.from({ length: Math.ceil(Math.max(p.width, p.height)) }, (_, i) => {
      const alongX = p.width > p.height;
      return { ...p, id: `${p.id}.${i}`, position: { x: p.position.x + (alongX ? i : 0), y: p.position.y + (alongX ? 0 : i) }, width: alongX ? Math.min(1, p.width - i) : p.width, height: alongX ? p.height : Math.min(1, p.height - i) };
    }) : [p];
    return parts.map(part => ({
      id: part.id, position: { x: part.position.x + part.width / 2, y: part.position.y + part.height / 2 },
      depth: p.kind === 'reading-window' ? p.position.x + p.width + p.position.y + .7 : p.kind === 'reading-open-book' ? (() => { const table = map.props.find(candidate => `${candidate.id}.book` === p.id)!; return table.position.x + table.position.y + (table.width + table.height) / 2 + .01; })() : undefined,
      occlusion: p.kind === 'reading-wall' ? { rect: { ...part.position, width: part.width, height: part.height }, height: 2.9, fadeWhenPlayerBehind: true } : map.occluders.find(o => o.id === p.id),
      draw(ctx: CanvasRenderingContext2D, view: WorldRenderView) { drawProp(ctx, view, part); },
    }));
  });
}
