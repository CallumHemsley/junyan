import type { DrawMap, WorldRenderObject, WorldRenderView } from '../../render-contract';
import type { WorldMapDefinition } from '../../schema';
import { readingWindowFrame } from './window-geometry';

type Prop = WorldMapDefinition['props'][number];
const wood = '#765237', pale = '#c3a578', ink = '#2e3d36', paper = '#f0e6cd';
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
    b(.1, .1, .76, w - .2, .12, .13, '#513c2c'); b(.1, h - .22, .76, w - .2, .12, .13, '#513c2c');
    b(0, 0, 1.02, w, h, .18, '#62452e'); b(.05, .05, 1.2, w - .1, h - .1, .035, '#c09c68');
    for (let at = .65; at < w - .15; at += .85) stroke(ctx, view, [x + at, y + .08, 1.237], [x + at, y + h - .08, 1.237], '#9c784a');
    stroke(ctx, view, [x, y + h, 1.19], [x + w, y + h, 1.19], '#493c2c');
    stroke(ctx, view, [x + w, y, 1.19], [x + w, y + h, 1.19], '#493c2c');
    for (const [dx, dy, length] of [[.18, .16, .28], [w * .6, h - .2, .26]]) stroke(ctx, view, [x + dx, y + dy, 1.24], [x + dx + length, y + dy + .03, 1.24], '#dfbd83');
    // Hand-polished front edge and exposed tenons, rather than grain across every pixel.
    stroke(ctx, view, [x + .24, y + h - .03, 1.235], [x + w * .66, y + h - .03, 1.235], '#d4b27b');
    for (const dx of [.13, w - .26]) b(dx, h - .13, .86, .13, .025, .08, '#a27e50');
  } else {
    for (const dx of [.15, w - .27]) for (const dy of [.15, h - .27]) b(dx, dy, 0, .12, .12, .67, ink);
    b(.06, .06, .67, w - .12, h - .12, .16, '#543e2b'); b(.15, .15, .83, w - .3, h - .3, .04, '#967847');
    // A rounded, bound rush seat sits inside the unchanged wooden frame.
    polygon(ctx, view, [[x + .23, y + .15, .88], [x + w - .23, y + .15, .88], [x + w - .15, y + .23, .88], [x + w - .15, y + h - .23, .88], [x + w - .23, y + h - .15, .88], [x + .23, y + h - .15, .88], [x + .15, y + h - .23, .88], [x + .15, y + .23, .88]], '#b4ad7f');
    for (let at = .27; at < w - .2; at += .16) stroke(ctx, view, [x + at, y + .24, .885], [x + at, y + h - .24, .885], '#96916a');
    for (const at of [.25, h - .25]) stroke(ctx, view, [x + .24, y + at, .89], [x + w - .24, y + at, .89], '#d0c299');
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
    b(dx + .025, dy + .02, z + .025, width - .05, depth - .04, .045, '#eee1c4');
    b(dx, dy, z + .08, width, depth, .025, colour);
    stroke(ctx, view, [x + dx + .05, y + dy + .05, z + .107], [x + dx + .05, y + dy + depth - .05, z + .107], '#b6a37f');
    stroke(ctx, view, [x + dx + .08, y + dy + depth + .002, z + .052], [x + dx + width - .04, y + dy + depth + .002, z + .052], '#a99a7b');
    b(dx + width * .62, dy + depth - .03, z + .108, .06, .13, .012, '#c2aa71');
    polygon(ctx, view, [[x+dx+width-.13,y+dy+.025,z+.108],[x+dx+width-.025,y+dy+.025,z+.108],[x+dx+width-.025,y+dy+.13,z+.108]], '#c6b28a');
  };
  switch (p.kind) {
    case 'reading-wall':
      b(0, 0, 0, w, h, 2.9, '#d8d0ba');
      b(0, 0, .08, w, h + .035, .96, '#667b6c');
      b(0, 0, .06, w, h + .06, .16, '#4c594b');
      b(0, 0, 1.04, w, h + .075, .09, '#4d594a');
      b(0, 0, 1.13, w, h + .035, .04, '#a9ad8e');
      b(0, 0, 2.67, w, h + .05, .1, '#947c55');
      if (w > h) b(.12, h + .035, .25, .035, .018, .67, '#899683');
      else b(w, .12, .25, .018, .035, .67, '#899683');
      break;
    case 'reading-low-wall': b(0, 0, 0, w, h, .28, '#c3b18b'); b(0, 0, .28, w + .06, h, .07, pale); break;
    case 'reading-window': {
      b(-.15, .35, readingWindowFrame.bottom, w + .3, .2, readingWindowFrame.height, ink); b(-.05, .56, 1, w + .1, .045, 1.9, '#799a9d');
      for (let pane = 0; pane < w; pane += .75) {
        const span = Math.min(.56, w - pane - .1);
        b(pane + .09, .615, 1.09, span, .015, .55, '#7e9b8b');
        b(pane + .21, .635, 1.35, .055, .016, .65, '#567b70');
        b(pane + .12, .635, 1.72, Math.min(.3, span), .016, .2, '#668d7d');
        b(pane + .13, .635, 2.4, span * .55, .014, .3, '#c3d4cc');
        b(pane, .62, 1, .07, .05, 1.9, pale);
        b(pane + .1, .63, 2.1, Math.min(.48, w - pane - .1), .015, .12, '#bed2c8');
      }
      b(0, .62, 1.85, w, .07, .08, wood); b(-.25, readingWindowFrame.sillY, .8, w + .5, readingWindowFrame.sillDepth, .12, pale);
      for (const dx of [-readingWindowFrame.overhang, w + .05]) {
        b(dx, .28, .9, .22, .15, 2.1, '#b6b38c');
        for (let z = 1.05; z < 2.9; z += .23) b(dx, .44, z, .22, .025, .07, '#d0c69f');
      }
      break;
    }
    case 'reading-shelf': {
      const low = p.variant === 'low', scale = low ? .4 : 1;
      const shelfIndex = Number(p.id.match(/shelf-(\d+)$/)?.[1] ?? (p.id.includes('front') ? 1 : 4));
      const turned = p.id.includes('front'), span = turned ? h : w, depth = turned ? w : h;
      const s = (dx: number, dy: number, z: number, width: number, d: number, height: number, colour: string) => turned ? b(depth - dy - d, dx, z, d, width, height, colour) : b(dx, dy, z, width, d, height, colour);
      s(0, 0, .12, span, depth, 1.95 * scale, '#63472f'); s(.1, .1, .24 * scale, span - .2, depth - .1, 1.73 * scale, '#243830');
      for (const z of [.24, .86, 1.48, 2.1]) {
        s(-.04, -.03, z * scale, span + .08, depth + .08, .1 * scale, '#805b35');
        s(.04, depth + .025, (z + .055) * scale, span - .08, .025, .022 * scale, '#c0a06c');
      }
      const colours = ['#41655b', '#ad945c', '#785368', '#4e7380', '#d0bc8b', '#825b3c'];
      for (let level = 0; level < 3; level++) for (let i = 0; i < Math.floor((span - .2) / .18); i++) {
        if ((i + shelfIndex + level * 2) % 8 > 5) continue;
        const dx = .12 + i * .18, z = (.34 + level * .62) * scale, height = (.32 + ((i + level * 3 + shelfIndex) % 5) * .055) * scale;
        const colour = level === 0 && i < 4 ? '#456a65' : colours[(Math.floor(i / 3) + level * 2 + shelfIndex) % colours.length];
        s(dx, depth - .29, z, i % 3 === 0 ? .17 : .13, .25, height, colour);
        s(dx + .02, depth - .039, z + .1 * scale, .09, .022, .025 * scale, '#d4bc85');
        if (i % 3 === 0) s(dx + .025, depth - .038, z + height - .09 * scale, .08, .021, .018 * scale, '#c8b58c');
      }
      for (const dx of [0, span - .1]) {
        s(dx, depth - .1, .12, .1, .13, 2.05 * scale, '#4b3e2d');
        for (const z of [.3, .92, 1.54, 2.13]) s(dx + .025, depth + .031, z * scale, .05, .012, .035 * scale, '#b29768');
      }
      if (span > 2) s(span * .52, .1, .34 * scale, .08, depth - .1, 1.75 * scale, '#6c553a');
      b(-.06, -.02, 2.2 * scale, w + .12, h + .08, .1 * scale, '#ae8955');
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
    case 'reading-open-book': {
      b(0, 0, 1.24, w, h, .05, '#3e5b53');
      b(.03, .02, 1.29, w - .06, h - .04, .04, '#b9a784');
      polygon(ctx, view, [[x + .03, y + .02, 1.36], [x + w / 2, y + .02, 1.31], [x + w / 2, y + h - .03, 1.31], [x + .03, y + h - .03, 1.36]], paper);
      polygon(ctx, view, [[x + w / 2, y + .02, 1.31], [x + w - .03, y + .02, 1.36], [x + w - .03, y + h - .03, 1.36], [x + w / 2, y + h - .03, 1.31]], '#f2e6c6');
      polygon(ctx, view, [[x + w - .2, y + .02, 1.365], [x + w - .03, y + .18, 1.365], [x + w - .2, y + .18, 1.375]], '#c4b58f');
      for (const z of [1.302, 1.325]) stroke(ctx, view, [x + .05, y + h - .015, z], [x + w - .05, y + h - .015, z], '#d6c6a2');
      stroke(ctx, view, [x + w / 2, y + .03, 1.32], [x + w / 2, y + h - .02, 1.32], '#8a7a5a');
      b(w * .59, h - .16, 1.365, .07, .27, .012, '#9d8654');
      const cx = x + w + .37, cy = y + h * .5 + .12;
      const rim = (radius: number, z: number): [number, number, number][] => Array.from({ length: 8 }, (_, i) => [cx + Math.cos(i * Math.PI / 4) * radius, cy + Math.sin(i * Math.PI / 4) * radius, z]);
      const base = rim(.09, 1.245), lip = rim(.15, 1.46);
      for (let i = 0; i < 8; i++) polygon(ctx, view, [base[i], base[(i + 1) % 8], lip[(i + 1) % 8], lip[i]], i < 4 ? '#597f80' : '#365d63');
      polygon(ctx, view, lip, '#92a59b'); polygon(ctx, view, rim(.105, 1.465), '#4a4636');
      stroke(ctx, view, [cx + .14, cy, 1.43], [cx + .23, cy, 1.4], '#9eb0a1');
      stroke(ctx, view, [cx + .23, cy, 1.4], [cx + .13, cy, 1.31], '#648687');
      break;
    }
    case 'reading-cart':
      for (const dx of [.19, w - .25]) for (const dy of [.17, h - .2]) {
        polygon(ctx, view, Array.from({ length: 8 }, (_, i) => [x + dx + Math.cos(i * Math.PI / 4) * .15, y + dy, .17 + Math.sin(i * Math.PI / 4) * .15] as [number, number, number]), '#303c38');
        b(dx - .04, dy - .035, .13, .08, .07, .08, '#9aab9c');
        b(dx - .025, dy - .035, .21, .05, .07, .14, '#617c75');
      }
      for (const z of [.34, 1.02]) {
        b(0, 0, z, w, h, .055, '#839389'); b(.08, .08, z + .055, w - .16, h - .16, .065, '#566e65');
        b(.02, h - .04, z + .055, w - .04, .045, .09, '#a4b0a0');
      }
      for (const dx of [.05, w - .13]) for (const dy of [.05, h - .13]) {
        b(dx, dy, .26, .08, .08, 1.2, '#465e56'); b(dx, dy + .055, .35, .025, .025, 1.06, '#98ab9b');
      }
      // Returned volumes stay concentrated on the two supported trays.
      book(.2, .2, .46, .72, .86, '#4e7380'); book(.23, .17, .565, .68, .82, '#785368');
      book(1.2, .23, .46, .67, .86, '#ad945c');
      book(.2, .2, 1.14, .72, .9, '#785368'); book(.25, .18, 1.245, .67, .86, '#ad945c');
      book(1.2, .24, 1.14, .7, .84, '#41655b');
      b(1.36, .31, 1.25, .39, .48, .015, paper);
      b(.1, h - .13, 1.45, w - .2, .08, .07, '#a3b1a1'); break;
    case 'reading-notice':
      furniture(ctx, view, { ...p, kind: 'reading-table' });
      book(.22, .18, 1.24, .76, .8, '#41655b');
      b(1.15, .24, 1.24, .72, .63, .045, '#b8a985');
      b(1.19, .2, 1.285, .68, .64, .018, paper);
      polygon(ctx, view, [[x+1.68,y+.2,1.305],[x+1.87,y+.38,1.305],[x+1.68,y+.38,1.315]], '#d1c2a1');
      b(.08, .2, 1.24, .07, .65, .035, '#55452f'); break;
    case 'reading-plant':
      b(.2, .2, 0, w - .4, h - .4, .55, '#9c8761'); b(.16, .16, .5, w - .32, h - .32, .15, '#c2ac7e'); b(.26, .26, .66, w - .52, h - .52, .02, '#6a5941');
      for (let i = 0; i < 7; i++) {
        const angle = i * 2.4, dx = w / 2 + Math.cos(angle) * .36, dy = h / 2 + Math.sin(angle) * .3, z = .8 + i % 3 * .25;
        stroke(ctx, view, [x + w / 2, y + h / 2, .65], [x + dx, y + dy, z], '#708565');
        polygon(ctx, view, [[x + dx, y + dy, z], [x + dx + .22, y + dy + .08, z + .2], [x + dx + .06, y + dy + .2, z + .25], [x + dx - .12, y + dy + .05, z + .1]], i % 2 ? '#8ca17a' : '#6d8a6b');
      }
      break;
    case 'reading-lamp':
      b(0, 0, .02, w, h, .09, '#334942'); b(w * .45, h * .45, .1, .07, .07, 1.8, '#537368');
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
  const floor = map.terrain.find(terrain => terrain.id === 'reading-room.floor')!.rect;
  const floorRight = floor.x + floor.width, floorFront = floor.y + floor.height;
  box(ctx, view, floor.x, floor.y, -.12, floor.width, floor.height, .1, '#756242');
  for (let y = floor.y; y < floorFront; y += .5) for (let x = floor.x; x < floorRight + 3.2; x += 3.2) {
    const row=Math.round(y*2),offset=[0,.7,1.6,2.1][row%4],start=Math.max(floor.x,x-offset),end=Math.min(floorRight,x+3.2-offset);
    if(start>=end)continue;
    const traffic = x >= 11.5 && x < 14 && y > 11 && y < 18;
    const c = (traffic ? ['#ac9873', '#ae9b75', '#ac9871', '#a99670'] : ['#9c845e', '#a18a63', '#9d865f', '#a38c64'])[(Math.round((x-2)/3.2)*3+row)%4];
    polygon(ctx, view, [[start, y, 0], [end, y, 0], [end, y + .5, 0], [start, y + .5, 0]], c);
    stroke(ctx, view, [start, y + .5, .001], [end, y + .5, .001], traffic ? '#a7926c' : '#98815c');
    if ((row + Math.round((x-2)/3.2)) % 3 === 0) stroke(ctx, view, [start, y, .002], [start, y + .5, .002], '#947d58');
  }
  // Three handled turns connect the real entry, desk approach and return cart; no scattered debris.
  for(const patch of [[[12.7,14.1],[13.6,13.9],[13.8,14.8],[12.6,15.2]],[[11.5,12.8],[12.2,12.6],[12.3,14.7],[11.6,14.9]],[[15.4,13.8],[16.6,13.7],[17.5,14.1],[16.6,14.4]]] as [number,number][][]){
    ctx.save();ctx.globalAlpha*=.22;polygon(ctx,view,patch.map(([x,y])=>[x,y,.003]),'#c9b58c');ctx.restore();
  }
  for (const p of map.props.filter(prop => prop.layer === 'ground')) {
    const { x, y } = p.position, w = p.width, h = p.height;
    if (p.kind === 'reading-inlay') {
      const rug = p.variant === 1 ? '#586a50' : '#4c6867';
      box(ctx, view, x, y, .006, w, h, .015, p.variant === 1 ? '#434c3c' : '#344e55');
      box(ctx, view, x + .13, y + .13, .022, w - .26, h - .26, .005, rug);
      box(ctx, view, x + .35, y + .35, .028, w - .7, h - .7, .003, p.variant === 1 ? '#6e7e5c' : '#607a74');
      for (let at = .75; at < h - .5; at += .75) stroke(ctx, view, [x + .4, y + at, .033], [x + w - .4, y + at, .033], p.variant === 1 ? '#687855' : '#5b756f');
      for (const xx of [x + .25, x + w - .25]) stroke(ctx, view, [xx, y + .25, .036], [xx, y + h - .25, .036], '#9d9c78');
      for (let at = .3; at < w - .2; at += .45) for (const yy of [y, y + h]) stroke(ctx, view, [x + at, yy, .035], [x + at + .06, yy + (yy === y ? -.14 : .14), .035], '#929779');
      polygon(ctx,view,[[x+w*.36,y+h-.55,.034],[x+w*.62,y+h-.65,.034],[x+w*.7,y+h-.3,.034],[x+w*.43,y+h-.24,.034]],p.variant===1?'#788463':'#6c8177');
      for (const at of [.7, .94, 1.18]) stroke(ctx, view, [x + at, y + h - .18, .036], [x + at + .12, y + h - .18, .036], '#c0b38a');
      for (const yy of [y, y + h]) stroke(ctx, view, [x, yy, .036], [x + w, yy, .036], p.variant === 1 ? '#3c493b' : '#30464e');
      for (const xx of [x, x + w]) stroke(ctx, view, [xx, y, .036], [xx, y + h, .036], p.variant === 1 ? '#3c493b' : '#30464e');
    } else if (p.kind === 'reading-mat') {
      box(ctx, view, x, y, .01, w, h, .025, '#455c59'); box(ctx, view, x + .12, y + .12, .04, w - .24, h - .24, .005, '#a89c72');
      for (let at = .25; at < w - .2; at += .18) stroke(ctx, view, [x + at, y + .18, .046], [x + at, y + h - .18, .046], '#8e8c66');
    } else if (p.kind === 'reading-sunlight') {
      // Actual window pools own illumination in every phase, including night.
    } else if (p.kind === 'reading-draft') {
      ctx.save();ctx.globalAlpha *= .36;
      furniture(ctx, view, { ...p, kind: w === 1.5 && h === 1.5 ? 'reading-chair' : 'reading-table', variant: h > w ? 1 : 0 });ctx.restore();
      const colour = p.variant === 'valid' ? '#f1e6be' : '#6b5e49';
      for (const yy of [y, y + h]) stroke(ctx, view, [x, yy, .045], [x + w, yy, .045], colour, 2);
      for (const xx of [x, x + w]) stroke(ctx, view, [xx, y, .045], [xx, y + h, .045], colour, 2);
      if (p.variant === 'blocked') for (let at = .3; at < w; at += .4) stroke(ctx, view, [x + at, y, .05], [x + Math.min(w, at + .4), y + Math.min(h, .4), .05], colour);
    }
  }
  ctx.save();ctx.globalAlpha*=.12+(view.castLight?.shadowOpacity??.24)*.55;
  for(const p of map.props){
    const {x,y}=p.position,w=p.width,h=p.height;
    if(['reading-table','reading-chair','reading-notice','reading-cart'].includes(p.kind)){
      for(const dx of [.15,w-.23])for(const dy of [.15,h-.23])polygon(ctx,view,[[x+dx-.09,y+dy-.05,.04],[x+dx+.19,y+dy-.05,.04],[x+dx+.24,y+dy+.14,.04],[x+dx-.04,y+dy+.14,.04]],'#263b32');
    }else if(p.kind==='reading-shelf')polygon(ctx,view,[[x-.03,y-.03,.04],[x+w+.06,y-.03,.04],[x+w+.06,y+h+.08,.04],[x-.03,y+h+.08,.04]],'#263b32');
  }
  ctx.restore();
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
