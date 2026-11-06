import type {BackgroundResidentDefinition,BackgroundRole,HeldObject} from './background';
export const W: number;
export const H: number;
export type RGB = [number,number,number];
export type PixelFrame = {
 width:number; height:number; pixels:Uint8ClampedArray;
 anchor:{x:number;y:number}; held:{x:number;y:number};
 feet:{x:number;y:number;planted:boolean}[];
};
export function frame(input:{appearance?:{shirt?:RGB;hair?:RGB;legs?:RGB;accessory?:string};direction?:number;phase?:number;action?:string;reducedMotion?:boolean;carrying?:boolean;blink?:boolean;heldObject?:HeldObject;role?:BackgroundRole;body?:BackgroundResidentDefinition['body'];acting?:boolean}):PixelFrame;
