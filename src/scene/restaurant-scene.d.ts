import type {Character, GameState, Position} from '../contracts';
import type {Scene} from './renderer.js';
export function restaurantScene(tables: Array<Position & {table:number}>, appearances?: Record<string, Character["appearance"]>):
  Scene<[state:GameState, player:Position & {yaw:number}, time:number, moving:boolean]>;
