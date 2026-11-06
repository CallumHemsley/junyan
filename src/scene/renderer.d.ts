import type {Character, GameState, Phase, Position} from '../contracts';
export const WIDTH: number;
export const HEIGHT: number;
export function projectPosition(position: Position, z?: number): {left:number; top:number};
export function groundPosition(left:number, top:number): Position;
export type ScenePoint = [number, number, number];
export type Color = [number, number, number];
export const COLORS: Record<string, Color>;
export function customerPose(phase:Phase, accessory?:Character['appearance']['accessory']): {
  crouch:number; scale:number; armR:number; armL:number; greeting:boolean; lean:number;
};
export type FigureKind = Character['appearance']['accessory'] | 'doctor' | 'nurse' | 'aunt';
export type CharacterRig = {
  local(forward:number, side:number, height:number): ScenePoint;
  bone(start:ScenePoint, end:ScenePoint, startRadius:number, endRadius:number, color:Color):void;
  dot(position:ScenePoint, radius:number, color:Color):void;
  headHeight:number;
};
export function characterFigure(x:number, y:number, yaw:number,
  pose:{scale?:number; z?:number; crouch?:number; lean?:number; stance?:number; carry?:boolean; armR?:number; armL?:number; greeting?:boolean; elbowR?:ScenePoint; handR?:ScenePoint; lying?:boolean},
  palette:{shirt?:Color; hair?:Color; skin?:Color; legs?:Color; accessory?:string},
  addBone:(start:ScenePoint, end:ScenePoint, startRadius:number, endRadius:number, colorOf:(height:number)=>Color)=>void,
):CharacterRig;
export function characterTray(rig:CharacterRig, foods:string[],
  addBox:(start:ScenePoint, end:ScenePoint, color:Color, transform:CharacterRig['local'])=>void,
):void;
type Pixels = Uint32Array;
type Depth = Float32Array;
export type BoxSurface = {
  kind:'wood'|'linen'|'cloth';
  bands?:readonly {center:number; width:number; color:Color}[];
};
export type SceneApi = {
  W:number; H:number; R2:number; COS:number;
  pix:Pixels; zb:Depth; ground:Uint8Array; groundZ:Depth; bakedZ:Depth;
  rgb(r:number, g:number, b:number):number;
  hash(x:number, y:number):number;
  project(x:number, y:number, z:number):{sx:number; sy:number; d:number};
  unproject(sx:number, sy:number):{x:number; y:number};
  box(x0:number, y0:number, z0:number, x1:number, y1:number, z1:number, color:Color, seed?:number, transform?:CharacterRig['local']|null, surface?:BoxSurface|null):void;
  sphere(x:number, y:number, z:number, radius:number, color:Color, mode?:string):void;
  capsule(start:ScenePoint, end:ScenePoint, startRadius:number, endRadius:number, colorOf:(height:number)=>Color, mode?:string):void;
  castShadow(x:number, y:number, z:number, radius:number, strength?:number, dither?:number):void;
  applyShadows(refZ:Depth):void;
  flushShadows():void;
  shadeEdges():void;
  dynamicAdd(start:ScenePoint, end:ScenePoint, startRadius:number, endRadius:number, colorOf:(height:number)=>Color):void;
};
export type Scene<Args extends unknown[]> = {
  bake(api:SceneApi):void;
  draw(api:SceneApi, ...args:Args):void;
};
export function createRenderer<Args extends unknown[]>(canvas: HTMLCanvasElement, scene: Scene<Args>, options?:{nativeWorld?:{pixelsPerWorldUnit:number; originX?:number; originY?:number}}): {
  draw(...args:Args):void;
};
