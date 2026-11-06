import type { DrawMap, WorldRenderObject, WorldRenderView } from '../../render-contract';
import type { SceneApi } from '../../../scene/renderer.js';
import { stairSurfaces, supportHeight } from '../../maps/residential/elevation';
import { mapDefinitions } from '../../maps/residential';
import { furnitureWorldRect } from '../../../features/apartment/world';
import type { WorldMapDefinition } from '../../schema';
import { legal, type State } from '../../../features/apartment/rules';

type Colour = [number, number, number];
export type ResidentialArtApi = Pick<SceneApi, 'box' | 'sphere' | 'capsule' | 'castShadow'>;
const cream: Colour = [231, 219, 187];
const wood: Colour = [159, 119, 77];
const paleWood: Colour = [193, 153, 101];
const ink: Colour = [76, 65, 51];
const jade: Colour = [111, 154, 134];
const linen: Colour = [215, 207, 176];

function wall(api: ResidentialArtApi, x: number, y: number, width: number, depth: number) {
  api.box(x, y, 0, x + width, y + depth, 2.7, cream);
  api.box(x, y, .04, x + width, y + depth, .18, wood);
  api.box(x, y, 1, x + width, y + depth, 1.055, [203, 185, 149]);
  api.box(x, y, 2.7, x + width, y + depth, 2.79, paleWood);
}


export function drawResidentialFloor(api: ResidentialArtApi, mapId: string) {
  const map = mapDefinitions.find(m => m.id === mapId);
  if (!map) return;
  if (mapId === 'residential-stairs') for (const surface of stairSurfaces) {
    const r = surface.rect;
    if (surface.kind === 'tread') for (const edge of [r.x - .18, r.x + r.width]) {
      api.box(edge, r.y, surface.height - .7, edge + .18, r.y + r.height, surface.height + .06, [137, 133, 111]);
      api.box(edge, r.y, surface.height + .06, edge + .18, r.y + r.height, surface.height + .1, paleWood);
    }
    else api.box(r.x, r.y, surface.height - .65, r.x + r.width, r.y + r.height, surface.height - .44, [145, 145, 123]);
  }
  if (mapId === 'residential-stairs') api.box(3, 18.6, -.15, 15, 19, 2.4, [190, 181, 151]);
  const terrainAreas = mapId === 'residential-stairs'
    ? stairSurfaces.map(surface => ({ rect: surface.rect, material: surface.kind === 'tread' ? 'stairs' : 'terrazzo', baseZ: surface.height }))
    : map.terrain.map(terrain => ({ ...terrain, baseZ: 0 }));
  for (const terrain of terrainAreas) {
    const r = terrain.rect;
    for (let x = r.x; x < r.x + r.width; x++) for (let y = r.y; y < r.y + r.height; y++) {
      const right = Math.min(x + 1, r.x + r.width), front = Math.min(y + 1, r.y + r.height);
      const variation = terrain.material === 'timber' ? ((x * 13 + Math.floor((y + x % 2) / 3) * 7) % 5) - 2 : ((x * 17 + y * 31) % 7) - 3;
      const material = terrain.material;
      const base: Colour = material === 'timber' ? [187, 150, 103] : material === 'woven' ? [133, 137, 108] : material === 'glazed-tile' ? [145, 166, 153] : [171, 174, 159];
      const colour: Colour = base.map(c => c + variation * (material === 'timber' ? 1.2 : 2)) as Colour;
      const baseZ = terrain.baseZ, z = baseZ + (mapId === 'residential-stairs' ? 0 : material === 'woven' ? .045 : .01);
      api.box(x, y, baseZ - (mapId === 'residential-stairs' ? .45 : .16), right, front, z, colour);
      if (material === 'timber') {
        api.box(x, y, z, x + .016, front, z + .007, [151, 122, 87]);
        if ((y + x % 2) % 3 === 0) api.box(x, y, z, right, y + .016, z + .007, [159, 127, 86]);
        api.box(x + .23, y + .17, z, x + .24, y + .8, z + .006, [177, 140, 94]);
        if ((x + y) % 5 === 0) api.box(x + .65, y + .4, z, x + .69, y + .6, z + .007, [165, 131, 87]);
      } else if (material === 'glazed-tile') {
        api.box(x, y, z, right, y + .035, z + .01, cream);
        api.box(x, y, z, x + .035, front, z + .01, cream);
        if ((x + y) % 3 === 0) api.box(x + .1, y + .1, z, x + .35, y + .14, z + .012, [177, 191, 176]);
      } else if (material === 'stairs') {
        for (let step = y; step < front; step += .5) {
          api.box(x, front - .09, baseZ + .004, right, front, baseZ + .018, [115, 110, 88]);
          api.box(x + .1, front - .055, baseZ + .018, right - .1, front - .03, baseZ + .023, [170, 162, 132]);
        }
      } else if (material === 'terrazzo' && (x + y) % 2 === 0) {
        api.box(x + .2, y + .3, baseZ + .012, x + .3, y + .4, baseZ + .018, [204, 203, 183]);
        api.box(x + .65, y + .68, baseZ + .012, x + .73, y + .75, baseZ + .018, [135, 146, 136]);
      } else if (material === 'woven') api.box(x, y + .12, z, right, y + .16, z + .006, [174, 169, 133]);
    }
  }
}

export function drawResidentialProps(api: ResidentialArtApi, mapId: string, layer?: string) {
  const map = mapDefinitions.find(m => m.id === mapId);
  if (!map) return;
  for (const prop of map.props) if (!layer || prop.layer === layer) drawResidentialProp(prop.kind === 'well' ? api : onSurface(api, mapId), prop);
}

function drawResidentialProp(api: ResidentialArtApi, prop: Omit<WorldMapDefinition['props'][number], 'layer'>) {
  const { box, sphere, capsule } = api;
  const { x, y } = prop.position;
  const w = prop.width, h = prop.height;
  const endX = x + w, endY = y + h;
  const post = (px: number, py: number, height: number) => box(px, py, 0, px + .13, py + .13, height, ink);
  switch (prop.kind) {
    case 'wall':
    case 'partition':
      wall(api, x, y, w, h);
      break;
    case 'sofa':
      box(x, y, .1, endX, endY, .5, wood);box(x + .1, y + .1, .5, endX - .1, endY - .1, .9, jade);
      box(x, y, .9, x + .4, endY, 1.5, [124, 150, 126]);
      for (let at = y + .3; at < endY; at += 1) box(x + .4, at, .9, endX - .1, at + .8, 1.03, [164, 179, 147]);
      box(x + .5, y + .15, .95, x + 1.2, y + .9, 1.25, linen);
      box(x + .5, endY - 1, .95, x + 1.2, endY - .2, 1.27, [143, 166, 168]);
      for (const at of [y + .08, endY - .35]) box(x + .2, at, .6, endX, at + .25, 1.1, [107, 143, 125]);
      break;
    case 'lamp':
    case 'floor-lamp':
      box(x + .2, y + .2, 0, endX - .2, endY - .2, .12, ink);box(x + .45, y + .45, .12, x + .55, y + .55, 2.1, wood);
      box(x, y, 1.8, endX, endY, 2.15, [236, 209, 151]);
      break;
    case 'mat':
      box(x, y, .05, endX, endY, .07, prop.variant ? [144, 151, 121] : [173, 164, 126]);
      box(x + .1, y + .1, .07, endX - .1, endY - .1, .08, prop.variant ? [174, 180, 146] : [197, 185, 145]);
      for (let at = y + .2; at < endY - .1; at += .3) box(x + .1, at, .08, endX - .1, at + .03, .085, [157, 160, 127]);
      break;
    case 'wall-shelf':
      for (const z of [1.5, 2.2]) {
        box(x, y, z, endX, endY, z + .12, wood);
        for (let at = y + .2; at < endY - .2; at += .6) box(x + .1, at, z + .12, endX - .1, at + .3, z + .45, Math.floor(at) % 2 ? jade : linen);
      }
      break;
    case 'lantern':
    case 'wall-lamp':
      box(x, y, 1.8, endX, endY, 2.5, wood);box(x + .15, y + .05, 1.9, endX - .15, endY + .05, 2.4, [240, 212, 158]);
      break;
    case 'notice-board':
      box(x, y, 1.2, endX, endY, 2.5, wood);
      for (let at = x + .15; at < endX - .2; at += .55) box(at, endY, 1.5, at + .4, endY + .04, 2.2, linen);
      break;
    case 'parcel': {
      const base = prop.variant === 1 ? .9 : 0;
      if (base) {
        for (const px of [x, endX - .15]) box(px, y, 0, px + .15, endY, .9, wood);
        box(x, y, .14, endX, endY, .25, wood);
        box(x - .08, y - .04, .8, endX + .08, endY + .05, .9, paleWood);
        box(x + .2, y + .12, .25, x + .8, endY - .1, .5, jade);
      }
      box(x + .12, y + .1, base, endX - .15, endY - .1, base + .65, [182, 151, 104]);
      box(x + w / 2 - .07, y + .1, base + .65, x + w / 2 + .07, endY - .1, base + .67, linen);
      box(x + .25, endY - .09, base + .18, x + .55, endY - .075, base + .4, linen);
      break;
    }
    case 'well':
      box(x, y, -.8, endX, endY, -.7, [72, 87, 79]);
      for (let at = y; at < endY; at += 1.5) box(x + .1, at, -.7, endX - .1, at + .07, -.65, [105, 119, 100]);
      break;
    case 'door': {
      const sideways = w < h;
      if (sideways) {
        box(x, y, 0, endX, y + .2, 2.8, wood); box(x, endY - .2, 0, endX, endY, 2.8, wood);
        box(x, y, 2.7, endX, endY, 2.9, wood);
      } else {
        box(x, y, 0, x + .2, endY, 2.8, wood); box(endX - .2, y, 0, endX, endY, 2.8, wood);
        box(x, y, 2.7, endX, endY, 2.9, wood);
        box(x + .22, y, .1, endX - .22, endY, 2.65, prop.variant ? [121, 146, 132] : [160, 127, 89]);
        sphere(endX - .55, endY + .05, 1.2, .08, [194, 163, 103], 'solid');
      }
      break;
    }
    case 'window':
      box(x, y, .3, endX, endY, 3.7, cream);
      box(x + .1, endY, 1.02, endX - .1, endY + .05, 3.42, [83, 109, 110]);
      box(x + .2, endY + .04, 1.16, endX - .2, endY + .07, 3.3, [144, 171, 178]);
      for (let at = x + .35; at < endX - .2; at += 1.1) box(at, endY + .08, 2.7, Math.min(at + .35, endX - .2), endY + .09, 2.76, [190, 206, 198]);
      for (let at = x + .2; at < endX - .1; at += 1.1) box(at, endY + .06, 1.1, at + .07, endY + .09, 3.4, linen);
      box(x + .12, endY + .07, 2.15, endX - .12, endY + .1, 2.23, linen);
      box(x - .2, y - .05, .93, endX + .2, endY + .25, 1.1, paleWood);
      for (const side of [x - .12, endX - .3]) for (let fold = 0; fold < 3; fold++) {
        const at = side + fold * .12;
        box(at, endY + .12, 1.05 + (fold % 2) * .07, at + .11, endY + .24, 3.55, fold % 2 ? [127, 158, 139] : [157, 179, 151]);
      }
      box(x - .3, y, 3.6, endX + .3, endY + .3, 3.7, wood);
      break;
    case 'bench': case 'tea-table': case 'stool': {
      const height = prop.kind === 'tea-table' ? .8 : .63;
      for (const px of [x + .15, endX - .3]) for (const py of [y + .15, endY - .3]) box(px, py, 0, px + .16, py + .16, height, ink);
      box(x, y, height, endX, endY, height + .15, paleWood);
      if (prop.kind === 'bench') for (let at = x + .15; at < endX; at += .4) box(at, y, height + .15, Math.min(at + .025, endX), endY, height + .17, wood);
      if (prop.kind === 'tea-table') {
        box(x + .4, y + .3, .95, endX - .4, endY - .3, .97, linen);
        sphere(x + .9, y + .7, 1.15, .24, jade, 'solid');
        for (let at = 0; at < 2; at++) box(x + 1.5 + at * .4, y + .5, .98, x + 1.7 + at * .4, y + .7, 1.18, cream);
      }
      break;
    }
    case 'plant':
      box(x + .18, y + .18, 0, endX - .18, endY - .18, .65, [164, 145, 106]);
      box(x + .12, y + .12, .6, endX - .12, endY - .12, .74, paleWood);
      for (let i = 0; i < (prop.variant === 1 ? 4 : 7); i++) {
        const angle = i * 2.4, cx = x + w / 2, cy = y + h / 2;
        if (prop.variant === 1) {
          capsule([cx, cy, .7], [cx + Math.cos(angle) * .35, cy + Math.sin(angle) * .35, 1.7 + i % 2 * .2], .035, .035, () => [91, 123, 83], 'solid');
          sphere(cx + Math.cos(angle) * .35, cy + Math.sin(angle) * .35, 1.7 + i % 2 * .2, .24, i % 2 ? jade : [137, 165, 119], 'solid');
        } else capsule([cx, cy, .7], [cx + Math.cos(angle) * .45, cy + Math.sin(angle) * .45, 1.3 + i % 3 * .15], .07, .15, () => i % 2 ? [84, 126, 89] : [125, 157, 104], 'solid');
      }
      break;
    case 'shoe-rack':
      box(x, y, 0, endX, endY, .13, wood); box(x, y, .55, endX, endY, .65, wood);
      for (let at = x + .2; at < endX - .2; at += .65) {
        box(at, y + .1, .14, at + .2, endY - .1, .32, ink);
        box(at + .25, y + .1, .14, at + .45, endY - .1, .32, [126, 135, 113]);
      }
      break;
    case 'mailboxes':
      box(x, y, .35, endX, endY, 2.3, [112, 139, 129]);
      for (let at = x; at < endX; at++) for (const z of [.45, 1.35]) {
        box(at + .08, endY, z, at + .92, endY + .05, z + .75, [141, 159, 139]);
        box(at + .2, endY + .05, z + .48, at + .7, endY + .08, z + .53, ink);
        if ((at + z) % 2 < 1) box(at + .3, endY + .08, z + .36, at + .6, endY + .11, z + .55, linen);
      }
      break;
    case 'basket':
      box(x + .1, y + .1, 0, endX - .1, endY - .1, .65, paleWood);
      for (let z = .1; z < .65; z += .13) box(x + .09, endY - .12, z, endX - .09, endY - .08, z + .025, cream);
      sphere(x + w / 2, y + h / 2, .65, .32, linen, 'solid');
      break;
    case 'kitchen':
      box(x, y, 0, endX, endY, 1.1, [121, 149, 133]);box(x, y, 1.1, endX, endY, 1.26, cream);
      for (let at = x + .2; at < endX; at += 1.4) box(at, endY, .12, Math.min(at + 1.25, endX), endY + .05, 1, [144, 166, 146]);
      box(x + .4, y + .3, 1.26, x + 2, endY - .3, 1.29, ink);box(x + .55, y + .45, 1.29, x + 1.85, endY - .45, 1.32, [145, 163, 157]);
      capsule([x + 1.2, y + .2, 1.3], [x + 1.2, y + .2, 1.85], .05, .05, () => ink, 'solid');
      sphere(endX - 1, y + h / 2, 1.45, .3, jade, 'solid');
      break;
    case 'wardrobe': case 'bookcase':
      box(x, y, 0, endX, endY, 2.5, wood);
      if (prop.kind === 'bookcase') for (const z of [.3, 1.1, 1.9]) {
        box(x + .08, endY - .1, z, endX - .08, endY + .04, z + .08, paleWood);
        for (let at = x + .12; at < endX - .1; at += .17) {
          const spine: Colour[] = [[95, 127, 132], [171, 141, 83], [137, 116, 139], [214, 203, 169], [93, 106, 92]];
          const index = Math.floor(at * 13 + z * 7), top = z + .37 + index % 4 * .045;
          box(at, endY - .18, z + .08, at + .12, endY + .02, top, spine[index % spine.length]);
          box(at + .02, endY + .02, top - .12, at + .1, endY + .03, top - .09, linen);
        }
      } else { box(x + w / 2, endY, .15, x + w / 2 + .05, endY + .03, 2.3, ink); sphere(x + w / 2 + .15, endY + .1, 1.2, .06, cream, 'solid'); }
      break;
    case 'railing': {
      const alongX = w > h, length = alongX ? w : h;
      const at = (t: number): [number, number, number] => [x + (alongX ? t : w / 2), y + (alongX ? h / 2 : t), 1.15];
      for (let t = 0; t < length; t += .5) {
        const a = at(t), b = at(Math.min(t + .5, length));
        post(a[0], a[1], 1.15);capsule(a, b, .065, .065, () => paleWood, 'solid');
      }
      break;
    }
    case 'pipe':
      capsule([x + w / 2, y, .2], [x + w / 2, endY, .2], .06, .06, () => [126, 140, 132], 'solid');
      for (let at = y; at < endY; at += 1.5) box(x, at, .1, endX, at + .08, .32, ink);
      break;
    case 'laundry': case 'coat-hook':
      post(x, y, 2.1);post(endX - .13, endY - .13, 2.1);
      capsule([x, y, 2.1], [endX, endY, 2.1], .04, .04, () => ink, 'solid');
      box(x + .15, y + .1, .8, endX - .1, endY - .1, 1.95, linen);
      break;
    case 'washbasin':
      box(x, y, 0, endX, endY, .8, [144, 167, 151]);box(x, y, .8, endX, endY, .96, cream);
      box(x + .15, y + .1, .96, endX - .15, endY - .1, .99, [116, 145, 139]);
      capsule([x + w / 2, y + .1, 1], [x + w / 2, y + .1, 1.35], .04, .04, () => ink, 'solid');
      break;
    case 'towel-rail':
      capsule([x, y, 1.6], [endX, endY, 1.6], .04, .04, () => wood, 'solid');
      box(x + .12, y, .65, endX - .12, endY, 1.58, [164, 181, 165]);
      for (let at = x + .2; at < endX - .1; at += .25) box(at, endY, .7, at + .03, endY + .02, 1.5, [189, 200, 175]);
      break;
    case 'threshold':
      box(x, y, .015, endX, endY, .08, [122, 136, 121]);box(x + .08, y + .08, .08, endX - .08, endY - .08, .1, [197, 194, 165]);
      break;
    case 'screen':
      box(x, y, 0, endX, y + .15, 2.3, jade);
      for (let at = x + .1; at < endX; at += .25) box(at, y + .15, .2, at + .04, y + .18, 2.1, linen);
      break;
    case 'umbrella':
      box(x + .1, y + .1, 0, endX - .1, endY - .1, .7, wood);
      for (const at of [.3, .6]) capsule([x + at, y + .4, .4], [x + at, y + .4, 1.7], .045, .045, () => ink, 'solid');
      break;
    case 'bicycle':
      for (const at of [.5, w - .5]) sphere(x + at, y + h / 2, .5, .48, ink, 'solid');
      capsule([x + .5, y + h / 2, .5], [endX - .5, y + h / 2, .5], .08, .08, () => jade, 'solid');
      capsule([x + w / 2, y + h / 2, .5], [x + w / 2, y + h / 2, 1.3], .07, .07, () => jade, 'solid');
      break;
    case 'sunlight':
      for (let row = 0; row < h; row += .5) for (let column = 0; column < w; column += .5) {
        if ((row * 2 + column * 2) % 3 === 0) box(x + column, y + row, .025, x + column + .3, y + row + .3, .028, [211, 183, 126]);
      }
      break;
  }
  if (!['sunlight', 'window', 'pipe', 'door'].includes(prop.kind)) api.castShadow(x + w / 2, y + h / 2, .12, Math.max(w, h) * .45, .45, 0);
}

export function drawApartmentFurniture(api: ResidentialArtApi, state: State) {
  for (const p of [...state.placements].sort((a, b) => Number(a.id !== 'rug') - Number(b.id !== 'rug'))) {
    const r = furnitureWorldRect(p, state.rugSize), x = r.x + .14, y = r.y + .14, endX = r.x + r.width - .14, endY = r.y + r.height - .14;
    const { box, sphere } = api;
    switch (p.id) {
      case 'bed':
        box(x, y, 0, endX, endY, .4, wood); box(x, y, .4, endX, endY, .7, cream);box(x, y, .7, endX, y + .2, 1.2, wood);
        box(x + .2, y + .35, .7, endX - .2, y + 1.1, .88, linen);
        box(x + .24, y + .39, .88, endX - .24, y + .46, .9, [239, 227, 193]);
        for (let at = x + .3; at < endX - .2; at += .55) box(at, y + .03, .85, at + .1, y + .2, 1.24, paleWood); box(x, y + 1.3, .7, endX, endY, .83, [132, 158, 127]);
        box(x + .05, y + 1.25, .83, endX - .05, y + 1.62, .9, [176, 190, 154]);
        for (let at = y + 1.8; at < endY - .1; at += .6) box(x + .05, at, .83, endX - .05, at + .035, .85, [151, 175, 137]);
        box(x, endY - .15, .45, endX, endY, .83, [112, 144, 117]);
        box(x + .2, endY - .2, .83, x + .8, endY, .88, [155, 177, 140]);
        break;
      case 'table':
        for (const px of [x + .1, endX - .24]) for (const py of [y + .1, endY - .24]) box(px, py, 0, px + .14, py + .14, 1.1, ink);
        box(x, y, 1.1, endX, endY, 1.3, paleWood);
        box(x + .2, y + .2, 1.3, endX - .2, y + .23, 1.31, [174, 133, 83]);
        box(x + .25, y + .4, 1.31, x + .95, y + 1.05, 1.33, linen);
        sphere(x + .6, y + .6, 1.47, .18, jade, 'solid');
        box(endX - .8, endY - .9, 1.3, endX - .25, endY - .35, 1.36, [133, 155, 154]);
        box(endX - .77, endY - .87, 1.36, endX - .28, endY - .38, 1.4, linen);
        break;
      case 'chair': case 'repairs.stool':
        for (const px of [x + .1, endX - .24]) for (const py of [y + .1, endY - .24]) box(px, py, 0, px + .14, py + .14, .7, ink);
        box(x, y, .7, endX, endY, .85, paleWood);
        if (p.id === 'chair') {
          if (p.rotation) {
            box(x, y, .8, x + .15, y + .15, 1.7, wood);box(x, endY - .15, .8, x + .15, endY, 1.7, wood);
            for (const z of [1.1, 1.45]) box(x, y, z, x + .15, endY, z + .14, paleWood);
          } else {
            box(x, y, .8, x + .15, y + .15, 1.7, wood);box(endX - .15, y, .8, endX, y + .15, 1.7, wood);
            for (const z of [1.1, 1.45]) box(x, y, z, endX, y + .15, z + .14, paleWood);
          }
        }
        break;
      case 'rug':
        box(x, y, .015, endX, endY, .035, [170, 153, 115]);box(x + .15, y + .15, .035, endX - .15, endY - .15, .045, [211, 192, 150]);
        break;
      case 'cushion': case 'cats.cushion':
        box(x, y, .02, endX, endY, .22, p.id === 'cats.cushion' ? [191, 162, 117] : state.colour === 'blue' ? [128, 155, 171] : linen);
        break;
      case 'blue-vase': {
        const cx = (x + endX) / 2, cy = (y + endY) / 2;
        const glaze: Colour = [128, 155, 171];
        box(cx - .27, cy - .27, 0, cx + .27, cy + .27, .12, [91, 119, 136]);
        sphere(cx, cy, .44, .48, glaze, 'solid');
        box(cx - .2, cy - .2, .48, cx + .2, cy + .2, 1.02, glaze);
        box(cx - .25, cy - .25, .98, cx + .25, cy + .25, 1.09, [157, 180, 190]);
        box(cx - .14, cy - .14, 1.09, cx + .14, cy + .14, 1.1, [72, 101, 119]);
        box(cx - .3, cy + .3, .32, cx - .23, cy + .35, .57, [180, 200, 204]);
        break;
      }
      case 'large-basket': {
        box(x + .03, y + .03, .02, endX - .03, endY - .03, .85, paleWood);
        box(x + .12, y + .12, .85, endX - .12, endY - .12, .87, [91, 76, 53]);
        for (let at = .13; at < .8; at += .12) {
          box(x + .02, endY - .06, at, endX - .02, endY - .02, at + .035, linen);
          box(endX - .06, y + .02, at, endX - .02, endY - .02, at + .035, [152, 119, 77]);
        }
        for (let at = x + .18; at < endX - .1; at += .23) box(at, endY - .035, .12, at + .035, endY - .01, .8, wood);
        for (let at = y + .18; at < endY - .1; at += .23) box(endX - .035, at, .12, endX - .01, at + .035, .8, linen);
        const cx = (x + endX) / 2, cy = (y + endY) / 2;
        const a: [number, number, number] = p.rotation ? [cx, y + .08, .85] : [x + .08, cy, .85];
        const b: [number, number, number] = p.rotation ? [cx, endY - .08, .85] : [endX - .08, cy, .85];
        const topA: [number, number, number] = [a[0], a[1], 1.28], topB: [number, number, number] = [b[0], b[1], 1.28];
        for (const [from, to] of [[a, topA], [topA, topB], [topB, b]]) api.capsule(from, to, .055, .055, () => wood, 'solid');
        break;
      }
      case 'small-lamp': {
        const cx = (x + endX) / 2, cy = (y + endY) / 2;
        box(cx - .3, cy - .3, .02, cx + .3, cy + .3, .13, ink);
        api.capsule([cx, cy, .13], [cx, cy, .83], .05, .05, () => wood, 'solid');
        box(cx - .5, cy - .5, .75, cx + .5, cy + .5, .83, [205, 182, 139]);
        box(cx - .43, cy - .43, .83, cx + .43, cy + .43, 1.13, cream);
        box(cx - .36, cy - .36, 1.13, cx + .36, cy + .36, 1.23, linen);
        for (const dx of [-.27, 0, .27]) box(cx + dx, cy + .435, .85, cx + dx + .025, cy + .45, 1.11, [209, 196, 163]);
        box(cx - .06, cy - .06, 1.23, cx + .06, cy + .06, 1.3, wood);
        break;
      }
      case 'vase': {
        const cx = (x + endX) / 2, cy = (y + endY) / 2;
        sphere(cx, cy, .42, .35, jade, 'solid');box(cx - .14, cy - .14, .55, cx + .14, cy + .14, .9, jade);
        for (let i = 0; i < 3; i++) {
          const angle = i * 2.4, px = cx + Math.cos(angle) * .28, py = cy + Math.sin(angle) * .28, z = 1.35 + i % 2 * .15;
          api.capsule([cx, cy, .83], [px, py, z], .025, .02, () => [102, 137, 97], 'solid');
          const petal: Colour = i % 2 ? [162, 143, 169] : [234, 220, 180];
          for (const [dx, dy] of [[-.09, 0], [.09, 0], [0, -.09], [0, .09]]) sphere(px + dx, py + dy, z, .09, petal, 'solid');
          sphere(px, py, z + .03, .045, [186, 157, 102], 'solid');
        }
        break;
      }
      case 'garden.planter':
        box(x + .4, y + .4, 0, endX - .4, endY - .4, .7, jade);
        for (const dx of [.4, .8, 1.2]) sphere(x + dx, y + .8, .95 + dx * .2, .25, [116, 150, 103], 'solid');
        break;
      case 'basket':box(x + .2, y + .2, 0, endX - .2, endY - .2, .6, paleWood); break;
      case 'lamp':
        box(x + .6, y + .6, 0, endX - .6, endY - .6, .15, ink);box(x + .8, y + .8, .1, x + .9, y + .9, 1.7, ink);
        box(x + .3, y + .3, 1.5, endX - .3, endY - .3, 1.8, [240, 210, 150]);
        break;
    }
    if (p.id !== 'rug') api.castShadow((x + endX) / 2 + .12, (y + endY) / 2 + .12, .012, Math.max(r.width, r.height) * .55, .28, 0);
  }
}


function onSurface(api: ResidentialArtApi, mapId: string): ResidentialArtApi {
  if (mapId !== 'residential-stairs') return api;
  return {
    box(x, y, z, right, front, top, colour) { const base = supportHeight(mapId, { x: (x + right) / 2, y: (y + front) / 2 });api.box(x, y, z + base, right, front, top + base, colour); },
    sphere(x, y, z, radius, colour, mode) { api.sphere(x, y, z + supportHeight(mapId, { x, y }), radius, colour, mode); },
    capsule(a, b, startRadius, endRadius, colour, mode) { api.capsule([a[0], a[1], a[2] + supportHeight(mapId, { x: a[0], y: a[1] })], [b[0], b[1], b[2] + supportHeight(mapId, { x: b[0], y: b[1] })], startRadius, endRadius, colour, mode); },
    castShadow(x, y, z, radius, strength, dither) { api.castShadow(x, y, z + supportHeight(mapId, { x, y }), radius, strength, dither); },
  };
}

type Paint = { depth: number; draw: () => void };
function paintResidential(ctx: CanvasRenderingContext2D, view: WorldRenderView, draw: (api: ResidentialArtApi) => void) {
  const paints: Paint[] = [];
  const colour = (c: Colour, light = 1) => view.shadeColor?.(c, light) ?? `rgb(${c.map(value => Math.round(value * light)).join(',')})`;
  const polygon = (points: { x: number; y: number }[], fill: string) => {
    ctx.fillStyle = fill; ctx.beginPath();
    points.forEach((point, index) => {
      if (index) ctx.lineTo(Math.round(point.x), Math.round(point.y));
      else ctx.moveTo(Math.round(point.x), Math.round(point.y));
    });
    ctx.closePath(); ctx.fill();
  };
  const radius = (x: number, y: number, size: number) => Math.abs(view.project({ x: x + size, y }).x - view.project({ x, y }).x);
  const api: ResidentialArtApi = {
    box(x, y, z, right, front, top, c) {
      if (right - x > 1.01 || front - y > 1.01) {
        for (let px = x; px < right; px += 1) for (let py = y; py < front; py += 1) api.box(px, py, z, Math.min(px + 1, right), Math.min(py + 1, front), top, c);
        return;
      }
      paints.push({ depth: x + y + right + front + top * .1, draw() {
        const a = view.project({ x, y }, top), b = view.project({ x: right, y }, top), e = view.project({ x: right, y: front }, top), f = view.project({ x, y: front }, top);
        const lowB = view.project({ x: right, y }, z), lowE = view.project({ x: right, y: front }, z), lowF = view.project({ x, y: front }, z);
        polygon([f, e, lowE, lowF], colour(c, .78)); polygon([b, e, lowE, lowB], colour(c, .65)); polygon([a, b, e, f], colour(c));
      } });
    },
    sphere(x, y, z, size, c) {
      paints.push({ depth: (x + y) * 2 + z * .1, draw() {
        const p = view.project({ x, y }, z), r = radius(x, y, size);
        ctx.fillStyle = colour(c); ctx.beginPath();ctx.ellipse(Math.round(p.x), Math.round(p.y), r, r * .85, 0, 0, Math.PI * 2);ctx.fill();
      } });
    },
    capsule(from, to, startRadius, endRadius, colorOf) {
      paints.push({ depth: from[0] + from[1] + to[0] + to[1] + to[2] * .1, draw() {
        const a = view.project({ x: from[0], y: from[1] }, from[2]), b = view.project({ x: to[0], y: to[1] }, to[2]);
        ctx.strokeStyle = colour(colorOf(to[2]));ctx.lineWidth = Math.max(1, radius(from[0], from[1], startRadius + endRadius));ctx.lineCap = 'round';
        ctx.beginPath();ctx.moveTo(Math.round(a.x), Math.round(a.y));ctx.lineTo(Math.round(b.x), Math.round(b.y));ctx.stroke();
      } });
    },
    castShadow(x, y, z, size, strength = .45) {
      const p = view.project({ x, y }, z), r = radius(x, y, size);
      paints.push({ depth: (x + y) * 2 - 3, draw() { ctx.save();ctx.globalAlpha *= strength * .18;ctx.fillStyle = view.shadeColor?.('#342c24') ?? '#342c24';ctx.beginPath();ctx.ellipse(p.x, p.y, r, r * .5, 0, 0, Math.PI * 2);ctx.fill();ctx.restore(); } });
    },
  };
  draw(api);
  paints.sort((a, b) => a.depth - b.depth).forEach(p => p.draw());
}

export const drawMap: DrawMap = (ctx, map, view) => {
  if (!mapDefinitions.some(m => m.id === map.id)) return;
  if (view.pass === 'ground') paintResidential(ctx, view, api => {
    drawResidentialFloor(api, map.id);drawResidentialProps(api, map.id, 'ground');
  });
  if (view.pass === 'foreground') paintResidential(ctx, view, api => drawResidentialProps(api, map.id, 'foreground'));
};

export function renderObjects(map: Parameters<DrawMap>[1], _view: WorldRenderView): WorldRenderObject[] {
  if (!mapDefinitions.some(m => m.id === map.id)) return [];
  return map.props.filter(p => p.layer === 'object').flatMap(prop => {
    if (prop.kind === 'railing') {
      const alongX = prop.width > prop.height, length = alongX ? prop.width : prop.height;
      return Array.from({ length: Math.ceil(length) }, (_, index) => {
        const size = Math.min(1, length - index), x = prop.position.x + (alongX ? index : 0), y = prop.position.y + (alongX ? 0 : index);
        const width = alongX ? size : prop.width, height = alongX ? prop.height : size;
        return {
          id: index ? `${prop.id}.segment-${index}` : prop.id,
          position: { x: x + width / 2, y: y + height / 2 },
          occlusion: { rect: { x, y, width, height }, height: 1.2, fadeWhenPlayerBehind: false },
          draw(ctx, view) { paintResidential(ctx, view, api => {
            const elevated = onSurface(api, map.id), px = x + (alongX ? 0 : width / 2), py = y + (alongX ? height / 2 : 0);
            const end: [number, number, number] = [px + (alongX ? size : 0), py + (alongX ? 0 : size), 1.2];
            elevated.box(px - .08, py - .08, 0, px + .08, py + .08, 1.24, wood);
            elevated.box(px - .11, py - .11, 1.19, px + .11, py + .11, 1.28, paleWood);
            for (const z of [.42, 1.2]) elevated.capsule([px, py, z], [end[0], end[1], z], .055, .055, () => wood, 'solid');
            elevated.box(end[0] - .065, end[1] - .065, 0, end[0] + .065, end[1] + .065, 1.24, wood);
          }); },
        };
      });
    }
    if (prop.kind === 'wall' || prop.kind === 'partition') {
      const parts: WorldRenderObject[] = [];
      for (let x = prop.position.x; x < prop.position.x + prop.width; x++) for (let y = prop.position.y; y < prop.position.y + prop.height; y++) {
        const width = Math.min(1, prop.position.x + prop.width - x), height = Math.min(1, prop.position.y + prop.height - y);
        parts.push({
          id: parts.length ? `${prop.id}.segment-${parts.length}` : prop.id,
          position: { x: x + width / 2, y: y + height / 2 },
          occlusion: { rect: { x, y, width, height }, height: prop.id === 'residential-stairs.middle-support' ? 3.8 : 2.8, fadeWhenPlayerBehind: true },
          draw(ctx, view) { paintResidential(ctx, view, api => {
            const elevated = onSurface(api, map.id);
            if (prop.id === 'residential-stairs.middle-support') {
              if (x >= 9 && x < 13) {
                elevated.box(x, y, 0, x + width, y + height, .95, cream);
                elevated.box(x, y, 3.7, x + width, y + height, 3.79, paleWood);
              } else {
                elevated.box(x, y, 0, x + width, y + height, 3.7, cream);
                elevated.box(x, y, 3.7, x + width, y + height, 3.79, paleWood);
              }
              elevated.box(x, y, .04, x + width, y + height, .18, wood);
            } else wall(elevated, x, y, width, height);
          }); },
        });
      }
      if (prop.id === 'residential-stairs.middle-support') for (const x of [8, 19]) parts.push({
        id: `${prop.id}.pier-${x}`, position: { x: x + .5, y: 23.825 },
        draw(ctx, view) { paintResidential(ctx, view, api => {
          const landing = stairSurfaces.find(surface => surface.id === 'home-landing')!;
          api.box(x, 23.65, -.7, x + 1, 24, landing.height - .45, [190, 181, 151]);
          api.box(x - .06, 23.6, -.72, x + 1.06, 24.05, -.48, [125, 130, 115]);
          for (const z of [.7, 1.35]) api.box(x, 23.995, z, x + 1, 24.015, z + .035, [163, 158, 132]);
        }); },
      });
      return parts;
    }
    const position = { x: prop.position.x + prop.width / 2, y: prop.position.y + prop.height / 2 };
    const occluder = map.occluders.find(o => o.id === prop.id);
    const tall = ['wardrobe', 'bookcase', 'screen', 'window'].includes(prop.kind);
    return [{
      id: prop.id, position,
      occlusion: occluder ?? (tall ? { rect: { ...prop.position, width: prop.width, height: prop.height }, height: 2.7, fadeWhenPlayerBehind: true } : undefined),
      draw(ctx, view) { paintResidential(ctx, view, api => drawResidentialProp(onSurface(api, map.id), prop)); },
    }];
  });
}

export function drawFurniture(ctx: CanvasRenderingContext2D, state: State, view: WorldRenderView) {
  if (view.pass !== 'ground') return;
  paintResidential(ctx, view, api => {
    drawApartmentFurniture(api, { ...state, placements: state.placements.filter(p => p.id === 'rug') });
    if (!state.selected || !state.draft) return;
    const placement = { id: state.selected, ...state.draft }, rect = furnitureWorldRect(placement, state.rugSize), valid = legal(state, placement);
    const colour: Colour = valid ? [84, 103, 90] : [103, 90, 74];
    const segment = valid ? Math.max(rect.width, rect.height) : .3, step = valid ? segment : .5;
    for (let at = 0; at < rect.width; at += step) {
      api.box(rect.x + at, rect.y, .075, rect.x + Math.min(at + segment, rect.width), rect.y + .055, .09, colour);
      api.box(rect.x + at, rect.y + rect.height - .055, .075, rect.x + Math.min(at + segment, rect.width), rect.y + rect.height, .09, colour);
    }
    for (let at = 0; at < rect.height; at += step) {
      api.box(rect.x, rect.y + at, .075, rect.x + .055, rect.y + Math.min(at + segment, rect.height), .09, colour);
      api.box(rect.x + rect.width - .055, rect.y + at, .075, rect.x + rect.width, rect.y + Math.min(at + segment, rect.height), .09, colour);
    }
  });
}

export function renderFurnitureObjects(state: State): WorldRenderObject[] {
  return state.placements.filter(p => p.id !== 'rug').map(p => {
    const rect = furnitureWorldRect(p, state.rugSize);
    return {
      id: `apartment.furniture.${p.id}`,
      position: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
      occlusion: p.id === 'bed' || p.id === 'table' ? { rect, height: p.id === 'bed' ? .85 : 1.3, fadeWhenPlayerBehind: false } : undefined,
      draw(ctx, view) { paintResidential(ctx, view, api => drawApartmentFurniture(api, { ...state, placements: [p] })); },
    };
  });
}

export { surfaceHeight, surfaceLevels } from '../../maps/residential/elevation';
