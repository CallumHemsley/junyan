import type { RestaurantView } from './types';

export const palette = {
  ink: '#40382e', wood: '#ac8055', woodLight: '#cba06b', woodDark: '#76543b',
  cream: '#efe0bb', tile: '#e0d0ae', grout: '#baaa8d', jade: '#749786',
  jadeDark: '#4f7065', cool: '#8dabb6', brass: '#d5ad6a', white: '#fff3d7',
};
export type Point3 = readonly [number, number, number];
export function polygon(ctx: CanvasRenderingContext2D, view: RestaurantView, points: readonly Point3[], color: string) {
  ctx.fillStyle = view.shadeColor?.(color) ?? color;
  ctx.beginPath();
  points.forEach(([x,y,z], i) => {
    const p = view.project({ x,y }, z);
    if (i) ctx.lineTo(Math.round(p.x), Math.round(p.y));
    else ctx.moveTo(Math.round(p.x), Math.round(p.y));
  });
  ctx.closePath(); ctx.fill();
}
export function box(ctx: CanvasRenderingContext2D, v: RestaurantView, x: number, y: number, z: number, w: number, d: number, h: number, top: string, left = palette.woodDark, right = palette.wood) {
  polygon(ctx,v,[[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],left);
  polygon(ctx,v,[[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],right);
  polygon(ctx,v,[[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],top);
  if (w*d > 1) texture(ctx,v,x,y,z+h,w,d,top,'top');
  if (w*h > 1) texture(ctx,v,x,y+d,z,w,h,left,'front');
  if (d*h > 1) texture(ctx,v,x+w,y,z,d,h,right,'side');
}
export function oval(ctx: CanvasRenderingContext2D, v: RestaurantView, x: number, y: number, z: number, radius: number, color: string) {
  const p=v.project({x,y},z), edge=v.project({x:x+radius,y},z);
  const r=Math.hypot(edge.x-p.x,edge.y-p.y);
  ctx.fillStyle=v.shadeColor?.(color) ?? color; ctx.beginPath(); ctx.ellipse(Math.round(p.x),Math.round(p.y),r,r*.48,0,0,Math.PI*2); ctx.fill();
}
export function bowl(ctx: CanvasRenderingContext2D, v: RestaurantView, x: number, y: number, z: number, filled = true) {
  oval(ctx,v,x,y,z,.25,palette.jadeDark);
  oval(ctx,v,x,y,z+.13,.34,palette.jade);
  oval(ctx,v,x,y,z+.18,.27,filled ? palette.white : '#b8c5af');
}

function texture(ctx: CanvasRenderingContext2D, v: RestaurantView, x: number, y: number, z: number, w: number, h: number, base: string, face: 'top' | 'front' | 'side') {
  const rgb=[1,3,5].map(i=>parseInt(base.slice(i,i+2),16));
  const count=Math.floor(w*h*7);
  for(let i=0;i<count;i++) {
    const seed=Math.sin(i*127.1+x*19.3+y*31.7+z*11.1)*43758.5453;
    const a=seed-Math.floor(seed),b=((i*47+31)%101)/101;
    const point=face==='top'?v.project({x:x+a*w,y:y+b*h},z):face==='front'?v.project({x:x+a*w,y},z+b*h):v.project({x,y:y+a*w},z+b*h);
    const shift=a>.5?11:-12;
    const color='#'+rgb.map(c=>Math.max(0,Math.min(255,c+shift)).toString(16).padStart(2,'0')).join('');
    ctx.fillStyle=v.shadeColor?.(color)??color;
    ctx.fillRect(Math.round(point.x),Math.round(point.y),1+(i%5===0?1:0),1);
  }
}
