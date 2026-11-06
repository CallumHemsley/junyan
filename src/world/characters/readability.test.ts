import {createHash} from 'node:crypto';
import {describe,it,expect} from 'vitest';
import {actorCatalog} from './catalog';
import {frame} from './artwork.mjs';

// Exact native frames at cf966caf, before the player garment palette changed.
const baselinePixels:Record<string,string> = {
  "player": "9df533f1f0f9645fd20c6a745a98c1f31ed81be19c97247e9086f226961f79ba",
  "lin-jie": "f199978b43f7560e0fc12929c8c8155d8df8501704911f768756461b0b53f5e9",
  "xiao-li": "1b9e27babf5493f762d9740b93a4b10d6a22bd893bbd56b1372d809279a785b1",
  "zhang-laoshi": "5470f884138f0f6b9ad01bce001bff343112f3d3520f4f5abfa439ca8ed3a649",
  "xiao-zhou": "7ded7e2f27a7c70f25278de5e7cca441144bf08a3db452a6a29e4f40219a14d2",
  "aunt": "e49e03a9cba405aa942b634babd2b8e4a55051464dec3ae88dd6ea1523df8139",
  "resident-reader": "576dbd3eafc8206389dcacd09d69d57b97bf1343dac435d96e2c640c92d57a6b",
  "resident-courier": "3554140a610d0c52271a33b61017c32f2daa16b07801a3175591590f4adfbd58",
  "resident-groundskeeper": "46510cb306f1fb7c9fc15a9a28650b5f0c6c77ecdc0d0d5a7e19c0cbbee2ecd0",
  "resident-laundry-neighbour": "ea5da2f4f2d4d1f529eaa1c6dfc11fd4ceeaa6db62eb24a44448ee9ef66a0be8",
  "resident-river-walker": "75e631c7a14720b9096333e72ea09abeb5e55b1b8a7a00afa28e399da2198931"
};

describe('player garment readability',()=>{
 it('keeps all native masks, bounds and contacts, and every other actor byte-identical',()=>{
  for(const actor of actorCatalog){
   const pixels=createHash('sha256'),shape=createHash('sha256');
   for(let direction=0;direction<8;direction++)for(let phase=0;phase<6;phase++)
    for(const action of ['idle','walk','interact','react','crouch','sit'])for(const carrying of [false,true])for(const reducedMotion of [false,true]){
     const picture=frame({appearance:actor.appearance,body:actor.body,role:actor.role,heldObject:actor.heldObject,direction,phase,action,carrying,reducedMotion,blink:phase===4,acting:phase===5,...(action==='sit'?{seatHeight:.77,handRestHeight:1.44}:{})});
     const {pixels:data,...contacts}=picture;
     pixels.update(data);shape.update(JSON.stringify(contacts));
     shape.update(Uint8Array.from(data.filter((_,index)=>index%4===3)));
    }
   if(actor.id==='player'){
    expect(shape.digest('hex')).toBe('cb7015f72d5c62085b3a1c1ea64901cfa79b2f16a6b500a820cacd9a4beeb43f');
    expect(pixels.digest('hex')).not.toBe(baselinePixels.player);
   }else expect(pixels.digest('hex'),actor.id).toBe(baselinePixels[actor.id]);
  }
 });
});
