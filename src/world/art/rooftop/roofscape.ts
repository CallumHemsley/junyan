import type {Point} from '../../schema';

type Building = {
  id: string; x: number; y: number; width: number; depth: number;
  roof: number; band: 'near' | 'far'; style: 'terrace' | 'tile' | 'sawtooth'; variant: number;
};
type Paint = {
  project(x: number, y: number, z?: number): Point;
  polygon(points: Point[], color: string): void;
  plane(x: number, y: number, width: number, depth: number, z: number, color: string): void;
  box(x: number, y: number, width: number, depth: number, z: number, height: number, top: string, front?: string, side?: string): void;
  stem(a: Point, b: Point, za: number, zb: number, color: string, width?: number): void;
};

// Render-only neighbouring blocks sit outside map bounds and below the garden roof.
export const roofscapeBuildings: readonly Building[] = [
  ...Array.from({length: 9}, (_, i): Building => ({id: `west-near-${i}`, x: -11 - i % 2, y: -20 + i * 11,
    width: 8 + i % 2, depth: 8 + i % 3, roof: -3 - i % 3 * .65, band: 'near', style: i % 3 === 0 ? 'terrace' : 'tile', variant: i})),
  ...Array.from({length: 9}, (_, i): Building => ({id: `west-far-${i}`, x: -31 - i % 2 * 2, y: -24 + i * 12,
    width: 13, depth: 10, roof: -7 - i % 3, band: 'far', style: i % 2 ? 'terrace' : 'tile', variant: i + 2})),
  ...Array.from({length: 8}, (_, i): Building => ({id: `south-near-${i}`, x: -24 + i * 13, y: 37.5 + i % 2,
    width: 10 + i % 3, depth: 11, roof: -3.2 - i % 3 * .8, band: 'near', style: i % 3 === 0 ? 'sawtooth' : i % 2 ? 'tile' : 'terrace', variant: i + 3})),
  ...Array.from({length: 8}, (_, i): Building => ({id: `south-far-${i}`, x: -28 + i * 15, y: 57 + i % 2 * 2,
    width: 12, depth: 14, roof: -8 - i % 3, band: 'far', style: i % 2 ? 'tile' : 'terrace', variant: i + 1})),
  ...Array.from({length: 8}, (_, i): Building => ({id: `east-near-${i}`, x: 49.5 + i % 2, y: -18 + i * 12,
    width: 12, depth: 9, roof: -4.5 - i % 3 * .6, band: 'near', style: i % 3 === 0 ? 'sawtooth' : i % 2 ? 'terrace' : 'tile', variant: i})),
  ...Array.from({length: 8}, (_, i): Building => ({id: `east-far-${i}`, x: 71, y: -22 + i * 14,
    width: 14, depth: 11, roof: -8 - i % 3, band: 'far', style: i % 2 ? 'terrace' : 'tile', variant: i + 2})),
];

export function drawRoofscape(p: Paint, viewport: {width: number; height: number}) {
  const {box, plane, polygon, project, stem} = p;
  // Street surfaces are finite world geometry beneath the neighbouring blocks.
  plane(-37, -26, 35, 120, -17, '#748c87');
  plane(-37, 37, 132, 44, -17, '#81958e');
  plane(49, -26, 44, 120, -17, '#748d88');
  for (const [x, y, w, h] of [[-18, -24, 2, 116], [-2.5, 0, 1.5, 84], [-36, 53, 132, 2], [47.5, -24, 2, 106], [66, -24, 2, 112]])
    plane(x, y, w, h, -16.98, '#a2b1a3');

  const blocks = [...roofscapeBuildings].sort((a, b) => a.x + a.y - b.x - b.y);
  for (const b of blocks) {
    const {x, y, width: w, depth: d, roof: z, variant} = b;
    const corners = [project(x, y, z + 2), project(x + w, y, z + 2), project(x, y + d, z + 2), project(x + w, y + d, z + 2),
      project(x, y, -16), project(x + w, y, -16), project(x, y + d, -16), project(x + w, y + d, -16)];
    if (corners.every(c => c.x < -3) || corners.every(c => c.x > viewport.width + 3) || corners.every(c => c.y < -3) || corners.every(c => c.y > viewport.height + 3)) continue;
    const far = b.band === 'far';
    const colors = far ? ['#a6b9b6', '#91a7a2', '#839f9a', '#aebfbb'] :
      variant % 3 === 0 ? ['#b2b7a3', '#929e8f', '#7b9187', '#d0c9aa'] :
      variant % 3 === 1 ? ['#94aaa5', '#768f89', '#627e79', '#b8c5b6'] : ['#b5ad97', '#948f7d', '#7a8577', '#d4c9ad'];
    box(x, y, w, d, -16, z + 16, colors[0], colors[1], colors[2]);
    if (b.style === 'terrace') {
      plane(x + .3, y + .3, w - .6, d - .6, z + .03, far ? '#b1bfba' : '#b6bba8');
      for (const [dx, dy, rw, rd] of [[0, 0, w, .2], [0, 0, .2, d], [w - .2, 0, .2, d], [0, d - .2, w, .2]])
        box(x + dx, y + dy, rw, rd, z, .35, colors[3], colors[1], colors[2]);
      box(x + .9, y + 1, 2.4, 2.1, z, 1.45, colors[2], colors[1], colors[2]);
      box(x + .7, y + .8, 2.8, 2.5, z + 1.45, .12, colors[3], colors[2], colors[2]);
      if (!far) {
        for (let k = 0; k < 3; k++) box(x + w - 2.2, y + 1 + k * .65, 1.25, .45, z, .32, '#8eaa9b', '#738f82', '#627d74');
        stem({x: x + 1, y: y + d - 1.2}, {x: x + w - 1, y: y + d - 1.2}, z + 1.6, z + 1.6, '#74877d');
        for (let k = 1.5; k < w - 2; k += 1.7)
          polygon([project(x + k, y + d - 1.2, z + 1.5), project(x + k + .8, y + d - 1.2, z + 1.5), project(x + k + .8, y + d - 1.2, z + .65), project(x + k, y + d - 1.2, z + .65)], k % 2 > 1 ? '#a5bdb0' : '#d7d4ba');
      }
    } else {
      const ridges = b.style === 'sawtooth' ? 3 : 1;
      for (let r = 0; r < ridges; r++) {
        const rx = x + r * w / ridges, rw = w / ridges, rise = far ? .65 : 1.1;
        polygon([project(rx - .12, y - .15, z), project(rx + rw / 2, y - .15, z + rise), project(rx + rw / 2, y + d + .15, z + rise), project(rx - .12, y + d + .15, z)], far ? '#a4b8b3' : '#819e94');
        polygon([project(rx + rw / 2, y - .15, z + rise), project(rx + rw + .12, y - .15, z), project(rx + rw + .12, y + d + .15, z), project(rx + rw / 2, y + d + .15, z + rise)], far ? '#8da8a2' : '#627f78');
        for (let k = .4; k < rw / 2; k += .6) {
          const hz = z + rise * k / (rw / 2);
          stem({x: rx + k, y: y - .1}, {x: rx + k, y: y + d + .1}, hz + .03, hz + .03, far ? '#b3c3bd' : '#a0b4a5');
        }
      }
    }
    if (!far) {
      for (let floor = -12; floor < z - 1.3; floor += 2.6) for (let k = 1; k < w - .5; k += 2) {
        polygon([project(x + k, y + d + .02, floor), project(x + k + .65, y + d + .02, floor), project(x + k + .65, y + d + .02, floor + .85), project(x + k, y + d + .02, floor + .85)], '#aebeb2');
      }
      if (variant % 3 === 1) box(x + w - 1.7, y + d + .05, 1.1, .3, z - 2, .55, '#bfc6b2', '#98a99b', '#849b91');
    }
  }

  // The garden building continues below its front and east parapets.
  polygon([project(1, 35, -.3), project(47, 35, -.3), project(47, 35, -7.5), project(1, 35, -7.5)], '#8e9e90');
  polygon([project(47, 1, -.3), project(47, 35, -.3), project(47, 35, -7.5), project(47, 1, -7.5)], '#748e84');
  for (const z of [-3.2, -6.4]) {
    stem({x: 1, y: 35.02}, {x: 47, y: 35.02}, z + 1.1, z + 1.1, '#b1b9a1');
    for (let x = 3; x < 46; x += 4.5) {
      polygon([project(x, 35.03, z), project(x + 1.4, 35.03, z), project(x + 1.4, 35.03, z + 1), project(x, 35.03, z + 1)], '#657f78');
      stem({x: x + .7, y: 35.04}, {x: x + .7, y: 35.04}, z, z + 1, '#a7b9aa');
    }
    for (let y = 3; y < 33; y += 4.5)
      polygon([project(47.03, y, z), project(47.03, y + 1.3, z), project(47.03, y + 1.3, z + 1), project(47.03, y, z + 1)], '#58776f');
  }
  for (const x of [10, 28, 43]) stem({x, y: 35.06}, {x, y: 35.06}, -.5, -7.5, '#6b8e83', 2);
}
