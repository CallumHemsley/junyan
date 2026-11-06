import type { WorldMapDefinition, Facing, Rect } from '../schema';
import type { Position, Line } from '../../contracts';
import type { State as CatsState } from '../../features/cats/rules';

export type { Facing, Rect } from '../schema';
export type LifeMap = Pick<WorldMapDefinition, 'id' | 'entrances' | 'exits' | 'npcHooks' | 'landmarks'>;
export type Navigation = {
  canSee?: (from: Position, target: Position) => boolean;
  canStand: (point: Position, radius: number) => boolean;
  canWalk: (from: Position, to: Position, radius: number) => boolean;
  route: (from: Position, to: Position, radius: number, exclusions: readonly Rect[]) => readonly Position[];
};
export type Profile = {
  id: string;
  kind: 'resident' | 'cat' | 'bird';
  speed: number;
  radius: number;
  dwellMs: number;
  resting: 'idle' | 'sit' | 'work' | 'perch';
  greeting?: Line;
};
export type RoutePhase = {
  from: Position;
  to: Position;
  startMs: number;
  endMs: number;
  action: 'walk' | Profile['resting'];
};
export type ActorRoute = {
  id: string;
  characterId: string;
  profile: Profile;
  home: Position;
  phases: readonly RoutePhase[];
  durationMs: number;
};
export type LifePlan = {
  mapId: string;
  actors: readonly ActorRoute[];
  habitatActors: readonly Pick<ActorRoute, 'id' | 'characterId' | 'profile' | 'home'>[];
  landmarks: LifeMap['landmarks'];
  exclusions: readonly Rect[];
  diagnostics: readonly { hookId: string; reason: string }[];
};
export type LifeContext = {
  day: number;
  elapsedMs: number;
  seed: number;
  player: Position;
  reducedMotion: boolean;
  excludedCharacterIds?: readonly string[];
  cats?: Pick<CatsState, 'story' | 'repeat'>;
  gardenMature?: boolean;
  habitats?: readonly { characterId: string; position: Position; activity: 'sit' | 'work' | 'idle' }[];
};
export type ActorPose = {
  id: string;
  characterId: string;
  kind: Profile['kind'];
  position: Position;
  facing: Facing;
  yaw?: number;
  action: 'idle' | 'walk' | 'interact';
  activity: RoutePhase['action'] | 'watch' | 'startle';
  phaseMs: number;
  greeting?: Line;
  radius: number;
};
export type Affordance = {
  id: string;
  targetId: string;
  kind: 'greet' | 'sit' | 'watch' | 'inspect';
  position: Position;
  label: Line;
};
export type LifeEvent =
  | { type: 'discovered'; mapId: string; landmarkId: string; day: number }
  | { type: 'reacted'; mapId: string; targetId: string; reaction: 'wave' | 'sit' | 'watch' | 'flutter' | 'ripple' | 'sway'; atMs: number };
