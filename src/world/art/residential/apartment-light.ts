import {authoredLocalLights} from '../../atmosphere/local-lights';
import type {RGB} from '../../atmosphere';
import type {AtmosphereMap} from '../../atmosphere/map-hooks';

export type ReceivingFace={x:number;y:number;z:number;normal:readonly [number,number,number]};
type Source={position:{x:number;y:number;z:number};radius:number;color:RGB;kind:'lamp'|'window'};

/** Add local irradiance to once-graded material RGB; never grades or changes canvas opacity. */
export function apartmentReceiver(map:AtmosphereMap,lampStrength=0) {
  // Existing service phase strengths are .22 morning/.04 noon: both receive exactly zero.
  const strength=Math.max(0,Math.min(1,(lampStrength-.22)/.78));
  const lights=map.id==='apartment'?authoredLocalLights(map).lights??[]:[];
  const sources:Source[]=lights.flatMap(light=>{
    // Lower panes carry the window's restrained receiving contribution; upper panes are visible apertures only.
    if(light.kind==='window'&&(light.position.z??0)>2.2)return [];
    return [{position:{...light.position,z:light.position.z??0},radius:light.radius,color:light.color??[255,224,153],kind:light.kind}];
  });
  return (graded:string,albedo:RGB,brightness:number,face:ReceivingFace):string=>{
    if(strength===0||!/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(graded))return graded;
    const incident=[0,0,0],normalLength=Math.hypot(...face.normal);
    if(!normalLength)return graded;
    for(const source of sources){
      if(source.kind==='window'&&face.y<source.position.y-.02||source.kind==='lamp'&&face.z>source.position.z)continue;
      const dx=source.position.x-face.x,dy=source.position.y-face.y,dz=source.position.z-face.z;
      const distance=Math.hypot(dx,dy,dz);
      if(distance>=source.radius||distance<.001)continue;
      const facing=Math.max(0,(dx*face.normal[0]+dy*face.normal[1]+dz*face.normal[2])/(distance*normalLength));
      const falloff=(1-distance/source.radius)**2;
      const energy=strength*falloff*facing*(source.kind==='lamp'?1.05:.11);
      for(let i=0;i<3;i++)incident[i]+=energy*source.color[i]/255;
    }
    if(incident.every(value=>value===0))return graded;
    const rgb=[0,1,2].map(i=>{
      const ambient=parseInt(graded.slice(1+i*2,3+i*2),16);
      return Math.max(0,Math.min(255,Math.round(ambient+albedo[i]*Math.max(0,brightness)*Math.min(.72,incident[i]))));
    });
    return '#'+rgb.map(value=>value.toString(16).padStart(2,'0')).join('')+graded.slice(7);
  };
}
