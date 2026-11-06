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
export function box(ctx: CanvasRenderingContext2D, v: RestaurantView, x: number, y: number, z: number, w: number, d: number, h: number, top: string, left = palette.woodDark, right = palette.wood, material: 'wood' | 'plaster' = 'wood') {
  materialFace(ctx,v,[[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],left,.91,material);
  materialFace(ctx,v,[[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],right,.72,material);
  materialFace(ctx,v,[[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],top,1.03,material);
}

const materialPlanes=new Map<string,OffscreenCanvas>();

// Shade whole material planes; grain follows their world coordinates rather than scattered screen flecks.
function materialFace(ctx: CanvasRenderingContext2D, v: RestaurantView, points: readonly Point3[], base: string, exposure: number, material: 'wood' | 'plaster') {
  const projected=points.map(([x,y,z])=>v.project({x,y},z));
  const [a,b,,d]=projected,grid=(n:number)=>Math.round(n*1024)/1024;
  const ux=grid(b.x-a.x),uy=grid(b.y-a.y),vx=grid(d.x-a.x),vy=grid(d.y-a.y);
  const determinant=ux*vy-uy*vx;
  if(Math.abs(determinant)<.1)return;
  const minX=Math.floor(Math.min(0,ux,ux+vx,vx)),maxX=Math.ceil(Math.max(0,ux,ux+vx,vx));
  const minY=Math.floor(Math.min(0,uy,uy+vy,vy)),maxY=Math.ceil(Math.max(0,uy,uy+vy,vy));
  const rgb=[1,3,5].map(i=>parseInt(base.slice(i,i+2),16));
  const colors=Array.from({length:5},(_,band)=>{
    const value=exposure+(band-2)*.045,tint=value<1?[58,49,78]:[255,232,180],mix=value<1?.12:.08;
    const color='#'+rgb.map((c,i)=>Math.round(Math.max(0,Math.min(255,c*value*(1-mix)+tint[i]*mix))).toString(16).padStart(2,'0')).join('');
    return v.shadeColor?.(color)??color;
  });
  const key=JSON.stringify([points,ux,uy,vx,vy,colors,material]);
  const cached=materialPlanes.get(key);
  if(cached){ctx.drawImage(cached,Math.round(a.x)+minX,Math.round(a.y)+minY);return;}
  const plane=typeof OffscreenCanvas==='undefined'?null:new OffscreenCanvas(Math.max(1,maxX-minX),Math.max(1,maxY-minY));
  const target=plane?.getContext('2d')??ctx;
  for(let py=minY;py<maxY;py++)for(let px=minX;px<maxX;px++){
    const dx=px+.5,dy=py+.5,u=(dx*vy-dy*vx)/determinant,t=(ux*dy-uy*dx)/determinant;
    if(u<0||u>1||t<0||t>1)continue;
    const wx=points[0][0]+(points[1][0]-points[0][0])*u+(points[3][0]-points[0][0])*t;
    const wy=points[0][1]+(points[1][1]-points[0][1])*u+(points[3][1]-points[0][1])*t;
    const wz=points[0][2]+(points[1][2]-points[0][2])*u+(points[3][2]-points[0][2])*t;
    const grain=material==='plaster' ? Math.sin(wx*127.1+wy*311.7+wz*73.1)*.55 : Math.sin(wx*4.2+Math.sin(wy*1.7)*.7+wz*17)+Math.sin(wy*28+wz*3)*.38;
    const edge=Math.min(u,1-u,t,1-t),band=material==='wood'&&edge<.035?0:Math.max(0,Math.min(4,Math.round(2+grain)));
    target.fillStyle=colors[band];
    target.fillRect(plane?px-minX:Math.round(a.x)+px,plane?py-minY:Math.round(a.y)+py,1,1);
  }
  if(plane){
    // Room geometry is fixed; translated cameras reuse native planes without repainting their grain.
    if(materialPlanes.size>=2048)materialPlanes.delete(materialPlanes.keys().next().value!);
    materialPlanes.set(key,plane);ctx.drawImage(plane,Math.round(a.x)+minX,Math.round(a.y)+minY);
  }
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
