import {createHash} from 'node:crypto';
import {describe,it,expect} from 'vitest';
import {actorCatalog} from './catalog';
import {frame} from './artwork.mjs';

// Pixel provenance at 03bc3198, before 0122 form shading. Shapes/attachments below
// remain exact across the full animation/pose matrix; colour is intentionally authored anew.
const baselinePixels:Record<string,string> = {
  "player": "109551e30076a684ede23832ac18a7d7988675bba3b1ae54cb772f72081cc18a",
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

const baselinePhysical:Record<string,string> = {
  "player": "cb7015f72d5c62085b3a1c1ea64901cfa79b2f16a6b500a820cacd9a4beeb43f",
  "lin-jie": "a27a9f1c507d424f4cdb79dcfd5b7239d3c9fe6217cdeca6712b06f4add1bb02",
  "xiao-li": "1328a3d9d18438bf2c91c0f1a7363f53d0a52e3b54e9e23839f35c0f72aa32e3",
  "zhang-laoshi": "ce817722511eb0097fe36df5596ea3be38f923676e3814e7acd38f9a27e4deb7",
  "xiao-zhou": "7b64346562c0fe54424d9e18a71b55b04119572fbf6d2da0f198a4b6bce30466",
  "aunt": "6db9b48b232513675bceb53e48e9315e1e5b72147a4d2b3e9b12b43ac49ae691",
  "resident-reader": "3ae0ab1371ba791c7cdba7eed2d012172b61e07bb72eb3882e161d93bc42e822",
  "resident-courier": "d8cd1610d7c9e7b59a3ef3d5f611294e712a19c59783cd685d9550e6d9cf2408",
  "resident-groundskeeper": "b2e7f398b4fdad528d064d77ffc482f4e42dce6f509750afba305e0edc4ff770",
  "resident-laundry-neighbour": "88d16c1fd33da0fb707648b2a5e74bc2fafbd56daf1f8463872835f59e505368",
  "resident-river-walker": "8def51e00030b1fcd404f67dc362c48a87ab6c680c5d6a0d56bfbc9627e45a72"
};

describe('native actor form shading',()=>{
 it('preserves every pre-shading alpha mask and attachment across all cast and animation states',()=>{
  for(const actor of actorCatalog){
   const pixels=createHash('sha256'),shape=createHash('sha256');
   for(let direction=0;direction<8;direction++)for(let phase=0;phase<6;phase++)
    for(const action of ['idle','walk','interact','react','crouch','sit'])for(const carrying of [false,true])for(const reducedMotion of [false,true]){
     const picture=frame({appearance:actor.appearance,body:actor.body,role:actor.role,heldObject:actor.heldObject,direction,phase,action,carrying,reducedMotion,blink:phase===4,acting:phase===5,...(action==='sit'?{seatHeight:.77,handRestHeight:1.44}:{})});
     const {pixels:data,...contacts}=picture;
     pixels.update(data);shape.update(JSON.stringify(contacts));
     shape.update(Uint8Array.from(data.filter((_,index)=>index%4===3)));
    }
   expect(shape.digest('hex'),actor.id).toBe(baselinePhysical[actor.id]);
   expect(pixels.digest('hex'),actor.id).not.toBe(baselinePixels[actor.id]);
  }
 });
});
