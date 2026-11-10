/**
 * Unattached daily-life extras the town scene can scatter along the lanes. Each anchors at the middle
 * of where it touches the ground (the birdcage at the foot of its hook, so the scene hangs it from an
 * eave or a branch and sorts it there).
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import {
  JADE, LEAF, art, autoOutline, cylinder, lowPlasticStool, pot, stamp, type Ramp,
} from "./_helpers.ts";

const PINKP: Ramp = ["pink1", "pink1", "pink2", "pink3", "cream5"];
const SKYP: Ramp = ["blue1", "blue2", "blue3", "blue4", "blue5"];

export default defineSprites({
  /**
   * Old Gu's folding chair: a steel frame gone dull, a plywood seat and back painted jade decades ago
   * and worn to bare wood where he sits and leans. A folded newspaper (blank) waits on the seat and a
   * strip of inner tube binds a loose rivet on the left leg.
   */
  "life/folding-chair": {
    w: 18, h: 33, anchor: [9, 32], foot: [-7, -7, 14, 7], shadow: { rx: 8, ry: 3, dy: -2 },
    draw: (p) => {
      // Rear legs, behind everything.
      p.vline(3, 12, 20, "steel2").vline(14, 12, 20, "steel1");
      // Backrest panel between the uprights, the upright tubes rising above the seat.
      p.vline(2, 1, 19, "steel4").vline(15, 1, 19, "steel2");
      p.rect(3, 2, 12, 8, "jade3").hline(3, 2, 12, "jade4").hline(3, 9, 12, "jade2");
      p.over(() => { p.rect(6, 4, 6, 3, "oak3"); p.hline(7, 4, 4, "oak4"); p.px(13, 6, "jade2"); });
      p.px(2, 0, "steel5").px(15, 0, "steel3");
      // The seat: a lit top face, a dark front edge, worn through in the middle.
      p.rect(1, 17, 16, 6, "jade4").hline(1, 17, 16, "jade5");
      p.rect(1, 23, 16, 2, "jade2").hline(1, 24, 16, "jade1");
      p.over(() => { p.rect(5, 19, 8, 3, "oak4"); p.hline(6, 19, 6, "oak5"); });
      // Folded newspaper on the seat.
      art(p, 8, 16, ["cccccc.", "cCCCCCc", "cCddCCc", ".ccccc."], { c: "cream3", C: "cream5", d: "cream2" });
      // Front legs.
      p.vline(1, 25, 8, "steel4").vline(2, 25, 8, "steel3");
      p.vline(15, 25, 8, "steel2").vline(16, 25, 8, "steel1");
      p.hline(2, 29, 13, "steel2");
      // The inner-tube binding at the left rivet.
      art(p, 0, 25, ["kk", "kk", "kk"], { k: "ink2" });
      autoOutline(p, { map: { steel: "steel1", jade: "jade1", cream: "ink2", oak: "wood1" } });
    },
  },

  /**
   * Four low plastic stools nested in a stack by a back door: pink, jade, sky blue, jade, each one a
   * hand-me-down from a different neighbour. The top one has a cigarette burn on its lid.
   */
  "life/stool-stack": {
    w: 19, h: 25, anchor: [9, 24], foot: [-8, -6, 17, 6], shadow: { rx: 9, ry: 3, dy: -1 },
    draw: (p) => {
      const ramps = [PINKP, JADE.concat(["jade6"]) as Ramp, SKYP, JADE.concat(["jade6"]) as Ramp];
      ramps.forEach((r, i) => lowPlasticStool(p, 0, 12 - i * 3, r));
      p.px(5, 10, "ink2").px(6, 10, "brown2");
      autoOutline(p, { map: { pink: "plum1", jade: "jade1", blue: "blue1", cream: "plum1" } });
    },
  },

  /**
   * Old Qian's bamboo birdcage hung out for the morning air, a Japanese white-eye (绣眼) inside: olive
   * green, a white ring round its eye. A blue-and-white seed cup, a perch worn pale, the indigo cloth
   * cover rolled back and tied at the top. Two frames at 2 fps: the bird hops along its perch.
   */
  "life/birdcage": {
    w: 17, h: 38, frames: 2, fps: 2, anchor: [8, 37],
    draw: (p, frame) => {
      // S-hook and the cage's lifting ring.
      art(p, 7, 0, [".s.", "s.s", "..s", ".s.", "s..", "s.s", ".s."], { s: "steel3" });
      p.px(8, 7, "gold3");
      // The dome top, then bars down to the base ring.
      art(p, 2, 8, [
        "....bbbbb....",
        "..bbBBBBBbb..",
        ".bBb.b.b.bBb.",
        "bBb..b.b..bbb",
      ], { b: "bamboo2", B: "bamboo4" });
      // The perch, and the bird on it.
      p.hline(3, 25, 11, "bamboo4");
      const bx = frame ? 7 : 5;
      art(p, bx, 19, [
        ".gg..",
        "gwkg.",
        "gGwgo",
        "ggGgg",
        ".yGgg",
        "..ggd",
      ], { g: "leaf3", G: "leaf4", w: "white", k: "ink", o: "gold2", y: "gold4", d: "leaf2" });
      // Seed cup.
      art(p, 11, 28, ["wbw", "bwb", ".w."], { w: "white", b: "blue3" });
      // Base tray.
      p.rect(1, 33, 15, 3, "bamboo3").hline(1, 33, 15, "bamboo4").hline(1, 35, 15, "bamboo1");
      // The cloth cover rolled up and tied over the dome.
      art(p, 2, 10, ["iiIIIIIIIIIii", ".iiiiiiiiiii."], { i: "blue1", I: "blue2" });
      art(p, 7, 9, ["ccc"], { c: "cream3" });
      autoOutline(p, { map: { bamboo: "wood1", blue: "blue1", leaf: "leaf1", white: "steel2", cream: "ink2", gold: "wood1" } });
      // The bars go on last and unoutlined, so the lane shows between them.
      p.under(() => {
        for (const x of [1, 4, 7, 10, 13, 15]) p.vline(x, 12, 21, x < 8 ? "bamboo3" : "bamboo2");
        p.hline(1, 12, 15, "bamboo3").hline(1, 22, 15, "bamboo2");
      });
      p.hline(1, 12, 15, "bamboo4");
    },
  },

  /**
   * A cotton string mop stood on its handle against a wall to dry, head up, strands splayed and grey
   * at the tips; a rubber band wound round the handle where the grip split.
   */
  "life/mop": {
    w: 15, h: 44, anchor: [7, 43], foot: [-3, -3, 6, 3], shadow: { rx: 4, ry: 2, dy: -1 },
    draw: (p) => {
      // Handle, a little off true.
      p.line(7, 43, 8, 16, "oak3").line(8, 43, 9, 16, "oak2");
      p.px(7, 42, "oak4").px(8, 30, "oak4");
      art(p, 7, 34, ["rr", "rr"], { r: "red3" });
      // The clamp and the head of strands, fanned upward.
      p.rect(5, 14, 7, 3, "steel3").hline(5, 14, 7, "steel5");
      // The head: a mop of strands rising out of the clamp and flopping over on every side.
      art(p, 1, 0, [
        "....aAAAAa....",
        "..aAAaAAaAAa..",
        ".aAaAAaAAaAAa.",
        "aAaAaAAaAaAaab",
        "aAaAaAaAaAaAab",
        "aAa.aAaAaA.aab",
        "aA..aA.aA..aab",
        "aA..a..a...ab.",
        "s...a..a....s.",
        ".s..s..s...s..",
        "....s.......s.",
      ], { a: "cream3", A: "cream4", b: "cream2", s: "stone3" });
      p.rect(5, 12, 7, 3, "steel3").hline(5, 12, 7, "steel5");
      autoOutline(p, { map: { cream: "stone2", stone: "stone1", oak: "wood1", red: "red1", steel: "steel1" } });
    },
  },

  /**
   * A sky-blue plastic bucket with a wire handle, the floor cloth wrung out and hung over its rim to
   * dry. A crack near the base mended with brown packing tape.
   */
  "life/bucket": {
    w: 17, h: 19, anchor: [8, 18], foot: [-6, -4, 12, 4], shadow: { rx: 7, ry: 2, dy: -1 },
    draw: (p) => {
      cylinder(p, 1, 5, 15, 13, ["blue1", "blue2", "blue3", "blue4", "blue5"], (j) => (j > 9 ? 1 : 0));
      p.ellipse(8.5, 5, 7.5, 2.5, "blue4");
      p.ellipse(8.5, 5, 6, 1.6, "blue1");
      p.hline(2, 9, 13, "blue2").hline(2, 10, 13, "blue4");
      // Wire handle arching over.
      art(p, 0, 0, [
        "....sssssssss....",
        "..ss.........ss..",
        ".s.............s.",
        "s...............s",
      ], { s: "steel3" });
      // The grey floor cloth over the rim, hanging down the front.
      art(p, 4, 3, [
        ".gGGGg.",
        "gGGgGgg",
        "gGgggGg",
        ".gGgg..",
        ".gGg...",
        "..gg...",
        "..gG...",
      ], { g: "steel3", G: "steel4" });
      // Tape over the crack.
      p.rect(10, 14, 4, 2, "oak4").hline(10, 14, 4, "oak5");
      autoOutline(p, { map: { blue: "blue1", steel: "steel1", oak: "wood1" } });
    },
  },

  /**
   * A courier box left by a doorstep: brown cardboard, tape across the top, a blank white shipping
   * label with an abstract barcode (no text), a pictogram of a glass meaning handle with care. One
   * corner dented where it was dropped from the scooter.
   */
  "life/delivery-box": {
    w: 22, h: 19, anchor: [11, 18], foot: [-10, -7, 20, 7], shadow: { rx: 10, ry: 3, dy: -1 },
    draw: (p) => {
      p.rect(1, 1, 20, 6, "oak4").hline(1, 1, 20, "oak5").vline(1, 1, 6, "oak5");
      p.rect(1, 7, 20, 11, "oak3").hline(1, 7, 20, "oak4").hline(1, 8, 20, "oak2").vline(20, 7, 11, "oak2");
      p.hline(1, 17, 20, "oak2");
      // Tape down the seam and over the front edge.
      p.rect(10, 1, 3, 6, "bamboo4").vline(10, 1, 6, "bamboo5");
      p.rect(10, 7, 3, 3, "bamboo4");
      // The label.
      p.rect(3, 10, 7, 6, "white").vline(9, 10, 6, "cream3").hline(3, 15, 7, "cream3");
      for (const x of [4, 6, 7, 9]) p.vline(x - (x === 9 ? 1 : 0), 11, 2, "ink2");
      p.hline(4, 14, 4, "cream3");
      // The glass pictogram.
      art(p, 15, 10, ["k.k", "kkk", ".k.", "kkk"], { k: "oak1" });
      // Dented corner.
      art(p, 17, 1, ["...dd", "..dcd", ".dcd."], { d: "oak2", c: "oak4" });
      autoOutline(p, { map: { oak: "wood1", bamboo: "wood1", white: "wood1", cream: "wood1", ink: "wood1" } });
    },
  },

  /**
   * Old blue-grey shikumen bricks saved from a demolition two lanes over, stacked crosswise with
   * mortar still crusted on them, a single red brick among them; two loose ones beside the stack.
   */
  "life/bricks": {
    w: 26, h: 20, anchor: [13, 19], foot: [-12, -7, 24, 7], shadow: { rx: 12, ry: 3, dy: -1 },
    draw: (p) => {
      const brick = (x: number, y: number, w: number, red = false) => {
        const [a, b, c] = red ? ["rose2", "rose3", "rose4"] as const : ["steel2", "steel3", "steel4"] as const;
        p.rect(x, y, w, 2, c).rect(x, y + 2, w, 3, b).hline(x, y + 4, w, a).vline(x + w - 1, y + 2, 3, a);
        p.px(x + 2, y + 3, a).px(x + w - 4, y + 2, c);
      };
      // Bottom course: ends facing out; second course across; top course one long brick.
      for (let i = 0; i < 4; i++) brick(1 + i * 5, 14, 5, i === 2);
      brick(2, 9, 9);
      brick(11, 9, 9);
      brick(5, 4, 11);
      // Crusted mortar.
      for (const [x, y, n] of [[3, 9, 3], [12, 13, 4], [7, 4, 2], [18, 9, 2], [5, 18, 3]] as const) p.hline(x, y, n, "cream2");
      // Two loose bricks on the ground.
      brick(21, 15, 5);
      brick(20, 11, 6);
      autoOutline(p, { map: { steel: "steel1", rose: "rose1", cream: "steel1" } });
    },
  },

  /**
   * A potted kumquat (金桔) bought for the New Year and kept going since: a tight round head of glossy
   * leaves studded with little gold-orange fruit, in a cobalt glazed pot, a blank gold paper tag
   * still hanging from one branch.
   */
  "life/kumquat": {
    w: 22, h: 40, anchor: [11, 39], foot: [-8, -6, 16, 6], shadow: { rx: 9, ry: 3, dy: -2 },
    draw: (p) => {
      pot(p, 3, 25, 16, 15, ["blue1", "blue2", "blue3", "blue4", "blue5"], { belly: 1 });
      // Trunk.
      p.vline(11, 18, 10, "wood3").vline(12, 18, 10, "wood2");
      // The head: a dome of small leaves.
      p.ellipse(11.5, 11, 10.5, 9, "leaf1");
      p.ellipse(11, 10.5, 9.5, 8, "leaf2");
      for (let y = 3; y < 18; y += 3) for (let x = 3 + (y % 2); x < 20; x += 3) {
        const u = (x + 1 - 11.5) / 10, v = (y + 1 - 11) / 9;
        if (u * u + v * v > 0.85) continue;
        stamp(p, x, y, ["34", "23"], LEAF, { shift: u + v < -0.4 ? 1 : u + v > 0.5 ? -1 : 0 });
      }
      // Fruit.
      for (const [x, y] of [[5, 7], [9, 4], [14, 6], [17, 10], [7, 12], [12, 10], [15, 14], [4, 13], [10, 16], [18, 6]] as const)
        art(p, x, y, ["oO", "do"], { o: "orange3", O: "gold4", d: "orange2" });
      // The tag.
      art(p, 16, 15, ["c..", ".c.", ".gg", ".gG", ".gg"], { c: "cream2", g: "gold3", G: "gold4" });
      autoOutline(p, { map: { orange: "brown1", gold: "wood1", blue: "blue1", cream: "ink2" } });
    },
  },
});
