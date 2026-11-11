/**
 * Every scene, by id. Add a hand-made scene by importing it here; outdoor maps come from the outdoor
 * map registry (`../world/maps.ts`), one scene per registered map.
 */
import type { Scene } from "../engine/index.ts";
import { outdoorScenes } from "../world/scene.ts";
import cafe from "./cafe.ts";
import demo from "./demo.ts";
import ward from "./ward.ts";

export const scenes: Readonly<Record<string, Scene>> = { [cafe.id]: cafe, [demo.id]: demo, ...outdoorScenes(), [ward.id]: ward };
