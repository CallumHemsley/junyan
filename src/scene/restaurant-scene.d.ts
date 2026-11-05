import type {Character, GameState, Order, Position} from '../contracts';
import type {Scene} from './renderer.js';
export function restaurantScene(tables: Array<Position & {table:number}>, appearances?: Record<string, Character["appearance"]>, orderItems?: Record<string, Order["items"]>):
  Scene<[state:GameState, player:Position & {yaw:number}, time:number, moving:boolean]>;
