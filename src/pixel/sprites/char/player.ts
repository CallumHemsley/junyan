/**
 * The waiter: the player. Young, eager, slightly rumpled. Clumped dark hair with a cowlick that
 * curls and never lies flat, a pencil behind the right ear, sleeves rolled to the elbow, a jade apron
 * with an order pad in the bib pocket and a tea towel tucked in the waist, canvas shoes.
 *
 * Drawn as a joint puppet, not on the shared rig (ticket 0193 pass three, landed in 0194): an
 * 8-frame hand-keyed walk at 10 fps with heel strike, toe-off, bent elbows, the head a frame late,
 * the hair tips two frames late and the apron hem trailing; an 8-frame idle at 5 fps with a breath
 * and a blink. Carrying, both hands hold the tea-wood tray from `_tray.ts`; the dishes on it are
 * separate actors (`food/carried.ts`) that follow `carryBob`.
 *
 * Body `_hero-body.ts`, head and face `_hero-head.ts` (shared with `char/patient`), poses and timing
 * `_hero-poses.ts`.
 */
import { defineSprites, type SpriteSet } from "../../kit/index.ts";
import { drawHero } from "./_hero-body.ts";
import { HERO_ACTIONS, type HeroAction } from "./_hero-poses.ts";
import { DIRS, PERSON } from "./_rig.ts";

const sprites: SpriteSet = {};
for (const [action, { fps, stride, frames }] of Object.entries(HERO_ACTIONS) as [HeroAction, (typeof HERO_ACTIONS)[HeroAction]][]) {
  for (const dir of DIRS) {
    const poses = frames[dir === "left" ? "right" : dir];
    sprites[`char/player/${action}-${dir}`] = { ...PERSON, frames: poses.length, fps, ...(stride ? { stride } : {}), draw: (p, i) => drawHero(p, poses[i], dir) };
  }
}

export default defineSprites(sprites);
