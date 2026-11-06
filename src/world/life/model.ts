import type { Position, Line } from '../../contracts';
import type { State as CatsState } from '../../features/cats/rules';

export type Facing = 'north' | 'east' | 'south' | 'west';
export type Rect = Position & { width: number; height: number };
export type LifeMap = {
  id: string;
  entrances: readonly { position: Position }[];
  exits: readonly { rect: Rect }[];
  npcHooks: readonly { id: string; position: Position; route: readonly Position[]; characterId: string }[];
  landmarks: readonly { id: string; position: Position; kind: string }[];
};
export type Navigation = {
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
  landmarks: LifeMap['landmarks'];
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
};
export type ActorPose = {
  id: string;
  characterId: string;
  kind: Profile['kind'];
  position: Position;
  facing: Facing;
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
