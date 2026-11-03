import type {Character, Content, GameState, Position} from '../contracts';
export const TABLES: Array<Position & {table:number}>;
export function restaurantFrames(content: Content, count?: number): {
  appearances: Record<string, Character["appearance"]>;
  frames: Array<[state:GameState, player:Position & {yaw:number}, time:number, moving:boolean]>;
};
export function sha256(bytes: string | ArrayBufferView): string;
export function captureCanvas(): {frame: Uint8ClampedArray; getContext(): unknown};
