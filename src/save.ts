import {z} from 'zod';
import type {GameState} from './contracts';

const stateSchema = z.object({
  seed:z.number().int(),day:z.number().int().positive(),level:z.number().int().min(1).max(3),
  player:z.object({x:z.number().min(0).max(12),y:z.number().min(0).max(10)}),
  customers:z.array(z.object({table:z.number().int().min(1).max(4),orderId:z.string(),phase:z.enum(['seated','ordered','checkout','served'])})).length(4),
  tray:z.array(z.string()).max(6),served:z.number().int().min(0).max(4),earnings:z.number().nonnegative(),mistakes:z.number().int().nonnegative(),
  activeTable:z.number().nullable(),feedback:z.enum(['none','wrong-food','wrong-change','thanks','full']),
  receipt:z.object({table:z.number(),total:z.number(),change:z.number()}).nullable(),
  journal:z.record(z.string(),z.object({lookups:z.number().int().nonnegative(),lastSeen:z.number()})),ended:z.boolean(),
});

function database():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('junyan-waiter',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('saves');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}
export async function loadGame():Promise<GameState|null>{
  const db=await database();
  try{return await new Promise((resolve,reject)=>{
    const request=db.transaction('saves').objectStore('saves').get('v1');
    request.onsuccess=()=>{const result=stateSchema.safeParse(request.result);resolve(result.success?result.data:null);};
    request.onerror=()=>reject(request.error);
  });}finally{db.close();}
}
export async function saveGame(state:GameState):Promise<void>{
  const db=await database();
  try{await new Promise<void>((resolve,reject)=>{
    const transaction=db.transaction('saves','readwrite');
    transaction.objectStore('saves').put(state,'v1');
    transaction.oncomplete=()=>resolve();
    transaction.onerror=()=>reject(transaction.error);
    transaction.onabort=()=>reject(transaction.error);
  });}finally{db.close();}
}
