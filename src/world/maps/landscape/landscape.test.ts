import { describe, expect, it } from 'vitest';
import { mapDefinitions } from './index';
import { worldMapSchema } from '../../schema';
import { canStand, findPath } from '../../geometry';

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
    it('keeps resident hook segments walkable', () => {
      for(const hook of map.npcHooks)for(const point of hook.route)expect(canStand(map,point),hook.id).toBe(true);
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
