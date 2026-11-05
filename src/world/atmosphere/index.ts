export type RGB = readonly [number, number, number];
export type Point = { x: number; y: number; z?: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type DayPhase = 'morning' | 'noon' | 'evening' | 'night';
export type AtmosphereInput = {
  mapId: string; day: number; timeOfDay: DayPhase; elapsedMs: number;
  seed: number; reducedMotion: boolean;
};
export type AtmosphereHooks = {
  interior?: boolean;
  water?: readonly { id: string; rect: Rect; shore?: readonly ('north' | 'east' | 'south' | 'west')[] }[];
  lights?: readonly { id: string; position: Point; radius: number; kind: 'window' | 'lamp' }[];
  foliage?: readonly { id: string; position: Point; radius: number; kind: 'grass' | 'leaves' }[];
  shadows?: readonly { id: string; position: Point; radius: number; height: number }[];
  particles?: readonly { id: string; rect: Rect; kind: 'pollen' | 'firefly' | 'dust'; count: number }[];
};
export type AtmosphereCommand = {
  layer: 'ground' | 'light' | 'foreground';
  points: readonly Point[]; color: RGB; opacity: number;
};
export type LightState = {
  sky: RGB; water: RGB; reflection: RGB; shadow: RGB;
  ambient: RGB; sun: RGB; sunStrength: number; lampStrength: number;
  shadowOffset: readonly [number, number]; shadowOpacity: number;
};
export type AtmosphereFrame = {
  light: LightState; commands: AtmosphereCommand[];
  wind: { x: number; y: number }; animationMs: number;
};
const phases: Record<DayPhase, LightState> = {
  morning: { sky: [158,175,188], water: [89,139,150], reflection: [218,232,206], shadow: [62,77,95], ambient: [0.94,0.98,1.02], sun: [255,223,160], sunStrength: .13, lampStrength: .22, shadowOffset: [.65,.35], shadowOpacity: .24 },
  noon: { sky: [161,195,207], water: [64,133,145], reflection: [209,237,222], shadow: [48,74,81], ambient: [1,1.02,1], sun: [255,244,197], sunStrength: .08, lampStrength: .04, shadowOffset: [.13,.16], shadowOpacity: .29 },
  evening: { sky: [74,88,120], water: [65,104,128], reflection: [246,190,119], shadow: [48,53,89], ambient: [.79,.83,.97], sun: [255,196,124], sunStrength: .16, lampStrength: .88, shadowOffset: [-.85,.38], shadowOpacity: .32 },
  night: { sky: [35,47,76], water: [39,72,96], reflection: [139,180,202], shadow: [27,37,59], ambient: [.55,.65,.85], sun: [164,191,223], sunStrength: .06, lampStrength: 1, shadowOffset: [-.22,.18], shadowOpacity: .32 },
};
const mix = (a: RGB, b: RGB, t: number): RGB => a.map((v,i) => Math.round(v + (b[i]-v)*t)) as unknown as RGB;
const fraction = (n: number) => n - Math.floor(n);
const variation = (key: string, seed: number) => {
  let hash = seed | 0;
  for (let i=0; i<key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
  return (hash >>> 0) / 4294967296;
};
const square = (x: number,y: number,width: number,height=width,z=0): Point[] => [
  {x,y,z},{x:x+width,y,z},{x:x+width,y:y+height,z},{x,y:y+height,z},
];
export function shadeAtmosphereColor(color: RGB, light: LightState, exposure=1): RGB {
  const ambient = color.map((v,i)=>Math.min(255,Math.round(v*light.ambient[i]))) as unknown as RGB;
  return mix(ambient,light.sun,light.sunStrength*Math.max(0,Math.min(1,exposure)));
}

/** No timers or RNG state: identical explicit inputs produce identical frames. */
export function sampleAtmosphere(input: AtmosphereInput, hooks: AtmosphereHooks = {}, viewport?: Rect): AtmosphereFrame {
  const source = phases[input.timeOfDay];
  const light: LightState = hooks.interior ? {...source, ambient: [.92,.89,.83], sunStrength: .04, shadowOpacity: .22} : source;
  const animationMs = input.reducedMotion ? 0 : input.elapsedMs;
  const t = animationMs/1000;
  const wind = {x: Math.sin(t*.75)*.065 + Math.sin(t*.29)*.04, y: Math.sin(t*.53)*.025};
  const commands: AtmosphereCommand[] = [];
  const visible = (r: Rect, pad=2) => !viewport || r.x+r.width+pad>=viewport.x && r.x-pad<=viewport.x+viewport.width && r.y+r.height+pad>=viewport.y && r.y-pad<=viewport.y+viewport.height;
  const add = (layer: AtmosphereCommand['layer'], points: Point[], color: RGB, opacity=1) => commands.push({layer,points,color,opacity});
  for (const water of hooks.water ?? []) {
    const r = water.rect;
    if (!visible(r)) continue;
    // Base belongs below actors. Sparse reflected dashes preserve readable banks.
    add('ground',square(r.x,r.y,r.width,r.height),light.water);
    const x0 = Math.max(r.x,viewport?.x ?? r.x), y0 = Math.max(r.y,viewport?.y ?? r.y);
    const x1 = Math.min(r.x+r.width,viewport ? viewport.x+viewport.width : r.x+r.width);
    const y1 = Math.min(r.y+r.height,viewport ? viewport.y+viewport.height : r.y+r.height);
    for(let y=Math.floor(y0); y<y1; y++) for(let x=Math.floor(x0); x<x1; x++) {
      const phase=variation(`${water.id}:${x}:${y}`,input.seed);
      if(phase>.4) continue;
      const wave=Math.sin(t*1.2+phase*25+y*.7);
      const px=x+.15+phase*.55, py=y+.25+wave*.045;
      if(px<r.x || px+.3>r.x+r.width || py<r.y || py+.035>r.y+r.height) continue;
      add('ground',square(px,py,.16+phase*.35,.035),light.reflection,.28+(wave+1)*.10);
      if(phase<.13) add('ground',square(px+.07,py+.15,.13,.025),light.reflection,.22);
    }
    const shoreColor=mix(light.water,light.reflection,.43);
    for(const edge of water.shore ?? []) {
      const horizontal=edge==='north'||edge==='south';
      const length=horizontal?r.width:r.height;
      for(let i=0;i<length;i+=.5) {
        const d=Math.min(.34,length-i), phase=variation(`${water.id}:${edge}:${i}`,input.seed);
        const inset=.04+phase*.07;
        const x=horizontal?r.x+i:edge==='west'?r.x+inset:r.x+r.width-inset-.045;
        const y=horizontal?(edge==='north'?r.y+inset:r.y+r.height-inset-.045):r.y+i;
        if(!visible({x,y,width:.5,height:.5},0)) continue;
        add('ground',square(x,y,horizontal?d:.045,horizontal?.045:d),shoreColor,.7);
      }
    }
  }
  for(const shadow of hooks.shadows ?? []) {
    const {x,y}=shadow.position, r=shadow.radius;
    if(!visible({x:x-r,y:y-r,width:r*2,height:r*2})) continue;
    const dx=light.shadowOffset[0]*shadow.height, dy=light.shadowOffset[1]*shadow.height;
    add('ground',[{x:x-r,y:y-r*.4},{x:x+r,y:y-r*.4},{x:x+r+dx,y:y+r*.4+dy},{x:x-r+dx,y:y+r*.4+dy}],light.shadow,light.shadowOpacity);
    add('ground',square(x-r*.6,y-r*.25,r*1.2,r*.5),light.shadow,.24);
  }
  for(const lamp of hooks.lights ?? []) {
    const {x,y,z=0}=lamp.position, r=lamp.radius;
    if(!visible({x:x-r,y:y-r,width:r*2,height:r*2})) continue;
    const strength=light.lampStrength;
    if(strength<.1) continue;
    // Three hard-edged pools, no blur/filter/full-screen wash.
    for(const [scale,opacity] of [[1,.07],[.67,.10],[.36,.14]]) {
      const size=r*scale;
      add('light',[{x:x-size,y:y-size*.4},{x:x+size*.2,y:y-size*.8},{x:x+size,y:y-size*.1},{x:x+size*.8,y:y+size*.65},{x:x-size*.6,y:y+size*.7}], [255,200,121], opacity*strength);
    }
    add('foreground',square(x-.045,y-.025,lamp.kind==='window'?.24:.09,.055,z),[255,224,153],strength);
    if(lamp.kind==='window') add('light',square(x-.2,y+.14,.52,.1),[255,213,145],strength*.18);
  }
  for(const plant of hooks.foliage ?? []) {
    const {x,y,z=0}=plant.position, radius=plant.radius;
    if(!visible({x:x-radius,y:y-radius,width:radius*2,height:radius*2})) continue;
    const phase=variation(plant.id,input.seed)*Math.PI*2;
    const sway=(wind.x+Math.sin(t*1.1+phase)*.035)*radius;
    const leaves=plant.kind==='leaves';
    const color=shadeAtmosphereColor(leaves?[133,165,104]:[129,159,91],light,.7);
    for(let i=0;i<(leaves?5:3);i++) {
      const a=phase+i*2.4, px=x+Math.cos(a)*radius*.65, py=y+Math.sin(a)*radius*.45;
      const width=leaves?.14:.045, height=leaves?.055:.02;
      add(leaves?'foreground':'ground',square(px+sway,py,width,height,z+(leaves?0:.12+i*.025)),color,.8);
    }
  }
  for(const field of hooks.particles ?? []) {
    if(!visible(field.rect)) continue;
    const count=Math.max(0,Math.min(24,Math.floor(field.count)));
    const firefly=field.kind==='firefly';
    if(firefly && light.lampStrength<.5 || input.reducedMotion) continue;
    for(let i=0;i<count;i++) {
      const phase=variation(`${field.id}:${i}`,input.seed+input.day);
      const x=field.rect.x+fraction(phase*31+t*.007)*field.rect.width;
      const y=field.rect.y+fraction(phase*17-t*.004)*field.rect.height;
      if(!visible({x,y,width:.1,height:.1},0)) continue;
      const opacity=firefly?.3+Math.max(0,Math.sin(t*1.3+phase*24))*.5:.26;
      add('foreground',square(x,y,.035,.035,.5+phase),firefly?[235,222,145]:[239,229,191],opacity);
    }
  }
  return {light,commands,wind,animationMs};
}
