import {shadeAtmosphereColor,type LightState,type RGB} from "./atmosphere";
export type ShadeColor=(base:RGB|string,brightness?:number)=>string;
const shaders=new Map<string,ShadeColor>();
export function colorShader(light:LightState):ShadeColor {
 const key=JSON.stringify(light);const prior=shaders.get(key);if(prior)return prior;
 const cache=new Map<string,string>();
 const shade:ShadeColor=(base,brightness=1)=>{
  const id=`${base}/${brightness}`,known=cache.get(id);if(known)return known;
  let rgb:RGB,alpha="";
  if(typeof base!=="string")rgb=base;
  else if(/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(base)){rgb=[parseInt(base.slice(1,3),16),parseInt(base.slice(3,5),16),parseInt(base.slice(5,7),16)];alpha=base.slice(7);}
  else {const match=base.match(/^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);if(!match)return base;rgb=[Number(match[1]),Number(match[2]),Number(match[3])];if(match[4])alpha=Math.round(Number(match[4])*255).toString(16).padStart(2,"0");}
  const factor=Math.max(0,brightness);
  // Face brightness scales the material, including ambient light; solar exposure is a separate atmosphere input.
  const value="#"+shadeAtmosphereColor([rgb[0]*factor,rgb[1]*factor,rgb[2]*factor],light).map(v=>Math.round(v).toString(16).padStart(2,"0")).join("")+alpha;
  cache.set(id,value);return value;
 };
 shaders.set(key,shade);return shade;
}
