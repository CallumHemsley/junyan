import type {Character, GameState, Phase, Position} from '../contracts';
export const WIDTH: number;
export const HEIGHT: number;
export function projectPosition(position: Position, z?: number): {left:number; top:number};
export function groundPosition(left:number, top:number): Position;
export type ScenePoint = [number, number, number];
type Color = [number, number, number];
export const COLORS: Record<string, Color>;
export function customerPose(phase:Phase, accessory?:Character['appearance']['accessory']): {
  crouch:number; scale:number; armR:number; armL:number; greeting:boolean; lean:number;
};
export type CharacterRig = {
  local(forward:number, side:number, height:number): ScenePoint;
  bone(start:ScenePoint, end:ScenePoint, startRadius:number, endRadius:number, color:Color):void;
  dot(position:ScenePoint, radius:number, color:Color):void;
  headHeight:number;
};
export function characterFigure(x:number, y:number, yaw:number,
  pose:{scale?:number; z?:number; crouch?:number; lean?:number; stance?:number; carry?:boolean; armR?:number; armL?:number; greeting?:boolean; elbowR?:ScenePoint; handR?:ScenePoint},
  palette:{shirt?:Color; hair?:Color; skin?:Color; legs?:Color; accessory?:string},
  addBone:(start:ScenePoint, end:ScenePoint, startRadius:number, endRadius:number, colorOf:(height:number)=>Color)=>void,
):CharacterRig;
export function characterTray(rig:CharacterRig, foods:string[],
  addBox:(start:ScenePoint, end:ScenePoint, color:Color, transform:CharacterRig['local'])=>void,
):void;
export function createRenderer(canvas: HTMLCanvasElement, tables: Array<Position & {table:number}>, appearances?: Record<string, Character["appearance"]>): {
  draw(state:GameState, player:Position & {yaw:number}, time:number, moving:boolean):void;
};
