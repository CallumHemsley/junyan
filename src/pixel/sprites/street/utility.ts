/**
 * Utilities (ticket 0166): the two concrete utility poles, the pump-house pipes, and scatterable
 * extras: air-conditioner condensers, a China Post pillar box (green), a cable drum and a fire
 * hydrant.
 *
 * The poles are the one deliberate stretch of the footprint rule: a pole's crossarm and its
 * transformer hang wider than the 0.3-tile footprint (the sprite stays centred on its anchor),
 * because a pole without them is a stick.
 */
import { defineSprites, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, townProps, townSpriteId, type TownProp } from "../../town/map.ts";
import { CONCRETE, STEEL, across, art, autoOutline, cable, column, rod, seedOf } from "./_helpers.ts";

/**
 * A concrete utility pole: tapered, its shaft ringed with step bolts; two crossarms of angle iron
 * with porcelain insulators; a pole-top transformer drum with cooling fins; bundles of black
 * telecom cable sagging in loops off the arms and a coil of spare fibre hung halfway down; a grey
 * junction box; layers of torn small-ad flyers at hand height (blank, no text).
 */
function utilityPole(prop: TownProp, i: number): SpriteDef {
  const W = 48, H = 168, B = H - 1, cx = W / 2;
  const seed = seedOf(prop.id);
  return {
    w: W, h: H, anchor: [cx, B], foot: [-3, -3, 6, 3], shadow: { rx: 5, ry: 2 },
    draw: (p) => {
      // Shaft: 6 wide at the foot, 4 at the top.
      for (let y = 6; y <= B; y++) {
        const half = y > 110 ? 3 : 2;
        across(half * 2, CONCRETE).forEach((c, k) => p.px(cx - half + k, y, c));
      }
      p.over(() => {
        // Casting seams and the concrete's pocks: short streaks, not speckle.
        for (let y = 14; y < B - 4; y += 9 + ((y * 7) % 6)) p.px(cx - 1 + ((y >> 2) & 1), y, "stone2");
        p.hline(cx - 3, B - 1, 6, "stone2");
      });
      // Step bolts, alternating sides.
      for (let y = 30; y < 104; y += 8) p.px(((y >> 3) & 1) ? cx + 2 : cx - 3, y, "steel4").px(((y >> 3) & 1) ? cx + 3 : cx - 4, y, "steel2");
      // Crossarms.
      for (const [y, half] of [[10, 22], [24, 14]] as const) {
        rod(p, cx - half, y, half * 2, 2, ["steel1", "steel2", "steel3"]);
        p.line(cx - 6, y + 2, cx - 1, y + 8, "steel2").line(cx + 6, y + 2, cx + 1, y + 8, "steel2");
        for (const dx of half > 16 ? [-20, -12, 11, 19] : [-12, 11]) art(p, cx + dx, y - 4, [".55.", "5664", ".44.", ".33."], { 3: "steel3", 4: "cream3", 5: "cream5", 6: "white" });
      }
      // Transformer drum on its bracket, off to the right; fins; two bushings.
      const tx = cx + 7, ty = 30;
      p.rect(cx + 2, ty + 6, 6, 2, "steel2");
      p.rect(cx + 2, ty + 18, 6, 2, "steel2");
      column(p, tx, ty, 12, 22, STEEL);
      p.ellipse(tx + 6, ty, 6, 2, "steel5");
      p.over(() => { for (let y = ty + 3; y < ty + 21; y += 3) p.hline(tx, y, 12, "steel2"); p.px(tx + 2, ty + 4, "steel6"); });
      for (const bx of [tx + 2, tx + 8]) art(p, bx, ty - 6, [".5.", "565", ".4.", "545", ".3."], { 3: "steel3", 4: "cream3", 5: "cream5", 6: "white" });
      p.px(tx + 9, ty + 20, "orange1").vline(tx + 9, ty + 21, 3, "orange1");
      // The coil of spare fibre, three loops, black with one grey.
      for (let k = 0; k < 3; k++) p.ellipse(cx + 0.5, 82 + k, 6 - k * 0.4, 4, k === 1 ? "steel2" : "ink");
      p.ellipse(cx + 0.5, 83, 4, 2.4, null);
      across(4, CONCRETE).forEach((c, k) => p.vline(cx - 2 + k, 80, 3, c));
      // A conduit running down into the ground.
      rod(p, cx + 3, 88, 2, 1, STEEL);
      for (let y = 88; y <= B; y++) p.px(cx + 3, y, "steel3").px(cx + 4, y, "steel2");
      // Junction box.
      art(p, cx - 9, 96, ["kkkkkkk", "k55554k", "k54443k", "k54k43k", "k44443k", "k44443k", "k33333k", "kkkkkkk"], { k: "steel1", 3: "steel3", 4: "steel4", 5: "steel5" });
      // Small-ad flyers at hand height, layered and torn (blank).
      art(p, cx - 3, 118 + (i % 2) * 4, [
        "c55c..",
        "5554c.",
        "4c44jc",
        "554jjc",
        ".5jjj.",
        "c44c4.",
        ".c55c.",
        "..c4c.",
        ".c....",
      ], { 4: "cream4", 5: "cream5", c: "cream3", j: "blue5" });
      // A stencilled pole number plate: a blank white rectangle.
      p.rect(cx - 2, 140, 4, 5, "white").hline(cx - 2, 144, 4, "stone4");
      autoOutline(p, { map: { stone: "stone1", steel: "steel1", cream: "stone1", white: "stone1", ink: "ink", blue: "stone1", orange: "steel1" } });
      // Cables, drawn after the outline so they stay fine: slack bundles drooping from the arm ends
      // back to the pole, one strand dropping to the coil.
      const blk = ["ink", "steel1", "ink2"] as const;
      const droop = 12 + (seed % 5);
      for (let k = 0; k < 3; k++) {
        cable(p, [cx - 21, 12 + k], [cx - 3, 12 + k], droop + k * 2, blk[k]);
        cable(p, [cx + 19, 12 + k], [cx + 3, 13 + k], droop - 4 + k * 2, blk[k]);
        cable(p, [cx - 13, 26 + k], [cx - 3, 27], droop + 6 + k, blk[k]);
      }
      p.line(cx - 3, 30, cx - 3, 80, "ink");
    },
  };
}

/**
 * The pump-house pipes (town.pump-pipes), seen from above as they run north–south: a fat green
 * water main and a thin lagged pipe beside it on concrete saddles, flanged joints, a handwheel
 * valve, a gauge, and at the north end the main rising out of the ground toward the pump house.
 */
function pipes(prop: TownProp): SpriteDef {
  const f = footprintPx(prop);
  const W = f.w, rise = 14, H = f.h + rise, B = H - 1;
  return {
    w: W, h: H, anchor: [Math.round(W / 2), B], shadow: { rx: 5, ry: 2 },
    draw: (p) => {
      const MAIN = ["jade1", "jade2", "jade3", "jade4", "jade5"] as const;
      // Concrete saddles.
      for (let y = rise + 10; y < B - 4; y += 30) { p.rect(0, y, W, 5, "stone3"); p.hline(0, y, W, "stone4"); p.hline(0, y + 4, W, "stone2"); }
      // The main and the lagged pipe, shaded across (lit from the left).
      column(p, 1, rise, 6, f.h - 3, MAIN);
      column(p, 8, rise + 4, 3, f.h - 9, ["stone2", "steel4", "steel5", "steel6"]);
      p.over(() => {
        // Lagging wrapped in foil, the bands catching light; one band peeled back to grey wool.
        for (let y = rise + 6; y < B - 6; y += 3) p.px(8, y, "steel6").px(10, y + 1, "steel3");
        p.rect(8, rise + 50, 3, 6, "stone4");
        p.px(9, rise + 52, "stone3");
        // Rust bleeding from every flange down the paint.
        for (let y = rise + 22; y < B - 8; y += 26) p.vline(5, y + 2, 5, "orange1");
      });
      // Flanges with bolt heads.
      for (let y = rise + 20; y < B - 8; y += 26) { rod(p, 0, y, 8, 2, MAIN); p.px(1, y, "steel4").px(5, y, "steel4"); }
      // The riser at the north end: the main comes up out of the ground, a flange on top.
      column(p, 1, 0, 6, rise + 2, MAIN);
      p.ellipse(4, 1, 3.5, 1.5, "jade4");
      p.ellipse(4, 1, 2, 0.8, "jade1");
      // Handwheel valve, seen from above: a blue ring with spokes.
      const vy = rise + 34;
      for (let a = 0; a < Math.PI * 2; a += 0.15) p.px(Math.round(4 + Math.cos(a) * 4), Math.round(vy + Math.sin(a) * 3), a > 3 && a < 5 ? "blue4" : "blue2");
      p.line(1, vy, 7, vy, "blue2").line(4, vy - 3, 4, vy + 3, "blue2").px(4, vy, "steel5");
      // A pressure gauge on a stub: blank dial, a needle.
      art(p, 6, rise + 74, [".kkk.", "kWWWk", "kWkWk", "kWWck", ".kkk."], { k: "steel1", W: "white", c: "cream3" });
      // The south end dives into the ground.
      p.ellipse(4, B - 2, 3.5, 1.6, "ink");
      autoOutline(p, { map: { jade: "jade1", stone: "stone1", steel: "steel1", blue: "blue1", white: "steel1", orange: "jade1" } });
    },
  };
}

const sprites: Record<string, SpriteDef> = {};
townProps("utility-pole").forEach((prop, i) => { sprites[townSpriteId(prop.id)] = utilityPole(prop, i); });
for (const prop of townProps("pipes")) sprites[townSpriteId(prop.id)] = pipes(prop);

/**
 * A split-system condenser standing on two bricks against a wall: a fan grille, side louvres, its
 * pipes taped in grey and running up out of frame, a drip stain on the paving. 30×28.
 */
sprites["street/ac-unit-a"] = {
  w: 30, h: 30, anchor: [15, 29], foot: [-14, -5, 28, 5], shadow: { rx: 14, ry: 3, dy: -1 },
  draw: (p) => {
    p.rect(1, 4, 28, 20, "steel5");
    p.hline(1, 4, 28, "steel6").vline(1, 4, 20, "steel6").vline(28, 4, 20, "steel3").hline(1, 23, 28, "steel3");
    // Fan grille: dark disc, spiral guard, hub.
    p.ellipse(11, 14, 8, 8, "steel2");
    p.over(() => { for (const r of [6.5, 4.5, 2.5]) for (let a = 0; a < Math.PI * 2; a += 0.08) p.px(Math.round(11 + Math.cos(a) * r - 0.5), Math.round(14 + Math.sin(a) * r - 0.5), "steel4"); });
    p.line(5, 14, 17, 14, "steel3").line(11, 8, 11, 20, "steel3");
    p.ellipse(11, 14, 1.5, 1.5, "steel5");
    // Louvres.
    for (let y = 7; y < 22; y += 2) p.hline(21, y, 6, "steel3").hline(21, y + 1, 6, "steel6");
    // Pipes up the wall, grey tape spiralling.
    for (let y = 0; y < 8; y++) p.px(25, y, y % 2 ? "steel4" : "cream3").px(26, y, "steel3");
    p.rect(24, 4, 4, 3, "steel3");
    // Bricks.
    for (const x of [3, 20]) { p.rect(x, 24, 7, 4, "rose3"); p.hline(x, 24, 7, "rose4"); p.hline(x, 27, 7, "rose2"); }
    // Drip stain and a rust bloom at the foot.
    p.px(27, 24, "orange1").px(2, 22, "orange1").px(3, 22, "rose2");
    autoOutline(p, { map: { steel: "steel1", rose: "rose1", cream: "steel1", orange: "steel1" } });
    p.faded(0.45, (q) => q.ellipse(14, 29, 5, 1, "steel1"));
  },
};

/**
 * A wall-bracket condenser (for the scene to hang on a facade, sorted with the building): an
 * older beige unit on a rusty angle-iron bracket, a pot of spring onions someone keeps on top. 30×30.
 */
sprites["street/ac-unit-b"] = {
  w: 30, h: 32, anchor: [15, 31],
  draw: (p) => {
    p.rect(1, 9, 28, 17, "cream4");
    p.hline(1, 9, 28, "cream5").vline(28, 9, 17, "cream2").hline(1, 25, 28, "cream2");
    for (let y = 11; y < 24; y += 2) p.hline(4, y, 15, "cream2");
    p.rect(21, 11, 6, 12, "cream3").frame(21, 11, 6, 12, "cream2");
    p.over(() => { p.vline(9, 18, 7, "cream3").px(9, 24, "orange1"); });
    // Bracket.
    p.hline(0, 26, 30, "steel2").hline(0, 27, 30, "steel1");
    for (const x of [3, 25]) p.line(x, 28, x - 3 + (x > 10 ? 6 : 0), 31, "steel2");
    p.px(8, 27, "orange1").px(20, 26, "orange1");
    // Pot of spring onions on top.
    art(p, 4, 0, ["..l.l.", ".lLlL.", "..lLl.", ".kkkk.", "krrrrk", ".rrrr."], { l: "leaf3", L: "leaf4", k: "rose2", r: "rose3" });
    autoOutline(p, { map: { cream: "cream1", steel: "steel1", leaf: "leaf1", rose: "rose1", orange: "steel1" } });
  },
};

/**
 * A China Post pillar box: green, as the post is, with a domed cap, a slot under a rain lip, a
 * collection-time plate left blank, and a sticker scraped half off. 18×36.
 */
sprites["street/postbox"] = {
  w: 18, h: 36, anchor: [9, 35], foot: [-6, -4, 12, 4], shadow: { rx: 7, ry: 2 },
  draw: (p) => {
    const G = ["jade1", "jade2", "jade3", "jade4", "jade5"] as const;
    column(p, 3, 9, 12, 24, G);
    p.ellipse(9, 7, 7, 4, "jade4");
    p.over(() => { p.ellipse(8, 6, 4, 2, "jade5"); });
    p.hline(2, 9, 14, "jade2").hline(2, 10, 14, "jade3");
    // Slot under its lip.
    p.hline(5, 13, 8, "jade5").hline(5, 14, 8, "ink");
    // Blank plate and the gold emblem (an abstract bar, not the logo).
    p.rect(6, 17, 6, 5, "cream5").hline(6, 21, 6, "cream3");
    p.hline(7, 24, 4, "gold3").px(7, 24, "gold4");
    // Scraped sticker and a scuffed foot.
    p.over(() => { p.rect(4, 26, 3, 2, "cream4").px(5, 27, "jade4"); p.hline(3, 31, 12, "jade2"); p.px(6, 32, "steel3").px(11, 32, "steel3"); });
    p.rect(3, 33, 12, 2, "stone3").hline(3, 33, 12, "stone4");
    autoOutline(p, { map: { jade: "jade1", stone: "stone1", cream: "jade1", gold: "jade1", steel: "jade1", ink: "jade1" } });
  },
};

/**
 * A wooden cable drum left by the telecom crew, standing on edge: its front flange is a disc of
 * nailed planks with the maker's stencil weathered off, black cable wound behind; the lane uses it
 * as a table, so a chipped enamel mug sits on top. 30×32.
 */
sprites["street/cable-spool"] = {
  w: 32, h: 32, anchor: [16, 31], foot: [-13, -6, 26, 6], shadow: { rx: 13, ry: 3, dy: -1 },
  draw: (p) => {
    p.ellipse(16, 18, 13, 13, "oak3");
    p.over(() => {
      for (let x = 3; x < 30; x += 6) p.vline(x, 4, 28, "oak1");
      p.ellipse(13, 15, 9, 9, "oak4");
      p.ellipse(16, 18, 13, 13, null);
    });
    p.ellipse(16, 18, 13, 13, "oak3");
    p.over(() => {
      for (let x = 3; x < 30; x += 6) { p.vline(x, 4, 28, "oak2"); p.vline(x + 1, 4, 28, "oak4"); }
      for (let a = 3.3; a < 5.2; a += 0.05) p.px(Math.round(16 + Math.cos(a) * 12), Math.round(18 + Math.sin(a) * 12), "oak5");
      for (let a = 0; a < 1.6; a += 0.05) p.px(Math.round(16 + Math.cos(a) * 12), Math.round(18 + Math.sin(a) * 12), "oak1");
    });
    p.ellipse(16, 18, 3.5, 3.5, "wood1");
    p.ellipse(15.5, 17.5, 2, 2, "ink");
    for (const [x, y] of [[9, 9], [22, 9], [9, 26], [22, 26], [5, 18], [27, 18]] as const) p.px(x, y, "steel3");
    // Cable wound on the drum, glimpsed above the flange.
    p.hline(8, 4, 16, "ink2").hline(10, 3, 12, "ink");
    // The mug on top.
    art(p, 13, 0, ["kkkk.", "kWWkk", "kWcks", "kkkk."], { k: "blue2", W: "white", c: "blue6", s: "blue2" });
    autoOutline(p, { map: { oak: "wood1", blue: "blue1", ink: "ink", white: "blue1" } });
  },
};

/**
 * A fire hydrant, the one deliberate red on the street: lacquer red faded on the sunny side,
 * chipped to grey primer at the caps, a brass outlet, a dog-walker's water bowl beside it. 16×26.
 */
sprites["street/hydrant"] = {
  w: 18, h: 28, anchor: [9, 27], foot: [-5, -4, 10, 4], shadow: { rx: 6, ry: 2 },
  draw: (p) => {
    const Rd = ["red1", "red2", "red3", "red4", "red5"] as const;
    column(p, 5, 9, 8, 15, Rd);
    p.ellipse(9, 8, 4, 2.5, "red3");
    art(p, 7, 3, [".44.", "4542", ".32."], { 2: "red2", 3: "red3", 4: "red4", 5: "red5" });
    // Side outlets and caps.
    for (const [x, flip] of [[2, 0], [13, 1]] as const) art(p, x, 13, flip ? ["32.", "321", "32."] : [".43", "443", ".43"], { 1: "red1", 2: "red2", 3: "red3", 4: "red4" });
    art(p, 7, 15, ["gg", "Gg"], { g: "gold2", G: "gold4" });
    rod(p, 4, 23, 10, 2, Rd);
    p.rect(4, 25, 10, 2, "stone3").hline(4, 25, 10, "stone4");
    p.over(() => { p.px(6, 9, "stone3").px(7, 9, "stone4").px(12, 14, "stone3").px(5, 21, "stone3"); });
    autoOutline(p, { map: { red: "red1", gold: "wood1", stone: "stone1" } });
    // The water bowl.
    art(p, 13, 25, ["kkkk", "kbbk", ".kk."], { k: "steel2", b: "blue4" });
  },
};

export default defineSprites(sprites);
