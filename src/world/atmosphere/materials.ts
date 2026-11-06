import {shadeAtmosphereColor,type LightState,type RGB} from './index';

export function shadeAtmosphereCss(style:string,light:LightState,exposure=1):string {
  let color:RGB,alpha=1;
  const hex=/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(style);
  if(hex) {
    const digits=hex[1].length<5?[...hex[1]].map(c=>c+c).join(''):hex[1];
    color=[0,2,4].map(i=>parseInt(digits.slice(i,i+2),16)) as unknown as RGB;
    if(digits.length===8)alpha=parseInt(digits.slice(6,8),16)/255;
  } else {
    const rgb=/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i.exec(style);
    if(!rgb)return style;
    color=[Number(rgb[1]),Number(rgb[2]),Number(rgb[3])];alpha=rgb[4]===undefined?1:Number(rgb[4]);
  }
  const shaded=shadeAtmosphereColor(color,light,exposure);
  return `rgba(${shaded.join(',')},${alpha})`;
}

export type MaterialShade=(base:RGB|string,exposure?:number)=>string;

/** Explicit material boundary; outputs never change how later base colours are interpreted. */
export function createAtmosphereColorShader(light:LightState):MaterialShade {
  const cache=new Map<string,string>();
  return (base,exposure=1)=>{
    const key=`${typeof base}:${base}:${exposure}`,cached=cache.get(key);
    if(cached!==undefined)return cached;
    const value=shadeAtmosphereCss(typeof base==='string'?base:`rgb(${base.join(',')})`,light,exposure);
    if(cache.size>=2048)cache.clear();
    cache.set(key,value);return value;
  };
}
