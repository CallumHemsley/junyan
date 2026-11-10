/**
 * The ward door, on the back wall: a leaf-and-a-half door (子母门), the wide leaf for people and the
 * narrow one bolted shut except when a bed has to go through. Flush timber leaves painted cream in a
 * jade steel frame. The wide leaf has a wired-glass vision panel with the corridor's light in it, a
 * blank enamel room plate above that, a steel lever, and a door closer at its head. Both leaves wear
 * steel kick plates dented by forty years of bed ends and trolleys. A cool line of corridor light
 * shows under the door.
 *
 * 48×76. Anchors at the wall's foot: place it at (x, 96) on a wall that starts at y = 0; it stands on
 * the floor line and its frame head lands on wall row 20. The room plate's blank face, for a DOM mark,
 * is sprite px x 11–23, y 5–8 (13×4).
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { WALL, block, fromTop } from "./_arch.ts";

const W = 48, H = 76;
/** Leaves: the wide one x 3–31, the narrow one x 32–44; frame head rows 0–2; kick plates rows 58–73. */
const KICK = 58;

function frame(p: Px) {
  p.rect(0, 0, W, H, "jade3");
  p.vline(0, 0, H, "jade4").hline(0, 0, W, "jade4");
  p.vline(2, 3, H - 3, "jade2").hline(3, 2, W - 6, "jade2");
  p.vline(W - 1, 0, H, "jade1").vline(W - 3, 3, H - 3, "jade4");
  // Trolley strikes on the left jamb at wheel height: the paint knocked back to grey steel.
  block(p, 0, 64, ["ff.", "fF.", ".f.", "...", "f..", "Ff."], WALL, "jamb-chips");
}

function leaf(p: Px, x0: number, x1: number) {
  const w = x1 - x0 + 1;
  p.rect(x0, 3, w, H - 4, "cream4");
  p.vline(x0, 3, H - 4, "cream5").vline(x1, 3, H - 4, "cream3").hline(x0, 3, w, "cream2");
  // Gloss catching the window, a long soft streak down the left of the leaf.
  p.vline(x0 + 2, 12, 30, "cream5");
  // Kick plate: brushed steel, screwed at the corners, dented and scored at bed-end height.
  p.rect(x0 + 1, KICK, w - 2, 16, "steel4");
  p.hline(x0 + 1, KICK, w - 2, "steel6").hline(x0 + 1, KICK + 15, w - 2, "steel2").vline(x1 - 1, KICK + 1, 14, "steel3");
  for (const [x, y] of [[x0 + 2, KICK + 2], [x1 - 3, KICK + 2], [x0 + 2, KICK + 13], [x1 - 3, KICK + 13]]) p.px(x, y, "steel2");
  for (let x = x0 + 2; x < x1 - 1; x++) if ((x * 7) % 5 < 3) p.px(x, KICK + 6, "steel3");
  for (let x = x0 + 4; x < x1 - 3; x++) if ((x * 3) % 7 < 4) p.px(x, KICK + 9, "steel5");
}

export default defineSprites({
  "ward/door": {
    w: W, h: H, anchor: [24, fromTop(20)], layer: "floor",
    draw: (p) => {
      frame(p);
      leaf(p, 3, 31);
      leaf(p, 32, 44);
      p.vline(31, 3, H - 4, "cream1");
      // Dents in the wide leaf's plate where bed ends hit: a dark crease with a lit lip below.
      block(p, 7, KICK + 3, ["FFF.", "eIIe"], WALL, "dent-1");
      block(p, 19, KICK + 10, [".FFFF", "IIee."], WALL, "dent-2");
      block(p, 35, KICK + 4, ["FF", "Ie"], WALL, "dent-3");
      // The vision panel: wired glass in a steel bead, the corridor's strip light high in it.
      p.rect(9, 12, 17, 25, "steel3");
      p.hline(9, 12, 17, "steel2").vline(9, 12, 25, "steel2").hline(9, 36, 17, "steel5").vline(25, 12, 25, "steel5");
      p.faded(0.92, () => {
        for (let y = 13; y < 36; y++) for (let x = 10; x < 25; x++) p.px(x, y, y < 16 ? "white" : y < 27 ? "blue6" : "blue5");
      });
      p.faded(0.55, () => {
        for (let y = 13; y < 36; y++) for (let x = 10; x < 25; x++) if ((x - 10) % 3 === 2 || (y - 13) % 3 === 2) p.px(x, y, "steel3");
      });
      p.faded(0.8, () => { p.px(12, 19, "white").px(13, 18, "white").px(12, 26, "white").px(13, 25, "white").px(14, 24, "white"); });
      // The room plate: blank white enamel with a jade border, two brass screws.
      block(p, 10, 4, [
        "hhhhhhhhhhhhhhh",
        "hWWWWWWWWWWWWWh",
        "hWWWWWWWWWWWWWH",
        "hWWWWWWWWWWWWWH",
        "hWWWWWWWWWWWWWH",
        "hHHHHHHHHHHHHHH",
      ], WALL, "room-plate");
      p.px(11, 6, "bamboo3").px(23, 6, "bamboo3");
      // Door closer on the head of the wide leaf, its arm folded to the frame.
      block(p, 4, 3, [".FFFFFFFFFF.ff", "FEeeeeeeeeEFFf", "FEEEEEEEEEEFF.", ".FFFFFFFFFF..."], WALL, "closer");
      // Fingers have greyed the paint round the lever; the lever and its rose; a keyhole.
      block(p, 22, 39, ["..kkkkk..", ".kk....k.", "kk.......", ".k......k", "..kkkkkk."], WALL, "hand-grime");
      block(p, 23, 41, ["......fF.", "IIIIIIeef", "fffffffEf", "......fF."], WALL, "lever");
      p.px(29, 47, "ink").px(29, 48, "steel2");
      // The narrow leaf's flush bolts, and the ghost of a sign taped to it once.
      block(p, 37, 4, ["e", "E", "f"], WALL, "bolt-top");
      block(p, 37, KICK - 4, ["e", "E", "f"], WALL, "bolt-bottom");
      block(p, 34, 20, ["kk.....kk", "k.......k", ".........", ".........", "k.......k", "kk.....kk"], WALL, "tape-ghost");
      // Under the door: the corridor's light in a thin cool line.
      p.hline(3, H - 1, 42, "ink2");
      p.faded(0.9, () => p.hline(5, H - 1, 24, "blue6"));
    },
  },
});
