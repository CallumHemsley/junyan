import type {ActorSample} from './index';
export const ACTOR_PIXELS_PER_WORLD_UNIT=18;
export type ActorContactMetrics = {
  pixelsPerWorldUnit:18;
  groundPixel:{x:number;y:number};
  pelvis:{pixel:{x:number;y:number};height:number};
  hand:{pixel:{x:number;y:number};height:number};
  feet:{pixel:{x:number;y:number};height:number;planted:boolean}[];
  requestedSeatHeight?:number;
};
export function actorContactMetrics(sample:ActorSample):ActorContactMetrics {
  const frame=sample.frame;
  const height=(point:{y:number})=>(frame.anchor.y-point.y)/ACTOR_PIXELS_PER_WORLD_UNIT;
  return {pixelsPerWorldUnit:18,groundPixel:frame.anchor,pelvis:{pixel:frame.pelvis,height:height(frame.pelvis)},hand:{pixel:frame.held,height:height(frame.held)},feet:frame.feet.map(foot=>({pixel:{x:foot.x,y:foot.y},height:height(foot),planted:foot.planted})),...(frame.seatContact?{requestedSeatHeight:frame.seatContact.height}:{})};
}
