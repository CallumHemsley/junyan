import type {GameState, Position} from '../contracts';
export const WIDTH: number;
export const HEIGHT: number;
export function projectPosition(position: Position, z?: number): {left:number; top:number};
export function groundPosition(left:number, top:number): Position;
export function createRenderer(canvas: HTMLCanvasElement, tables: Array<Position & {table:number}>): {
  draw(state:GameState, player:Position & {yaw:number}, time:number, moving:boolean):void;
};
