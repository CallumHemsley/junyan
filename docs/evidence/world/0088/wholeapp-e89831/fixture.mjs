import {createServer} from 'vite';
import {writeFileSync} from 'node:fs';
const server=await createServer({root:'/workspace/junyan-wholeapp-e89831',server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
const {createGame}=await server.ssrLoadModule('/src/game.ts'),{content}=await server.ssrLoadModule('/src/neighbourhood/registry.ts'),{worldMaps}=await server.ssrLoadModule('/src/world/registry.ts'),{createWorld}=await server.ssrLoadModule('/src/world/state.ts'),{initialLifeState}=await server.ssrLoadModule('/src/world/life/index.ts'),{validateSavedGame}=await server.ssrLoadModule('/src/save.ts');
const game=createGame(content,42);game.world={...createWorld(worldMaps),mapId:'apartment',position:worldMaps.apartment.anchors[0].position,life:{...initialLifeState(),elapsedMs:22000}};if(!validateSavedGame(game,content))throw Error('Invalid fixture');
writeFileSync('/workspace/junyan/docs/evidence/world/0088/wholeapp-e89831/apartment-original-fixture.json',JSON.stringify(game,null,2));
}finally{await server.close();}
