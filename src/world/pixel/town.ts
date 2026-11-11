/**
 * The town under its own names: the outdoor map wiring (`./outdoor.ts`) applied to the town map.
 */
import type { Scene } from "../../pixel/engine/index.ts";
import { LIFE_CHARACTERS, liveOutdoor, outdoorActors, outdoorAtlasOptions, outdoorPhase, outdoorPlayer } from "./outdoor";

export { FADED, MIN_COVER, PLAYER_BODY, birdSprite, lifeActor, occluderFade, placedById, type Occluder } from "./outdoor";

/** The scene the game walks in the town: the compiled town, with no cast of its own. */
export const liveTown: Scene = liveOutdoor("town");
export const townAtlasOptions = outdoorAtlasOptions;
export const townPhase = outdoorPhase;
export const townPlayer = outdoorPlayer;
export const townActors = outdoorActors;
export const TOWN_CHARACTERS = LIFE_CHARACTERS;
