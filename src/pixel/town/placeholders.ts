/**
 * Stand-ins for town art that is still being drawn (tickets 0163–0170 draw `ground/*`, `town/*`,
 * `char/courier` and `critter/*` in parallel). The town view, the harness and the Node tools pass
 * `townPlaceholder` as the atlas's `placeholder` option, so a missing sprite shows as a quiet box on its
 * footprint instead of throwing; only dev builds and tools list the missing ids. Drop the option once
 * the town's art has all landed. Nothing here registers a sprite id.
 */
import type { AtlasOptions, Placeholder } from "../engine/index.ts";
import type { Color } from "../kit/index.ts";
import { TILE } from "../kit/sprite.ts";
import { TOWN, footprintPx, townSpriteId, type TownProp } from "./map.ts";

/** Flat ground colours by material, so a placeholder town still reads as streets, lawns and water. */
const GROUND: Record<string, Color> = { grass: "leaf3", paving: "stone4", road: "steel3", brick: "tan3", stone: "stone3", water: "blue3" };
/** Box colours by prop kind family. */
const tint = (kind: string): Color =>
  kind.startsWith("building") ? "cream3" : ["tree", "hedge", "flowerbed", "planter"].includes(kind) ? "leaf1"
    : ["street-lamp", "bollard", "utility-pole", "pipes", "drain", "gutter", "fence", "gate", "closed-gate"].includes(kind) ? "steel1" : "wood3";

const bySprite = new Map<string, TownProp>(TOWN.props.map((p) => [townSpriteId(p.id), p]));

/** The box for a missing town sprite id, or null for ids outside the town's art. */
export function townPlaceholder(id: string): Placeholder | null {
  const prop = bySprite.get(id);
  if (prop) {
    const { w, h } = footprintPx(prop);
    return { w, h, color: tint(prop.kind), alpha: 0.4, layer: prop.layer === "ground" ? "floor" : "object" };
  }
  if (id.startsWith("ground/")) {
    const material = id.slice("ground/".length).split("-")[0];
    return { w: TILE, h: TILE, color: GROUND[material] ?? "stone3", alpha: 1, layer: "floor" };
  }
  // A person is about 20 wide and 52 tall in a 32×64 frame; a small bird about 10×8.
  if (id.startsWith("char/")) return { w: 20, h: 52, color: "plum3", alpha: 0.45 };
  if (id.startsWith("critter/")) return { w: 10, h: 8, color: "plum3", alpha: 0.5 };
  // Unattached extras the owners may add (`street/`, `life/`, `plant/`): a small marker.
  if (/^(town|street|life|plant)\//.test(id)) return { w: 16, h: 16, color: "stone2", alpha: 0.4 };
  return null;
}

/**
 * Atlas options that show missing town art as placeholders and list each missing id once through
 * `report`, batched: everything the scene compiles at once is one message.
 */
export function townPlaceholderOptions(report: (message: string) => void, defer: (flush: () => void) => void = (flush) => queueMicrotask(flush)): AtlasOptions {
  let pending: string[] = [];
  return {
    placeholder: townPlaceholder,
    onPlaceholder: (id) => {
      if (!pending.length) defer(() => {
        const ids = pending.sort();
        pending = [];
        report(`[pixel] ${ids.length} sprite${ids.length === 1 ? "" : "s"} not drawn yet, shown as placeholder boxes: ${ids.join(", ")}`);
      });
      pending.push(id);
    },
  };
}
