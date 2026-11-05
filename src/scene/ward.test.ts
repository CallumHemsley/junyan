import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {characterFigure, COLORS, createRenderer, HEIGHT, projectPosition, WIDTH, type SceneApi, type ScenePoint} from './renderer.js';
import {BEDS, LYING_BLANKET, lyingTransform, WARD_CAST, wardMotionBounds, wardScene, type WardFrame} from './ward.js';
import {WARD_STEPS} from './ward-steps.js';
import {captureCanvas, sha256} from './scene-frame-hashes.mjs';

const harness = () => {
  const canvas = captureCanvas();
  const renderer = createRenderer(canvas as unknown as HTMLCanvasElement, wardScene);
  return (frame:WardFrame, time = 0) => { renderer.draw(frame, time); return canvas.frame!.slice(); };
};
const frameOf = (step:string) => WARD_STEPS.find(([name]) => name === step)![1];

describe('ward scene', () => {
  it('renders every step frame without DOM globals and is deterministic', () => {
    expect(typeof document).toBe('undefined');
    const first = harness(), second = harness();
    expect(WARD_STEPS.map(([name]) => name)).toEqual(['wake','premise-2','premise-3','premise-4','doctor-zh','nurse-reply',
      'ask-milk','wrong-bread','hand-milk','ask-egg','hand-egg','aunt-arrives','aunt-asks','reply','end']);
    const hashes = new Set<string>();
    for (const [, frame] of WARD_STEPS) {
      const pixels = first(frame, .4);
      expect(sha256(second(frame, .4))).toBe(sha256(pixels));
      hashes.add(sha256(pixels));
    }
    expect(hashes.size).toBeGreaterThanOrEqual(6);
  });

  it('freezes at time 0 and animates only from the supplied time', () => {
    const render = harness(), frame = frameOf('aunt-asks');
    const still = render(frame, 0);
    render(frameOf('wake'), 7);
    expect(sha256(render(frame, 0))).toBe(sha256(still));
    const moving = render(frame, 1.3);
    const bounds = wardMotionBounds();
    let changed = 0;
    for (let index = 0; index < still.length; index += 4) {
      if (still[index]===moving[index] && still[index+1]===moving[index+1] && still[index+2]===moving[index+2]) continue;
      changed++;
      const x = index/4 % WIDTH, y = Math.floor(index/4/WIDTH);
      expect(bounds.some(([x0,y0,x1,y1]) => x>=x0 && x<=x1 && y>=y0 && y<=y1), `pixel ${x},${y}`).toBe(true);
    }
    expect(changed).toBeGreaterThan(0);
  });

  it('keeps the seated player face stable across the ambient cycle and step transitions', () => {
    const render = harness();
    const face = (pixels:Uint8ClampedArray) => {
      const crop:number[] = [];
      for (let y=99;y<=113;y++) for (let x=264;x<=278;x++) {
        const at=(y*WIDTH+x)*4;
        crop.push(...pixels.subarray(at,at+4));
      }
      return crop;
    };
    const baseline = face(render(frameOf('ask-milk'), 0));
    for (const [step, frame] of WARD_STEPS.filter(([, frame]) => frame.player==='sitting')) {
      for (const time of [0,.2,.4,.8,1.3,2.4,3.7]) {
        expect(face(render(frame, time)), `${step} at ${time}s`).toEqual(baseline);
      }
    }
  });

  it('keeps lying hands and shoes inside the blanket', () => {
    for (const bed of [BEDS.player, BEDS.elder]) {
      const to = lyingTransform(bed), parts:{point:ScenePoint;radius:number}[] = [];
      characterFigure(0,0,0,{lying:true,scale:.88},WARD_CAST.player,(start,end,radius,endRadius,colorOf) => {
        const color = colorOf(start[2]);
        const hand = color===COLORS.skin && Math.abs(radius-.12*.88)<1e-9 && start.every((value,axis) => value===end[axis]);
        if (hand || color===COLORS.shoe) parts.push({point:start,radius},{point:end,radius:endRadius});
      });
      expect(parts.length).toBe(8);
      const {forward,side,height} = LYING_BLANKET;
      for (const {point:[f,s,h],radius} of parts) {
        expect(f+radius).toBeLessThan(forward[1]);
        expect(Math.abs(s)+radius).toBeLessThan(side[1]);
        expect(h-radius).toBeGreaterThan(height[0]);
        expect(h+radius).toBeLessThan(height[1]);
        const [x,y] = to([f,s,h]);
        expect(Math.abs(x-bed.x)).toBeLessThan(1);
        expect(y).toBeGreaterThan(bed.head);
        expect(y).toBeLessThan(bed.foot);
      }
    }
  });

  it('faces every ward figure toward the camera', () => {
    const camera = [Math.sqrt(3)/2/Math.SQRT2, Math.sqrt(3)/2/Math.SQRT2, .5];
    const frames:WardFrame[] = [frameOf('wake'), frameOf('doctor-zh'), frameOf('aunt-asks'), {...frameOf('wake'), elder:'lying'}];
    for (const frame of frames) {
      const heads:ScenePoint[] = [], noses:ScenePoint[] = [];
      const api = new Proxy({}, {get:(_, key) => key==='dynamicAdd'
        ? (start:ScenePoint,end:ScenePoint,radius:number,_r:number,colorOf:(z:number)=>number[]) => {
          if (Math.hypot(start[0]-end[0],start[1]-end[1],start[2]-end[2])>1e-9 || colorOf(start[2])!==COLORS.skin) return;
          if (Math.abs(radius/.37-1)<.2 && radius>.3) heads.push(start);
          if (Math.abs(radius/.055-1)<.2) noses.push(start);
        }
        : key==='project' ? () => ({sx:-1,sy:-1,d:0}) : key==='pix' ? new Uint32Array(0) : () => {}}) as unknown as SceneApi;
      wardScene.draw(api, frame, 0);
      expect(heads.length).toBe(2+frame.present.length);
      expect(noses.length).toBe(heads.length);
      heads.forEach((head, index) => {
        const offset = noses[index].map((value, axis) => value-head[axis]);
        expect(offset.reduce((sum, value, axis) => sum+value*camera[axis], 0)).toBeGreaterThan(0);
      });
    }
  });

  it('shows at least two eye pixels on every face in every step', () => {
    const headsOf = (frame:WardFrame) => {
      const heads:ScenePoint[] = [];
      const api = new Proxy({}, {get:(_, key) => key==='dynamicAdd'
        ? (start:ScenePoint,end:ScenePoint,radius:number,_r:number,colorOf:(z:number)=>number[]) => {
          if (start.every((value,axis) => value===end[axis]) && colorOf(start[2])===COLORS.skin && radius>.3) heads.push(start);
        }
        : key==='project' ? () => ({sx:-1,sy:-1,d:0}) : key==='pix' ? new Uint32Array(0) : () => {}}) as unknown as SceneApi;
      wardScene.draw(api, frame, 0);
      return heads;
    };
    const ink = COLORS.ink;
    COLORS.ink = [255,0,255];
    try {
      const render = harness();
      for (const [step, frame] of WARD_STEPS) {
        const pixels = render(frame, 0);
        const names = ['elder','player',...frame.present];
        headsOf(frame).forEach(([x,y,z], index) => {
          const head = projectPosition({x:x+6,y:y+5}, z);
          const cx = Math.round(head.left/100*WIDTH), cy = Math.round(head.top/100*HEIGHT);
          let eyes = 0;
          for (let py=cy-6;py<=cy+5;py++) for (let px=cx-7;px<=cx+7;px++) {
            const at = (py*WIDTH+px)*4, [r,g,b] = [pixels[at],pixels[at+1],pixels[at+2]];
            if ((r+b)/2-g>70 && Math.abs(r-b)<90) eyes++;
          }
          expect(eyes, `${step} ${names[index]}`).toBeGreaterThanOrEqual(2);
        });
      }
    } finally { COLORS.ink = ink; }
  });

  it('keeps each bedside item in its own place when another is taken', () => {
    const render = harness(), base = {...frameOf('ask-milk'), held:null};
    const changed = (a:Uint8ClampedArray, b:Uint8ClampedArray) => {
      const out = new Set<number>();
      for (let index = 0; index < a.length; index += 4) {
        if (a[index]!==b[index] || a[index+1]!==b[index+1] || a[index+2]!==b[index+2]) out.add(index/4);
      }
      return out;
    };
    const empty = render({...base, table:[]});
    for (const food of ['milk','egg','bread'] as const) {
      const own = changed(empty, render({...base, table:[food]}));
      const taken = changed(render({...base, table:['milk','egg','bread']}), render({...base, table:['milk','egg','bread'].filter(item => item!==food) as WardFrame['table']}));
      expect(taken.size).toBeGreaterThan(0);
      for (const pixel of taken) {
        const near = [0,-1,1,-WIDTH,WIDTH].some(offset => own.has(pixel+offset));
        expect(near, `${food} pixel ${pixel%WIDTH},${Math.floor(pixel/WIDTH)}`).toBe(true);
      }
    }
  });

  it('draws no vermilion', () => {
    const tokens = JSON.parse(readFileSync(new URL('../../docs/design/tokens.json', import.meta.url), 'utf8'));
    const hex:string = JSON.stringify(tokens).match(/"accent","value":\{"morning":"(#[0-9a-f]{6})"/)![1];
    const vermilion = [1,3,5].map(offset => parseInt(hex.slice(offset, offset+2), 16));
    const render = harness();
    for (const [, frame] of WARD_STEPS) {
      const pixels = render(frame, .7);
      for (let index = 0; index < pixels.length; index += 4) {
        const distance = Math.hypot(pixels[index]-vermilion[0], pixels[index+1]-vermilion[1], pixels[index+2]-vermilion[2]);
        if (distance <= 30) throw Error(`vermilion-like pixel at ${index/4}`);
      }
    }
  });
});
