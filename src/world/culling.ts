import type {Rect} from './schema';
import type {WorldRenderView} from './render-contract';
/** Conservative ground-plane window from the shared absolute-Z projection. */
export function worldViewBounds(view:Pick<WorldRenderView,'project'|'width'|'height'>,padding=8):Rect|undefined {
 const origin=view.project({x:0,y:0},0),x=view.project({x:1,y:0},0),y=view.project({x:0,y:1},0);
 const ax=x.x-origin.x,ay=x.y-origin.y,bx=y.x-origin.x,by=y.y-origin.y,det=ax*by-ay*bx;
 if(!Number.isFinite(det)||Math.abs(det)<1e-9)return;
 const points=[{x:0,y:0},{x:view.width,y:0},{x:0,y:view.height},{x:view.width,y:view.height}].map(p=>{const u=p.x-origin.x,v=p.y-origin.y;return {x:(u*by-v*bx)/det,y:(v*ax-u*ay)/det};});
 const left=Math.min(...points.map(p=>p.x))-padding,top=Math.min(...points.map(p=>p.y))-padding;
 return {x:left,y:top,width:Math.max(...points.map(p=>p.x))+padding-left,height:Math.max(...points.map(p=>p.y))+padding-top};
}
