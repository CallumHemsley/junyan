/**
 * The lane neighbourhood (弄堂) outside the breakfast shop, compiled from the town map
 * (`src/world/maps/town/map.json`, 80×64; map units are pixel tiles) by the outdoor scene compiler
 * (`../world/scene.ts`), like every outdoor map. Kept as a module for the town's own names.
 */
import { outdoorScene, shadeSpriteId as mapShadeSpriteId } from "../world/scene.ts";

export { LAMP_GLASS, SHOPFRONT_KINDS, signRect } from "../world/scene.ts";

/** A town prop's optional ground shade (`town/<id>-shade`, trees ship one). */
export const shadeSpriteId = (propId: string) => mapShadeSpriteId("town", propId);

export default outdoorScene("town");
