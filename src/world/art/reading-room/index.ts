import type { DrawMap, WorldRenderObject, WorldRenderView } from '../../render-contract';
import type { WorldMapDefinition } from '../../schema';

type Prop = WorldMapDefinition['props'][number];
const wood = '#88613f', pale = '#c7aa75', ink = '#3e352c', paper = '#e6d9b5';
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
    b(0, 0, 1.02, w, h, .18, '#66503a'); b(.05, .05, 1.2, w - .1, h - .1, .035, '#c7ab76');
    for (let at = .32; at < w - .1; at += .55) stroke(ctx, view, [x + at, y + .12, 1.237], [x + at, y + h - .12, 1.237], '#ac8b5f');
    stroke(ctx, view, [x, y + h, 1.19], [x + w, y + h, 1.19], '#493c2c');
    stroke(ctx, view, [x + w, y, 1.19], [x + w, y + h, 1.19], '#493c2c');
    for (const [dx, dy, length] of [[.18, .16, .28], [w * .6, h - .2, .26], [w * .42, h * .5, .18]]) stroke(ctx, view, [x + dx, y + dy, 1.24], [x + dx + length, y + dy + .03, 1.24], '#e0c590');
  } else {
    for (const dx of [.15, w - .27]) for (const dy of [.15, h - .27]) b(dx, dy, 0, .12, .12, .67, ink);
    b(.06, .06, .67, w - .12, h - .12, .16, '#5c4935'); b(.15, .15, .83, w - .3, h - .3, .04, '#a48558');
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
  const book = (dx: number, dy: number, z: number, width: number, depth: number, colour: string) => {
    b(dx, dy, z, width, depth, .1, colour);
    b(dx + .025, dy + .02, z + .025, width - .05, depth - .04, .045, '#d7c9a7');
    b(dx, dy, z + .08, width, depth, .025, colour);
    stroke(ctx, view, [x + dx + .05, y + dy + .05, z + .107], [x + dx + .05, y + dy + depth - .05, z + .107], '#b6a37f');
  };
  switch (p.kind) {
    case 'reading-wall':
      b(0, 0, 0, w, h, 2.9, '#e4dac1');
      b(0, 0, .08, w, h + .035, .96, '#758678');
      b(0, 0, .06, w, h + .06, .16, '#4c594b');
      b(0, 0, 1.04, w, h + .075, .09, '#4d594a');
      b(0, 0, 1.13, w, h + .035, .04, '#a9ad8e');
      b(0, 0, 2.67, w, h + .05, .1, '#947c55');
      if (w > h) b(.12, h + .035, .25, .035, .018, .67, '#899683');
      else b(w, .12, .25, .018, .035, .67, '#899683');
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
      const shelfIndex = Number(p.id.match(/shelf-(\d+)$/)?.[1] ?? (p.id.includes('front') ? 1 : 4));
      b(0, 0, .12, w, h, 1.95 * scale, '#584733'); b(.09, .1, .24 * scale, w - .18, h - .1, 1.73 * scale, '#343b34');
      for (const z of [.24, .86, 1.48, 2.1]) b(-.04, -.03, z * scale, w + .08, h + .08, .1 * scale, '#896c46');
      const colours = ['#456a65', '#a18a52', '#7e6073', '#537885', '#bcaa7b', '#7d593c'];
      for (let level = 0; level < 3; level++) for (let i = 0; i < Math.floor((w - .2) / .18); i++) {
        if ((i + shelfIndex + level * 2) % 7 > 4) continue;
        const dx = .12 + i * .18, z = (.34 + level * .62) * scale, height = (.32 + ((i + level * 3 + shelfIndex) % 5) * .055) * scale;
        b(dx, h - .29, z, i % 3 === 0 ? .17 : .13, .25, height, colours[(i + level * 2 + shelfIndex) % colours.length]);
        b(dx + .02, h - .039, z + .1 * scale, .09, .022, .025 * scale, '#d4bc85');
        if (i % 3 === 0) b(dx + .025, h - .038, z + height - .09 * scale, .08, .021, .018 * scale, '#c8b58c');
      }
      for (const dx of [0, w - .1]) b(dx, h - .1, .12, .1, .13, 2.05 * scale, '#4b3e2d');
      b(-.06, -.02, 2.2 * scale, w + .12, h + .08, .1 * scale, '#927149');
      stroke(ctx, view, [x - .06, y + h + .06, 2.3 * scale], [x + w + .06, y + h + .06, 2.3 * scale], '#4a3b2b');
      const top = 2.3 * scale;
      if (p.id.includes('front')) {
        book(.12, .25, top, .72, .9, '#7e6073');
        book(.15, .2, top + .105, .65, .83, '#a18a52');
        b(.12, 1.75, top, .68, .9, .14, '#d8c9a6');
        stroke(ctx, view, [x + .2, y + 1.8, top + .15], [x + .2, y + 2.55, top + .15], '#827253');
      } else if (!low && !p.id.includes('shelf-')) {
        book(.2, .16, top, .65, .78, '#456a65'); book(.23, .12, top + .105, .65, .78, '#7e6073');
        book(w - .8, .12, top, .55, .85, '#a18a52');
      } else if (shelfIndex % 4 === 0) {
        book(.16, .25, top, .85, .88, '#456a65'); book(.22, .19, top + .105, .75, .83, '#a18a52');
      } else if (shelfIndex % 4 === 1) {
        b(.18, .28, top, .83, .8, .14, '#d6c6a1');
        for (const at of [.46, .68, .9]) stroke(ctx, view, [x + .25, y + at, top + .15], [x + .82, y + at, top + .15], '#9e8d6b');
        b(.52, .24, top + .15, .06, .9, .018, '#80614f');
      } else if (shelfIndex % 4 === 2) {
        book(.3, .32, top, .63, .78, '#537885');
      } else {
        stroke(ctx, view, [x + .2, y + .45, top + .01], [x + .75, y + .48, top + .01], '#b19464');
      }
      break;
    }
    case 'reading-table': case 'reading-chair': furniture(ctx, view, p); break;
    case 'reading-open-book':
      b(0, 0, 1.24, w, h, .05, '#3e5b53'); b(.03, .02, 1.29, w / 2 - .04, h - .04, .03, paper); b(w / 2 + .01, .02, 1.29, w / 2 - .04, h - .04, .03, '#f2e6c6');
      for (const row of [.2, .4]) { stroke(ctx, view, [x + .08, y + row, 1.33], [x + w * .38, y + row, 1.33], '#ad9b78'); stroke(ctx, view, [x + w * .6, y + row, 1.33], [x + w * .9, y + row, 1.33], '#ad9b78'); }
      stroke(ctx, view, [x + w / 2, y + .02, 1.33], [x + w / 2, y + h - .02, 1.33], '#7a6c4e');
      b(w + .25, h * .5, 1.24, .23, .23, .2, '#52777b'); b(w + .28, h * .5 + .03, 1.44, .17, .17, .015, '#483d2d');
      break;
    case 'reading-cart':
      for (const dx of [.15, w - .3]) for (const dy of [.15, h - .3]) b(dx, dy, .05, .16, .16, .18, ink);
      for (const z of [.26, 1.02]) b(0, 0, z, w, h, .12, '#6d7057');
      for (const dx of [.05, w - .18]) for (const dy of [.05, h - .18]) b(dx, dy, .26, .13, .13, 1.2, '#465e56');
      book(.2, .2, 1.14, .62, .9, '#7e6073'); book(.25, .18, 1.245, .62, .9, '#a18a52');
      book(1.18, .28, 1.14, .7, .8, '#456a65');
      b(.1, h - .18, 1.45, w - .2, .1, .09, '#8f9d81'); break;
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
      b(.2, .1, .02, w - .4, h - .2, .06, '#748074'); b(.25, .15, .08, w - .5, h - .3, .02, '#bfc0a6');
      for (const yy of [.2, h - .2]) stroke(ctx, view, [x + .3, y + yy, .105], [x + w - .3, y + yy, .105], '#8e947f');
      for (const dx of [.65, 1.45, 1.8]) stroke(ctx, view, [x + dx, y + .25, .107], [x + dx + .3, y + .27, .107], '#e2d7b6');
      break;
  }
}
export const drawMap: DrawMap = (ctx, map, view) => {
  if (map.id !== 'reading-room' || view.pass !== 'ground') return;
  ctx.fillStyle = view.shadeColor?.('#3f4b46') ?? '#3f4b46'; ctx.fillRect(0, 0, view.width, view.height);
  box(ctx, view, 2, 3, -.12, 26, 17, .1, '#9d7e52');
  for (let y = 3; y < 20; y += .5) for (let x = 2; x < 28; x += 2) {
    const offset = Math.round(y * 2) % 2 ? 1 : 0, start = Math.max(2, x - offset), end = Math.min(28, x + 2 - offset);
    const traffic = x >= 11 && x < 16 && y > 11;
    const c = (traffic ? ['#baa476', '#c0aa7d', '#b29b6d', '#bba576'] : ['#ad8a5b', '#b69664', '#a98759', '#b99b6a'])[(x * 3 + Math.round(y * 2)) % 4];
    box(ctx, view, start, y, -.1, end - start - .025, .48, .1, c);
    if ((x * 7 + y * 2) % 9 === 0) stroke(ctx, view, [start + .2, y + .2, .002], [end - .2, y + .23, .002], traffic ? '#cfbb8e' : '#927449');
    if (y < 4 || x < 4 || x > 25) stroke(ctx, view, [start + .12, y + .44, .004], [end - .12, y + .44, .004], '#826d4c');
  }
  for (const p of map.props.filter(prop => prop.layer === 'ground')) {
    const { x, y } = p.position, w = p.width, h = p.height;
    if (p.kind === 'reading-inlay') {
      const rug = p.variant === 1 ? '#697454' : '#526d73';
      box(ctx, view, x, y, .006, w, h, .015, p.variant === 1 ? '#434c3c' : '#344e55');
      box(ctx, view, x + .13, y + .13, .022, w - .26, h - .26, .005, rug);
      box(ctx, view, x + .35, y + .35, .028, w - .7, h - .7, .003, p.variant === 1 ? '#87906b' : '#6b8587');
      for (let at = .6; at < h - .4; at += .32) stroke(ctx, view, [x + .4, y + at, .033], [x + w - .4, y + at, .033], p.variant === 1 ? '#7e8864' : '#627d80');
      for (let at = .5; at < w - .4; at += .55) for (const yy of [y + .18, y + h - .18]) stroke(ctx, view, [x + at, yy, .035], [x + at + .12, yy, .035], p.variant === 1 ? '#b0af85' : '#98a99e');
      for (const yy of [y, y + h]) stroke(ctx, view, [x, yy, .036], [x + w, yy, .036], p.variant === 1 ? '#3c493b' : '#30464e');
      for (const xx of [x, x + w]) stroke(ctx, view, [xx, y, .036], [xx, y + h, .036], p.variant === 1 ? '#3c493b' : '#30464e');
    } else if (p.kind === 'reading-mat') {
      box(ctx, view, x, y, .01, w, h, .025, '#455c59'); box(ctx, view, x + .12, y + .12, .04, w - .24, h - .24, .005, '#a89c72');
      for (let at = .25; at < w - .2; at += .18) stroke(ctx, view, [x + at, y + .18, .046], [x + at, y + h - .18, .046], '#8e8c66');
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
