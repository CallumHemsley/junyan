/**
 * The patient: the player three days after coming off the bike, before the apron. The same clumped
 * hair, curling cowlick and face as `char/player` (`_hero-head.ts`, without the pencil), in the ward's
 * pinstriped pyjamas and blue plastic hospital slippers, with a square of gauze taped over the left
 * temple where the head hit the kerb.
 *
 * In bed (facing down only): `lie` asleep, `lie-awake` blinking up at a ceiling he doesn't know,
 * puzzled, and `sit-bed` propped up with his hands in his lap, a little dazed. Habit sitting up:
 * glances aside, as the waiter does.
 *
 * The body is the rig's (pyjamas, the in-bed body from `_bed.ts`); the head is the player's, drawn
 * over it before the outline. Lying, the head loses the rig's `LIE_DROP` rows like every rig head.
 */
import { Px, defineSprites, type SpriteSet } from "../../kit/index.ts";
import { LIE_DROP } from "./_bed.ts";
import { paint } from "./_core.ts";
import { drawHead, type HeadFrame } from "./_hero-head.ts";
import { PYJAMA_BED, PYJAMA_BODY, PYJAMA_SLOTS, pyjamaTop } from "./_pyjamas.ts";
import {
  ACTIONS, DIRS, IN_BED, PERSON, inBed, part, partsFor, sidedBy, Z,
  type Action, type CharacterDef, type Pose,
} from "./_rig.ts";

/** A square of gauze taped over the left temple: seen from the front and in the left profile. */
const GAUZE = { w: "white", c: "cream4", t: "cream3" } as const;
const gauze = sidedBy({
  down: () => [part(17, Z.hat, [".ttt.", "twwct", "twcct", ".ttt."], { x: 22, legend: GAUZE, group: "head" })],
  up: () => [],
  right: () => [],
  left: () => [part(17, Z.hat, [".ttt.", "tcwwt", "tccwt", ".ttt."], { x: 12, legend: GAUZE, group: "head" })],
});

/** The rig body in pyjamas. The head, hair and face come from `_hero-head.ts`, so the rig's are off. */
const none = () => [];
export const PATIENT = {
  id: "patient",
  slots: {
    ...PYJAMA_SLOTS,
    S: "skin4", s: "skin3", k: "skin2",
    N: "blue3", n: "blue2", Y: "steel4", y: "steel3",
  },
  hair: none,
  face: none,
  extras: [pyjamaTop, gauze],
  body: { ...PYJAMA_BODY, head: none },
  bedBody: PYJAMA_BED,
} as const satisfies CharacterDef;

/** The head's frame for a rig pose: asleep, awake and puzzled, sitting up and dazed, or standing. */
function headFrame(pose: Pose): HeadFrame {
  const bob = pose.body + pose.head;
  const at = { bob, nod: 0, tip: 0, lean: 0 };
  if (pose.action === "lie") return { ...at, expr: "neutral", eyes: "blink" };
  if (pose.action === "lie-awake") return { ...at, expr: "puzzled", eyes: pose.beat === "blink" ? "blink" : "open" };
  const blink = pose.beat === "blink" || (pose.beat === "breath" && pose.action === "idle");
  return { ...at, expr: "neutral", eyes: blink ? "blink" : pose.beat === "habit" ? "glance" : "open" };
}

/** Draw the head, foreshortened when lying as `foreshorten` does to rig heads. */
function head(p: Px, pose: Pose): void {
  const dir = pose.dir === "left" ? "right" : pose.dir;
  const f = headFrame(pose);
  if (pose.legs !== "lie" && pose.dir !== "left") return drawHead(p, dir, f, { pencil: false });
  const q = new Px(p.w, p.h);
  drawHead(q, dir, { ...f, bob: 0 }, { pencil: false });
  const flip = pose.dir === "left";
  for (let y = 0; y < q.h; y++) {
    if (pose.legs === "lie" && LIE_DROP.includes(y)) continue;
    const to = (pose.legs === "lie" ? y - LIE_DROP.filter((d) => d < y).length : y) + f.bob;
    for (let x = 0; x < q.w; x++) { const c = q.get(flip ? q.w - 1 - x : x, y); if (c) p.px(x, to, c); }
  }
}

const sprites: SpriteSet = {};
const PATIENT_ACTIONS: readonly Action[] = ["idle", "walk", "lie", "lie-awake", "sit-bed"];
for (const action of PATIENT_ACTIONS) {
  const spec = ACTIONS[action];
  const bed = inBed({ ...spec.frames[0], dir: "down", action, frame: 0 });
  for (const dir of spec.dirs ?? DIRS) {
    sprites[`char/patient/${action}-${dir}`] = {
      ...(bed ? IN_BED : PERSON),
      frames: spec.frames.length,
      fps: spec.fps,
      draw: (p, frame) => {
        const pose: Pose = { ...spec.frames[frame], dir, action, frame };
        const parts = partsFor(PATIENT, pose);
        const below = parts.filter((q) => q.group !== "head"), over = parts.filter((q) => q.group === "head");
        paint(p, below, PATIENT.slots, pose);
        head(p, pose);
        paint(p, over, PATIENT.slots, pose);
        p.outline("ink");
      },
    };
  }
}

export default defineSprites(sprites);
