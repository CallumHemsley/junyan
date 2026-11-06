import {test,expect} from 'vitest';
import {writeFileSync} from 'node:fs';
import {content} from '/workspace/junyan-audit-e02/src/content';
import {createGame} from '/workspace/junyan-audit-e02/src/game';
import {validateSavedGame} from '/workspace/junyan-audit-e02/src/save';
import {worldMaps} from '/workspace/junyan-audit-e02/src/world/registry';
import {createWorld} from '/workspace/junyan-audit-e02/src/world/state';
import {planFor,actorsFor,navigationFor} from '/workspace/junyan-audit-e02/src/world/life-bridge';
import {nearbyLife} from '/workspace/junyan-audit-e02/src/world/life';
test('validate a separately labelled town adjacent-landmark visual setup',()=>{
 const game=createGame(content,42);
 const world={...createWorld(worldMaps),mapId:'town',position:{x:34,y:30},facing:'north' as const};
 const fixture={...game,world};
 const restored=validateSavedGame(fixture,content);
 expect(restored?.world?.position).toEqual(world.position);
 const options=nearbyLife(planFor(worldMaps.town,fixture),actorsFor(worldMaps.town,fixture,world,0,false),world.position,navigationFor(worldMaps.town));
 expect(options.filter(option=>option.kind==='inspect').length).toBeGreaterThanOrEqual(2);
 writeFileSync('docs/evidence/0090/arrival-guidance/fixture.json',JSON.stringify({profile:'valid declared-arrival visual/setup only, NOT ordinary travel',head:'e02a747',fixture,options},null,2)+'\n');
});
