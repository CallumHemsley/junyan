export type RGB = readonly [number, number, number];
export type Point = { x: number; y: number; z?: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type DayPhase = 'morning' | 'noon' | 'evening' | 'night';
export type AtmosphereInput = {
  mapId: string; day: number; timeOfDay: DayPhase | number; elapsedMs: number;
  seed: number; reducedMotion: boolean;
};
export type AtmosphereHooks = {
  interior?: boolean;
  water?: readonly { id: string; rect: Rect; shore?: readonly ('north' | 'east' | 'south' | 'west')[] }[];
  reflections?: readonly {id:string;position:Point;width:number;height:number;color:RGB}[];
  lights?: readonly { id: string; position: Point; radius: number; kind: 'window' | 'lamp'; emitter?:readonly Point[] }[];
  foliage?: readonly { id: string; position: Point; radius: number; kind: 'grass' | 'leaves'; motion?:boolean; depth?:number }[];
  shadows?: readonly { id: string; position: Point; radius: number; height: number; shape?:'canopy'|'willow'|'bamboo'|'column'; contact?:boolean }[];
  shadowExclusions?:readonly Rect[];
  particles?: readonly { id: string; rect: Rect; kind: 'pollen' | 'firefly' | 'dust'; count: number }[];
};
export type AtmosphereCommand = {
  layer: 'ground' | 'light' | 'objects' | 'foreground';
  object?: {id:string;position:Point;depth?:number};
  role?:'water-base'|'cast-shadow'|'contact-shadow';
  exclusions?:readonly Rect[];
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
export const MAX_ATMOSPHERE_COMMANDS = 2048;

/** Numeric timeOfDay is explicit day progress: 0 morning, .4 noon, .75 evening, 1 night. */
export function sampleDayLight(timeOfDay: DayPhase | number): LightState {
  if(typeof timeOfDay==='string') return phases[timeOfDay];
  const progress=Math.max(0,Math.min(1,timeOfDay));
  const stops: [number,DayPhase][]=[[0,'morning'],[.4,'noon'],[.75,'evening'],[1,'night']];
  const end=stops.findIndex(([at])=>at>=progress);
  if(end<=0) return phases.morning;
  if(progress===stops[end][0]) return phases[stops[end][1]];
  const [at,b]=stops[end], [before,a]=stops[end-1], t=(progress-before)/(at-before);
  const from=phases[a], to=phases[b];
  const blend=(x:number,y:number)=>x+(y-x)*t;
  return {sky:mix(from.sky,to.sky,t),water:mix(from.water,to.water,t),reflection:mix(from.reflection,to.reflection,t),shadow:mix(from.shadow,to.shadow,t),
    ambient:[blend(from.ambient[0],to.ambient[0]),blend(from.ambient[1],to.ambient[1]),blend(from.ambient[2],to.ambient[2])],
    sun:mix(from.sun,to.sun,t),sunStrength:blend(from.sunStrength,to.sunStrength),lampStrength:blend(from.lampStrength,to.lampStrength),
    shadowOffset:[blend(from.shadowOffset[0],to.shadowOffset[0]),blend(from.shadowOffset[1],to.shadowOffset[1])],shadowOpacity:blend(from.shadowOpacity,to.shadowOpacity)};
}
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
  const sun=light.sunStrength*Math.max(0,Math.min(1,exposure));
  return color.map((v,i)=>Math.min(255,Math.round(v*(light.ambient[i]+light.sun[i]/255*sun)))) as unknown as RGB;
}

/** No timers or RNG state: identical explicit inputs produce identical frames. */
export function sampleAtmosphere(input: AtmosphereInput, hooks: AtmosphereHooks = {}, viewport?: Rect): AtmosphereFrame {
  const source = sampleDayLight(input.timeOfDay);
  const light: LightState = hooks.interior ? {...source, ambient: [.92,.89,.83], sunStrength: .04, shadowOpacity: .22} : source;
  const animationMs = input.reducedMotion ? 0 : input.elapsedMs;
  const t = animationMs/1000;
  const wind = {x: Math.sin(t*.75)*.065 + Math.sin(t*.29)*.04, y: Math.sin(t*.53)*.025};
  const commands: AtmosphereCommand[] = [];
  const visible = (r: Rect, pad=2) => !viewport || r.x+r.width+pad>=viewport.x && r.x-pad<=viewport.x+viewport.width && r.y+r.height+pad>=viewport.y && r.y-pad<=viewport.y+viewport.height;
  const add = (layer: AtmosphereCommand['layer'], points: Point[], color: RGB, opacity=1, object?:AtmosphereCommand['object'],role?:AtmosphereCommand['role']) => {if(commands.length<MAX_ATMOSPHERE_COMMANDS) commands.push({layer,points,color,opacity,object,role});};
  for (const water of hooks.water ?? []) {
    const r = water.rect;
    if (!visible(r)) continue;
    // Base belongs below actors. Sparse reflected dashes preserve readable banks.
    add('ground',square(r.x,r.y,r.width,r.height),light.water,1,undefined,'water-base');
    const x0 = Math.max(r.x,viewport?.x ?? r.x), y0 = Math.max(r.y,viewport?.y ?? r.y);
    const x1 = Math.min(r.x+r.width,viewport ? viewport.x+viewport.width : r.x+r.width);
    const y1 = Math.min(r.y+r.height,viewport ? viewport.y+viewport.height : r.y+r.height);
    for(let y=Math.floor(y0); y<y1 && commands.length<MAX_ATMOSPHERE_COMMANDS-128; y++) for(let x=Math.floor(x0); x<x1 && commands.length<MAX_ATMOSPHERE_COMMANDS-128; x++) {
      const phase=variation(`${water.id}:${x}:${y}`,input.seed);
      if(phase>.4) continue;
      const wave=Math.sin(t*1.2+phase*25+y*.7);
      const px=x+.15+phase*.55, py=y+.25+wave*.045;
      const width=.22+phase*.45,height=.065;
      if(px<r.x || px+width>r.x+r.width || py<r.y || py+height>r.y+r.height) continue;
      add('ground',square(px,py,width,height),light.reflection,.28+(wave+1)*.10);
      if(phase<.13 && px+.23<=r.x+r.width && py+.20<=r.y+r.height) add('ground',square(px+.07,py+.15,.16,.05),light.reflection,.22);
    }
    const shoreColor=mix(light.water,light.reflection,.43);
    for(const edge of water.shore ?? []) {
      const horizontal=edge==='north'||edge==='south';
      const length=horizontal?r.width:r.height;
      for(let i=0;i<length && commands.length<MAX_ATMOSPHERE_COMMANDS-64;i+=.5) {
        const d=Math.min(.34,length-i), phase=variation(`${water.id}:${edge}:${i}`,input.seed);
        const cross=horizontal?r.height:r.width,thickness=Math.min(.045,cross/4);
        const inset=Math.min(.04+phase*.07,(cross-thickness)/2);
        const x=horizontal?r.x+i:edge==='west'?r.x+inset:r.x+r.width-inset-thickness;
        const y=horizontal?(edge==='north'?r.y+inset:r.y+r.height-inset-thickness):r.y+i;
        if(!visible({x,y,width:.5,height:.5},0)) continue;
        const outside={x:horizontal?x+d/2:edge==='west'?r.x-.01:r.x+r.width+.01, y:horizontal?(edge==='north'?r.y-.01:r.y+r.height+.01):y+d/2};
        if((hooks.water??[]).some(other=>other!==water && outside.x>other.rect.x && outside.x<other.rect.x+other.rect.width && outside.y>other.rect.y && outside.y<other.rect.y+other.rect.height)) continue;
        add('ground',square(x,y,horizontal?d:thickness,horizontal?thickness:d),shoreColor,.7);
      }
    }
  }
  for(const reflection of hooks.reflections ?? []) {
    const {x,y}=reflection.position;
    if(!visible({x:x-reflection.width,y,width:reflection.width*2,height:reflection.height})) continue;
    const tint=mix(light.water,reflection.color,.38+light.lampStrength*.18);
    for(let row=0;row<12;row++) {
      const depth=row/12, width=reflection.width*(1-depth*.35);
      const offset=Math.sin(t*1.05+row*.9+variation(reflection.id,input.seed)*6)*.055;
      const px=x-width/2+offset, py=y+depth*reflection.height;
      const height=reflection.height/20;
      const water=(hooks.water??[]).find(w=>px>=w.rect.x && px+width<=w.rect.x+w.rect.width && py>=w.rect.y && py+height<=w.rect.y+w.rect.height);
      if(!water) continue;
      add('ground',square(px,py,width,height),tint,(1-depth)*.5);
    }
  }
  for(const shadow of hooks.shadows ?? []) {
    const {x,y}=shadow.position,r=shadow.radius;
    const dx=light.shadowOffset[0]*shadow.height,dy=light.shadowOffset[1]*shadow.height;
    const cx=x+dx,cy=y+dy,shape=shadow.shape??'canopy';
    if(visible({x:cx-r,y:cy-r,width:r*2,height:r*2})) {
      const phase=variation(shadow.id,input.seed)*Math.PI*2;
      const points=Array.from({length:20},(_,i)=>{
        const angle=i/20*Math.PI*2;
        const lobes=1+Math.cos(angle*3+phase)*.09+Math.sin(angle*5-phase)*.045;
        const width=shape==='bamboo'?.56:shape==='willow'?1.12:shape==='column'?.22:1;
        const depth=shape==='bamboo'?.86:shape==='willow'?.78:shape==='column'?.22:.86;
        return {x:cx+Math.cos(angle)*r*width*lobes,y:cy+Math.sin(angle)*r*depth*lobes};
      });
      if(commands.length<MAX_ATMOSPHERE_COMMANDS)commands.push({layer:'ground',role:'cast-shadow',points,color:light.shadow,opacity:light.shadowOpacity*.65,exclusions:hooks.shadowExclusions});
    }
    if(shadow.contact!==false&&visible({x:x-.25,y:y-.25,width:.5,height:.5})) {
      const contact=Math.min(.25,Math.max(.12,r*.14));
      const points=Array.from({length:12},(_,i)=>({x:x+Math.cos(i/12*Math.PI*2)*contact,y:y+Math.sin(i/12*Math.PI*2)*contact*.75}));
      if(commands.length<MAX_ATMOSPHERE_COMMANDS)commands.push({layer:'ground',role:'contact-shadow',points,color:light.shadow,opacity:.20});
    }
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
    const width=lamp.kind==='window'?.55:.16, height=lamp.kind==='window'?.48:.22;
    if(lamp.emitter) {
      if(lamp.emitter.length>=3) add('objects',[...lamp.emitter],[255,224,153],strength*.48,{id:lamp.id,position:lamp.position});
    } else {
      add('objects',[{x:x-width/2,y,z},{x:x+width/2,y,z},{x:x+width/2,y,z:z+height},{x:x-width/2,y,z:z+height}],[255,224,153],strength,{id:lamp.id,position:lamp.position});
      if(lamp.kind==='window') add('objects',[{x:x-.025,y:y-.005,z},{x:x+.025,y:y-.005,z},{x:x+.025,y:y-.005,z:z+height},{x:x-.025,y:y-.005,z:z+height}],[110,87,62],.9,{id:lamp.id,position:lamp.position});
    }
    if(lamp.kind==='window') add('light',square(x-.2,y+.14,.52,.1),[255,213,145],strength*.18);
  }
  for(const plant of hooks.foliage ?? []) {
    const {x,y,z=0}=plant.position, radius=plant.radius;
    if(!visible({x:x-radius,y:y-radius,width:radius*2,height:radius*2})) continue;
    const phase=variation(plant.id,input.seed)*Math.PI*2;
    const sway=plant.motion===false?0:(wind.x+Math.sin(t*1.1+phase)*.035)*radius;
    const leaves=plant.kind==='leaves';
    const color=shadeAtmosphereColor(leaves?[133,165,104]:[129,159,91],light,.7);
    for(let i=0;i<(leaves?5:3);i++) {
      const a=phase+i*2.4, px=x+Math.cos(a)*radius*.65, py=y+Math.sin(a)*radius*.45;
      const width=leaves?.14:.045, height=leaves?.055:.02;
      add(leaves?'objects':'ground',square(px+sway,py,width,height,z+(leaves?0:.12+i*.025)),color,.8,leaves?{id:plant.id,position:plant.position,depth:plant.depth}:undefined);
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
