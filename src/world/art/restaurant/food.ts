import type { Food } from '../../../contracts';
import type { RestaurantView } from './types';
import { box, bowl, oval, palette as p, polygon } from './primitives';

export function drawFood(ctx: CanvasRenderingContext2D, v: RestaurantView, kind: Food['kind'], x: number, y: number, z: number) {
  if(kind==='porridge'||kind==='dumpling') {
    bowl(ctx,v,x,y,z);
    if(kind==='dumpling') for(const dx of [-.12,.12]) {
      oval(ctx,v,x+dx,y,z+.26,.13,p.white);
      polygon(ctx,v,[[x+dx-.09,y,z+.28],[x+dx,y-.06,z+.35],[x+dx+.09,y,z+.28]],'#d8c49c');
    }
  } else if(kind==='milk') {
    box(ctx,v,x-.16,y-.16,z,.32,.32,.53,p.cream,p.jadeDark,p.jade);
    oval(ctx,v,x,y,z+.55,.23,p.white);
    box(ctx,v,x+.04,y-.03,z+.55,.035,.035,.32,p.woodDark);
  } else {
    oval(ctx,v,x,y,z-.02,.34,p.cream);
    if(kind==='bun') {
      oval(ctx,v,x,y,z+.1,.26,'#dec99e');
      oval(ctx,v,x,y,z+.24,.23,p.white);
      for(const dx of [-.07,0,.07]) polygon(ctx,v,[[x+dx,y-.08,z+.25],[x+dx+.025,y+.03,z+.28],[x+dx+.035,y+.03,z+.27]],'#c9ac7a');
    } else if(kind==='bread') {
      box(ctx,v,x-.24,y-.19,z,.48,.38,.33,p.cream,'#d2b88b','#dec99e');
      for(const dx of [-.12,.08]) box(ctx,v,x+dx,y-.19,z+.333,.026,.38,.006,'#bda06d');
    } else if(kind==='egg') {
      oval(ctx,v,x,y,z+.09,.28,p.white);
      oval(ctx,v,x+.035,y,z+.17,.12,p.brass);
    } else {
      for(const dx of [-.1,.1]) box(ctx,v,x+dx-.05,y-.25,z,.1,.5,.16,p.brass,'#ab8049','#cda15e');
    }
  }
}
