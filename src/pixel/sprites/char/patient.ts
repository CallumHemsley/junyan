/**
 * The patient: the player three days after coming off the bike, before the apron. The same cowlick
 * and face as `char/player`, in the ward's pinstriped pyjamas and blue plastic hospital slippers,
 * with a square of gauze taped over the left temple where the head hit the kerb.
 *
 * In bed (facing down only): `lie` asleep, `lie-awake` blinking up at a ceiling he doesn't know,
 * and `sit-bed` propped up with his hands in his lap, a little dazed. Habit sitting up: glances
 * aside, as the waiter does.
 */
import { defineSprites } from "../../kit/index.ts";
import { PYJAMA_BED, PYJAMA_BODY, PYJAMA_SLOTS, pyjamaTop } from "./_pyjamas.ts";
import { defineCharacter, inBed, part, sidedBy, Z, type Part, type Piece, type Pose } from "./_rig.ts";
import { PLAYER } from "./player.ts";

const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });

/** In bed: asleep, awake and puzzled, or sitting up and dazed. Standing: the player's own face. */
const bedFace = (pose: Pose): Part[] => {
  const shut = pose.action === "lie" || pose.beat === "blink";
  const glance = pose.legs === "sit-bed" && pose.beat === "habit";
  const eyes = shut
    ? ["................................", "................................", ".........eee........eee........."]
    : glance
      ? ["...........we........we.........", "...........ee........ee.........", "...........ee........ee........."]
      : ["..........we........we..........", "..........ee........ee..........", "..........ee........ee.........."];
  // Asleep the brows smooth out; awake they lift, not sure where he is.
  const brows = pose.action === "lie"
    ? ["................................", ".........rrr........rrr........."]
    : [".........rr..........rr.........", "........r..r........r..r........"];
  const mouth = pose.action === "lie"
    ? [".......bb..............bb.......", ".......bb.......m......bb......."]
    : [".......bb..............bb.......", ".......bb......mm......bb......."];
  return [f(21, [...brows, "................................", ...eyes, ...mouth])];
};

const face: Piece = (pose) => (inBed(pose) ? bedFace(pose) : PLAYER.face(pose));

/** A square of gauze taped over the left temple: seen from the front and in the left profile. */
const GAUZE = { w: "white", c: "cream4", t: "cream3" } as const;
const gauze = sidedBy({
  down: () => [part(17, Z.hat, [".ttt.", "twwct", "twcct", ".ttt."], { x: 20, legend: GAUZE, group: "head" })],
  up: () => [],
  right: () => [],
  left: () => [part(18, Z.hat, [".ttt.", "tcwwt", "tccwt", ".ttt."], { x: 11, legend: GAUZE, group: "head" })],
});

export const PATIENT = {
  id: "patient",
  slots: {
    ...PYJAMA_SLOTS,
    S: "skin4", s: "skin3", k: "skin2", b: "blush", m: "skin1", r: "hair1",
    N: "blue3", n: "blue2", Y: "steel4", y: "steel3",
    H: "hair3", h: "hair2", d: "hair1",
  },
  hair: PLAYER.hair,
  face,
  extras: [pyjamaTop, gauze],
  body: PYJAMA_BODY,
  bedBody: PYJAMA_BED,
} as const;

export default defineSprites({
  ...defineCharacter(PATIENT, ["idle", "walk", "lie", "lie-awake", "sit-bed"]),
});
