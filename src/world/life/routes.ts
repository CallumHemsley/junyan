import { segmentIntersects } from './visibility';
import type { Position } from '../../contracts';
import type { ActorRoute, LifeMap, LifePlan, Navigation, Rect, RoutePhase } from './model';
import { profileFor } from './profiles';

const distance = (a: Position, b: Position) => Math.hypot(b.x - a.x, b.y - a.y);
const finite = (p: Position) => Number.isFinite(p.x) && Number.isFinite(p.y);


export function entranceExclusions(map: LifeMap): Rect[] {
  return [
    ...map.exits.map(exit => ({ x: exit.rect.x - .25, y: exit.rect.y - .25, width: exit.rect.width + .5, height: exit.rect.height + .5 })),
    ...map.entrances.map(entrance => ({ x: entrance.position.x - .55, y: entrance.position.y - .55, width: 1.1, height: 1.1 })),
  ];
}

export function compileLife(map: LifeMap, navigation: Navigation): LifePlan {
  const actors: ActorRoute[] = [], diagnostics: { hookId: string; reason: string }[] = [];
  const exclusions = entranceExclusions(map);
  const ids = new Set<string>();
  for (const hook of map.npcHooks) {
    const profile = profileFor(hook.characterId);
    const fail = (reason: string) => diagnostics.push({ hookId: hook.id, reason });
    if (ids.has(hook.id)) { fail('duplicate-hook'); continue; }
    ids.add(hook.id);
    if (!profile) { fail('unknown-character'); continue; }
    const stand = (p: Position) => finite(p) && navigation.canStand(p, profile.radius) && !exclusions.some(rect => segmentIntersects(p, p, rect, profile.radius));
    const walk = (a: Position, b: Position) => stand(a) && stand(b) && navigation.canWalk(a, b, profile.radius) && !exclusions.some(rect => segmentIntersects(a, b, rect, profile.radius));
    if (!stand(hook.position)) { fail('blocked-home-or-entrance'); continue; }
    const stops = [hook.position, ...hook.route.filter((point, index) => distance(point, index === 0 ? hook.position : hook.route[index - 1]) > 1e-6)];
    if (!stops.every(stand)) { fail('blocked-route-stop'); continue; }
    const phases: RoutePhase[] = [];
    let elapsed = 0, valid = true;
    const add = (from: Position, to: Position, duration: number, action: RoutePhase['action']) => {
      phases.push({ from, to, startMs: elapsed, endMs: elapsed + duration, action });
      elapsed += duration;
    };
    for (let i = 0; i < stops.length; i++) {
      const from = stops[i], to = stops[(i + 1) % stops.length];
      add(from, from, profile.dwellMs, profile.resting);
      if (distance(from, to) < 1e-6) continue;
      const path = navigation.route(from, to, profile.radius, exclusions);
      const points = [from, ...path];
      if (!path.length || distance(path[path.length - 1], to) > 1e-5 || !points.slice(1).every((point, index) => walk(points[index], point))) {
        valid = false; break;
      }
      points.slice(1).forEach((point, index) => {
        const length = distance(points[index], point);
        if (length > 1e-6) add(points[index], point, length / profile.speed * 1000, 'walk');
      });
    }
    if (!valid) { fail('unreachable-route-or-entrance-crossing'); continue; }
    actors.push({ id: hook.id, characterId: profile.id, profile, home: hook.position, phases, durationMs: elapsed });
  }
  return { mapId: map.id, actors, landmarks: map.landmarks, diagnostics };
}
