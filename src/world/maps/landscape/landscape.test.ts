import { describe, expect, it } from 'vitest';
import { mapDefinitions } from './index';
import { worldMapSchema } from '../../schema';
import { canStand, canWalk, findPath } from '../../geometry';
import { compileLife, sampleLife } from '../../life';
import { navigationFor } from '../../life/navigation';

// Footprint clearance is deliberately tested without the rendering adapter.
const radius = .3;
for (const raw of mapDefinitions) {
  const map = worldMapSchema.parse(raw);
  describe(`${map.id} authored routes`, () => {
    const blocked = (x: number, y: number) => !canStand(map,{x,y},radius);
    const key = (x: number, y: number) => `${Math.round(x * 2)},${Math.round(y * 2)}`;
    const reachable = new Set<string>();
    const queue = [[map.defaultSpawn.x, map.defaultSpawn.y]];
    reachable.add(key(...queue[0] as [number, number]));
    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i];
      for (const [dx, dy] of [[.5, 0], [-.5, 0], [0, .5], [0, -.5]]) {
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (!reachable.has(k) && !blocked(nx, ny)) { reachable.add(k); queue.push([nx, ny]); }
      }
    }
    it('allows a player footprint to reach every landmark and arrival', () => {
      for (const { id, position } of [...map.landmarks, ...map.entrances]) {
        expect(blocked(position.x, position.y), `${id} blocked`).toBe(false);
        expect(reachable.has(key(position.x, position.y)), `${id} disconnected`).toBe(true);
      }
    });
    it('uses shared pathfinding to reach the waterside approach', () => {
      const id = map.id === 'park' ? 'park.pond-deck' : 'riverbank.fishing-jetty';
      const goal = map.anchors.find(a => a.id === id)!.position;
      expect(findPath(map,map.defaultSpawn,goal).length).toBeGreaterThan(0);
    });
    it('keeps water effects off visible bridge and boardwalk decks', () => {
      const decks=map.terrain.filter(t=>t.material==='bridge'||t.material==='boardwalk');
      const water=map.terrain.filter(t=>t.material==='water');
      for(const deck of decks)for(const surface of water){
        const a=deck.rect,b=surface.rect;
        const overlap=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>1e-7&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>1e-7;
        expect(overlap,`${deck.id} covered by ${surface.id}`).toBe(false);
      }
    });
    it('compiles radius-safe resident approaches and every route segment', () => {
      for(const hook of map.npcHooks){
        for(const point of [hook.position,...hook.route])expect(canStand(map,point,.25),hook.id).toBe(true);
        for(let i=1;i<hook.route.length;i++){
          let from=hook.route[i-1];const path=findPath(map,from,hook.route[i]);
          expect(path.length,hook.id).toBeGreaterThan(0);
          for(const to of path){expect(canWalk(map,from,to),hook.id).toBe(true);from=to;}
        }
      }
    });
    it('places safe arrivals outside exit triggers', () => {
      for (const entrance of map.entrances) for (const exit of map.exits) {
        const { x, y } = entrance.position, r = exit.rect;
        expect(x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height, entrance.id).toBe(false);
      }
    });
    it('keeps all geometry and art within authored bounds', () => {
      for (const { rect: r, id } of [...map.colliders, ...map.terrain]) {
        expect(r.width, id).toBeGreaterThan(0); expect(r.height, id).toBeGreaterThan(0);
        expect(r.x, id).toBeGreaterThanOrEqual(0); expect(r.y, id).toBeGreaterThanOrEqual(0);
        expect(r.x + r.width, id).toBeLessThanOrEqual(map.bounds.width);
        expect(r.y + r.height, id).toBeLessThanOrEqual(map.bounds.height);
      }
      for (const { id, position } of map.props) {
        expect(position.x, id).toBeGreaterThan(0); expect(position.y, id).toBeGreaterThan(0);
        expect(position.x, id).toBeLessThan(map.bounds.width); expect(position.y, id).toBeLessThan(map.bounds.height);
      }
    });
    if (map.id === 'riverbank') it('keeps both crossings clear and blocks deep water away from crossings', () => {
      for (const y of [19, 57]) for(let x=36;x<=58;x+=.5) expect(blocked(x,y), `${x},${y}`).toBe(false);
      for (const y of [10,30,45,70]) {
        const water = map.terrain.find(t => t.id === `riverbank.river-${y}`)!.rect;
        expect(blocked(water.x + water.width / 2,y + .5), `deep water ${y}`).toBe(true);
      }
    });
  });
}
it('provides reciprocal park and riverbank path connections', () => {
  for (const map of mapDefinitions) {
    const other = mapDefinitions.find(m => m.id !== map.id)!;
    const exit = map.exits.find(e => e.targetMapId === other.id)!;
    expect(other.entrances.some(e => e.id === exit.targetEntranceId)).toBe(true);
  }
});

it('keeps canonical background residents assigned to one landscape home each', () => {
  const expected={'resident-reader':'park','resident-groundskeeper':'park','resident-river-walker':'riverbank'};
  for(const [id,home] of Object.entries(expected)){
    const homes=mapDefinitions.flatMap(map=>map.npcHooks.filter(h=>h.characterId===id).map(()=>map.id));
    expect(homes).toEqual([home]);
  }
});

it('consumes real canonical profiles without diagnostics or background greetings', () => {
  for(const raw of mapDefinitions){
    const map=worldMapSchema.parse(raw),navigation=navigationFor(map),plan=compileLife(map,navigation);
    expect(plan.diagnostics).toEqual([]);
    const assigned=plan.actors.filter(actor=>map.npcHooks.some(hook=>hook.id===actor.id));
    expect(assigned).toHaveLength(map.npcHooks.length);
    for(const actor of assigned){
      expect(actor.profile.homeMap).toBe(map.id);
      expect(actor.profile.greeting).toBeUndefined();
      expect(actor.phases.some(p=>p.action==='walk')).toBe(true);
      expect(actor.phases.some(p=>p.action===actor.profile.resting)).toBe(true);
    }
    const context={day:1,seed:42,elapsedMs:12345,player:map.defaultSpawn,reducedMotion:false};
    expect(sampleLife(plan,context,navigation)).toEqual(sampleLife(plan,context,navigation));
    expect(sampleLife(plan,{...context,reducedMotion:true},navigation).every(a=>a.phaseMs===0)).toBe(true);
  }
});


it('keeps bank arrivals, return triggers and legacy saved positions footprint-safe',()=>{
 const map=worldMapSchema.parse(mapDefinitions.find(m=>m.id==='riverbank'));
 for(const legacy of [{x:7,y:73},{x:6,y:75},{x:5,y:10}])expect(canStand(map,legacy,.3)).toBe(true);
 for(const entrance of map.entrances){
  const exit=map.exits.find(e=>e.id===entrance.id.replace('from-','to-'))!;
  const center={x:exit.rect.x+exit.rect.width/2,y:exit.rect.y+exit.rect.height/2};
  expect(canStand(map,center,.3)).toBe(true);
  const route=findPath(map,entrance.position,center);expect(route.length).toBeGreaterThan(0);
  let from=entrance.position;for(const to of route){expect(canWalk(map,from,to,.3)).toBe(true);from=to;}
  const goal=map.landmarks.find(l=>l.id===(entrance.id==='from-town'?'riverbank.washing-stones':'riverbank.moon-bridge'))!.position;
  expect(findPath(map,entrance.position,goal).length).toBeGreaterThan(0);
  const distance=Math.min(...map.terrain.filter(t=>t.material==='water').map(t=>Math.hypot(Math.max(t.rect.x-entrance.position.x,0,entrance.position.x-t.rect.x-t.rect.width),Math.max(t.rect.y-entrance.position.y,0,entrance.position.y-t.rect.y-t.rect.height))));
  expect(distance).toBeLessThan(7);
 }
});
