/** Every scene, by id. Add a scene by importing it here. */
import type { Scene } from "../engine/index.ts";
import cafe from "./cafe.ts";
import demo from "./demo.ts";
import town from "./town.ts";
import ward from "./ward.ts";

export const scenes: Readonly<Record<string, Scene>> = { [cafe.id]: cafe, [demo.id]: demo, [town.id]: town, [ward.id]: ward };
