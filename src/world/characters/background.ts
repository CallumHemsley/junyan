import type {RGB} from './artwork.mjs';

export type BackgroundRole = 'reader' | 'courier' | 'groundskeeper' | 'laundry' | 'river-walker';
export type HeldObject = 'tray' | 'watering-can' | 'tool' | 'book' | 'parcel' | 'broom' | 'laundry-basket' | 'folded-umbrella';
export type BackgroundResidentDefinition = {
  id:string;
  role:BackgroundRole;
  appearance:{shirt:RGB;hair:RGB;legs:RGB;accessory:string};
  body:{heightOffset:number;widthOffset:number;headWidthOffset:number;lean:number;legWidth:number};
  heldObject:HeldObject;
  cadenceMs:number;
};

export const backgroundResidents = [
  {id:'resident-reader',role:'reader',appearance:{shirt:[158,151,125],hair:[151,148,131],legs:[78,85,78],accessory:'background-reader'},body:{heightOffset:2,widthOffset:0,headWidthOffset:0,lean:1,legWidth:3},heldObject:'book',cadenceMs:155},
  {id:'resident-courier',role:'courier',appearance:{shirt:[158,175,188],hair:[65,48,39],legs:[63,78,74],accessory:'background-courier'},body:{heightOffset:-2,widthOffset:-2,headWidthOffset:-2,lean:1,legWidth:3},heldObject:'parcel',cadenceMs:90},
  {id:'resident-groundskeeper',role:'groundskeeper',appearance:{shirt:[111,145,119],hair:[65,48,39],legs:[96,98,78],accessory:'background-groundskeeper'},body:{heightOffset:1,widthOffset:3,headWidthOffset:1,lean:0,legWidth:5},heldObject:'broom',cadenceMs:135},
  {id:'resident-laundry-neighbour',role:'laundry',appearance:{shirt:[142,157,119],hair:[67,48,36],legs:[115,104,89],accessory:'background-laundry'},body:{heightOffset:1,widthOffset:1,headWidthOffset:-1,lean:0,legWidth:3},heldObject:'laundry-basket',cadenceMs:130},
  {id:'resident-river-walker',role:'river-walker',appearance:{shirt:[121,112,137],hair:[54,43,34],legs:[66,68,65],accessory:'background-river-walker'},body:{heightOffset:-1,widthOffset:-3,headWidthOffset:-2,lean:0,legWidth:3},heldObject:'folded-umbrella',cadenceMs:115},
] as const satisfies readonly BackgroundResidentDefinition[];

export type BackgroundResidentId = typeof backgroundResidents[number]['id'];
const residents = new Map<string,BackgroundResidentDefinition>(backgroundResidents.map(resident=>[resident.id,resident]));
export function isBackgroundResidentId(id:string):id is BackgroundResidentId {return residents.has(id);}
export function backgroundResident(id:string):BackgroundResidentDefinition|undefined {return residents.get(id);}
