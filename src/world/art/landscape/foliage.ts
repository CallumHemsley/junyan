/** Authored native pixel foliage; ground contact and cast shadows belong to the caller. */
export type FoliageSpecies = 'camphor' | 'willow' | 'fruit';
export type FoliageInput = {
  species: FoliageSpecies; seed: number; elapsedMs: number; reducedMotion: boolean;
  shadeColor: (base: string) => string;
};
export type FoliageBounds = { minX: number; minY: number; maxX: number; maxY: number };
type Patch = readonly [number, number, number, number];
type Bough = readonly [number, number, number];

const palettes = {
  camphor: ['#395b49', '#537451', '#789252', '#a7b56b', '#c3c780'],
  willow: ['#405f52', '#5b7b5b', '#819b68', '#acb980', '#c5c98e'],
  fruit: ['#455e45', '#627d4c', '#899952', '#b5b875', '#d3cb8d'],
} as const;
const wood = ['#61583f', '#897249', '#b29a69'] as const;
// Each tuft has a stepped edge, a broad lit plane, and small connected leaf tips.
// The four drawings differ in their contour and light placement, not random stipple.
const tufts: readonly (readonly Patch[])[] = [
  [[-8,-12,15,3],[-13,-9,24,4],[-17,-5,32,5],[-19,0,36,5],[-15,5,33,4],[-10,9,23,3]],
  [[-5,-14,12,3],[-11,-11,22,4],[-15,-7,31,4],[-18,-3,34,5],[-16,2,36,5],[-10,7,27,4],[-3,11,15,2]],
  [[-12,-10,17,3],[-17,-7,28,4],[-20,-3,35,4],[-18,1,37,4],[-14,5,29,4],[-6,9,16,2]],
  [[-6,-11,16,3],[-12,-8,26,4],[-15,-4,33,4],[-18,0,34,5],[-13,5,26,4],[-9,9,16,2]],
];
const lit: readonly (readonly Patch[])[] = [
  [[-8,-12,13,2],[-12,-9,20,3],[-15,-5,19,3],[-17,0,12,3],[-7,-5,17,4],[0,-1,11,3]],
  [[-5,-14,10,2],[-10,-11,17,3],[-13,-7,24,3],[-16,-3,15,3],[-10,0,21,3],[0,3,11,3]],
  [[-12,-10,14,2],[-16,-7,21,3],[-18,-3,26,3],[-15,1,18,3],[-7,4,16,3]],
  [[-6,-11,13,2],[-11,-8,20,3],[-13,-4,24,3],[-16,0,17,3],[-10,3,19,3]],
];
const camphorTufts: readonly Bough[] = [
  [-44,-66,2],[-22,-89,1],[9,-100,0],[39,-85,3],
  [51,-60,1],[23,-67,2],[-3,-79,3],[-43,-48,3],
  [-17,-56,0],[39,-42,2],[-11,-102,3],[-40,-85,0],
];
const fruitTufts: readonly Bough[] = [
  [-31,-64,3],[28,-67,2],[-13,-86,1],[14,-94,3],
  [-42,-44,2],[41,-46,0],[-16,-48,3],[13,-64,0],
];
const willowTufts: readonly Bough[] = [
  [-31,-87,2],[-7,-99,3],[20,-94,0],[43,-77,2],[-50,-68,3],[5,-78,2],
];
const bounds: Record<FoliageSpecies, FoliageBounds> = {
  camphor: { minX: -68, minY: -119, maxX: 76, maxY: 4 },
  willow: { minX: -77, minY: -116, maxX: 72, maxY: 4 },
  fruit: { minX: -67, minY: -110, maxX: 66, maxY: 4 },
};
export function foliageBounds(input: Pick<FoliageInput, 'species' | 'seed'>): FoliageBounds {
  return { ...bounds[input.species] };
}

export function drawFoliage(ctx: CanvasRenderingContext2D, input: FoliageInput): void {
  const bases: readonly string[] = [...palettes[input.species], ...wood, ...(input.species === 'fruit' ? ['#ba874b', '#e3b771'] : [])];
  const colors = bases.map(base => input.shadeColor(base));
  const rect = (x: number, y: number, w: number, h: number, c: number) => {
    ctx.fillStyle = colors[c]; ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  // Rasterize limbs into integer spans, preserving crisp native pixels at every bend.
  const limb = (points: readonly (readonly [number, number])[], width: number, c: number) => {
    for (let n = 1; n < points.length; n++) {
      const [ax, ay] = points[n-1], [bx, by] = points[n];
      const count = Math.max(Math.abs(bx-ax), Math.abs(by-ay));
      for (let i = 0; i <= count; i++) rect(ax+(bx-ax)*i/Math.max(1,count)-Math.floor(width/2), ay+(by-ay)*i/Math.max(1,count), width, 1, c);
    }
  };
  const tuft = (x: number, y: number, shape: number) => {
    for (const [a,b,w,h] of tufts[shape]) rect(x+a,y+b,w,h,0);
    for (const [a,b,w,h] of lit[shape]) rect(x+a,y+b+2,w,h+1,1);
    for (const [a,b,w,h] of lit[shape].slice(0,3)) rect(x+a,y+b,Math.max(5,w-3),h,2);
    // Broken light planes turn around each tuft rather than striping its full width.
    rect(x-8,y-7,8,5,2); rect(x-11,y-4,5,5,2);
    rect(x-5,y-10,7,3,3); rect(x-9,y-7,5,2,3);
    rect(x+3,y-5,6,4,2); rect(x+1,y-7,4,2,3);
    rect(x-3,y-10,3,1,4);
    rect(x+8,y+3,5,3,1); rect(x-10,y+6,5,2,1);
    rect(x-3,y+2,6,3,2); rect(x+2,y+4,4,2,1);

  };
  ctx.save();
  try {
    const willow = input.species === 'willow';
    const trunk: readonly (readonly [number, number])[] = willow ? [[0,0],[-5,-22],[-14,-44],[-11,-66],[1,-89]] : [[0,0],[-2,-24],[1,-45],[-4,-70]];
    limb(trunk,9,5); limb(trunk.map(([x,y])=>[x-2,y] as const),3,6);
    limb([[-2,-2],[-10,2]],3,5); limb([[1,-2],[11,2]],3,5);
    limb([[-3,-31],[-17,-46],[-31,-58],[-42,-76]],5,5);
    limb([[-2,-40],[16,-51],[31,-71],[42,-78]],5,5);
    limb([[-1,-54],[-15,-73],[-18,-90]],4,6);
    limb([[2,-44],[24,-40],[42,-49]],4,5);
    limb([[-16,-46],[-31,-43],[-45,-50]],3,6);
    limb([[0,-2],[-2,-24],[1,-43]],2,7);
    const clusters = willow ? willowTufts : input.species === 'camphor' ? camphorTufts : fruitTufts;
    for (const [x,y,shape] of clusters) tuft(x,y,shape);
    if (willow) {
      // Deliberate uneven curtains: narrow sky slits remain between hanging boughs.
      const curtains = [[-62,-69,37],[-53,-82,48],[-42,-87,30],[-33,-94,56],[-21,-102,35],[-8,-104,44],[5,-96,60],[19,-94,40],[31,-88,55],[43,-78,49],[55,-71,31]];
      const phase = (Math.trunc(input.seed) >>> 0) % 31;
      for (let n=0;n<curtains.length;n++) {
        const [x,y,length] = curtains[n];
        const sway = input.reducedMotion ? 0 : Math.round(Math.sin(input.elapsedMs/1500+phase+n*.7));
        for (let h=0;h<length;h+=5) {
          const bend = h>length*.55 ? sway : 0;
          rect(x+bend,y+h,4,Math.min(5,length-h),1);
          rect(x-1+bend,y+h,2,3,2);
          if(h%10===0) rect(x-3+bend,y+h+1,3,2,3);
        }
        rect(x+sway,y+length,2,3,2);
      }
    }
    if (input.species === 'fruit') {
      const offset = (Math.trunc(input.seed) >>> 0) % 2;
      for (const [x,y] of [[-39,-48],[-30,-65],[-9,-81],[21,-91],[28,-68],[40,-45],[9,-61],[-14,-47]]) {
        rect(x,y+offset,4,4,8); rect(x,y+offset,3,2,9); rect(x+1,y-2+offset,1,2,5);
      }
    }
  } finally { ctx.restore(); }
}
