import { characterFigure, type Scene, type SceneApi } from '../../../scene/renderer.js';
import { content } from '../../../content';
import { workshopDefinition as map } from '../../maps/workshop';
import { drawWorkshopProp, workshopGroundColor, type WorkshopPaintState } from './paint';

type Point = { x: number; y: number };
// An art-only adapter for the existing fixed renderer, pending foundation's world adapter.
export function workshopPreviewScene(focus: Point): Scene<[WorkshopPaintState, Point]> {
  const local = (api: SceneApi): SceneApi => ({
    ...api,
    box: (x,y,z,a,b,c,color,seed) => api.box(x-focus.x,y-focus.y,z,a-focus.x,b-focus.y,c,color,seed),
    sphere: (x,y,z,r,c,mode) => api.sphere(x-focus.x,y-focus.y,z,r,c,mode),
    capsule: (a,b,r,s,c,mode) => api.capsule([a[0]-focus.x,a[1]-focus.y,a[2]],[b[0]-focus.x,b[1]-focus.y,b[2]],r,s,c,mode),
    dynamicAdd: (a,b,r,s,c) => api.dynamicAdd([a[0]-focus.x,a[1]-focus.y,a[2]],[b[0]-focus.x,b[1]-focus.y,b[2]],r,s,c),
  });
  const dynamic = new Set(['lamp-bench','toy-bench','display-shelf']);
  return {
    bake(api) {
      api.pix.fill(api.rgb(68,67,57)); api.zb.fill(-1e9);
      for(let iy=0;iy<api.H;iy++) for(let ix=0;ix<api.W;ix++) {
        const g=api.unproject(ix+.5,iy+.5), x=g.x+focus.x,y=g.y+focus.y;
        const color=workshopGroundColor(x,y);
        if(!color) continue;
        const i=iy*api.W+ix;
        api.pix[i]=api.rgb(...color);api.ground[i]=1;api.zb[i]=(g.x+g.y)/api.R2*api.COS;
      }
      api.groundZ.set(api.zb);
      const draw=local(api);
      for(const prop of map.props) if(!dynamic.has(prop.kind)) drawWorkshopProp(draw,prop,{elapsedSeconds:0});
    },
    draw(api,state,player) {
      const draw=local(api);
      for(const prop of map.props) if(dynamic.has(prop.kind)) drawWorkshopProp(draw,prop,state);
      const member=content.characters.find(c=>c.id==='xiao-zhou')!;
      characterFigure(player.x,player.y,0,{scale:1.05},member.appearance,draw.dynamicAdd);
      api.flushShadows();api.applyShadows(api.bakedZ);api.shadeEdges();
    },
  };
}
