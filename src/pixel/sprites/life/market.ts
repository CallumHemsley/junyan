/**
 * The market pocket south of the bistro: Auntie Xu's vegetable and fruit stall and the baskets she
 * sets out on the bricks in front of it. One sprite per map instance, sized to the footprint and
 * anchored on its bottom-centre (pixel-contracts).
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { townProps, townSpriteId } from "../../town/map.ts";
import {
  BLUE, art, autoOutline, basket, bokChoy, cloth, egg, eggplant, garlic, ginger, orange, orangeHeap,
  plasticCrate, printMotif, scallion, townFoot, townFrame, tray, JADE, lowPlasticStool,
} from "./_helpers.ts";

// ── stall pieces ───────────────────────────────────────────────────────────────

/** A bamboo pole standing from (x, y0) down to (x, y1): lit left column, shaded right, nodes. */
function upright(p: Px, x: number, y0: number, y1: number): void {
  p.vline(x, y0, y1 - y0, "bamboo4").vline(x + 1, y0, y1 - y0, "bamboo2");
  for (let y = y0 + 9; y < y1 - 2; y += 16) p.px(x, y, "bamboo5").px(x + 1, y, "bamboo1");
}

/**
 * The canopy: a tarp of faded blue and cream stripes stretched over four poles. The top face sags
 * toward the front between the poles, a square of brown canvas is stitched over an old tear, and a
 * tide mark rings the low spot where rain pools. The front valance hangs in scallops.
 */
function canopy(p: Px, w: number, top: number, front: number, valance: number): void {
  const stripe = (x: number) => Math.floor((x + 2) / 7) % 2 === 0;
  for (let x = 0; x < w; x++) {
    const u = (x - w / 2) / (w / 2);
    const sag = Math.round((1 - u * u) * 2);
    const y1 = front + sag;
    for (let y = top; y < y1; y++) {
      const blue = stripe(x);
      const depth = (y - top) / (y1 - top);
      // The tarp is lit from the upper left; it darkens a step into the sag toward the front.
      const lvl = depth > 0.82 ? 0 : 1;
      p.px(x, y, blue ? (lvl ? "blue4" : "blue3") : (lvl ? "cream4" : "cream3"));
    }
    // Valance: front face, a step darker, in scallops eight wide.
    const s = ((x % 8) + 8) % 8;
    const drop = valance - (s === 0 || s === 7 ? 2 : s === 1 || s === 6 ? 1 : 0);
    for (let y = y1; y < y1 + drop; y++) {
      const blue = stripe(x);
      const last = y === y1 + drop - 1;
      p.px(x, y, blue ? (last ? "blue2" : "blue3") : (last ? "cream2" : "cream3"));
    }
    p.px(x, y1, stripe(x) ? "blue5" : "cream5");
  }
  // The back edge, a lit hem.
  for (let x = 0; x < w; x++) p.px(x, top, stripe(x) ? "blue5" : "cream5");
  // A brown canvas patch over an old tear, stitched round.
  const px0 = Math.round(w * 0.58), py0 = top + 5;
  p.rect(px0, py0, 11, 7, "oak3").hline(px0, py0, 11, "oak4").hline(px0, py0 + 6, 11, "oak2");
  for (let i = 0; i < 11; i += 2) p.px(px0 + i, py0 - 1, "cream2").px(px0 + i, py0 + 7, "cream2");
  for (let j = 1; j < 7; j += 2) p.px(px0 - 1, py0 + j, "cream2").px(px0 + 11, py0 + j, "cream2");
  // The tide mark where rain pools in the sag.
  p.over(() => {
    for (let x = Math.round(w * 0.3); x < Math.round(w * 0.5); x++) {
      const u = (x - w * 0.4) / (w * 0.1);
      const y = Math.round(front - 3 - Math.sqrt(Math.max(0, 1 - u * u)) * 2);
      p.px(x, y, stripe(x) ? "blue3" : "cream2");
    }
  });
}

/**
 * The QR card for paying by phone, laminated and propped in a plastic stand: three finder squares
 * and an abstract block pattern. Not a real code and not text. 9×12.
 */
function qrCard(p: Px, x: number, y: number): void {
  p.rect(x, y, 9, 11, "white").vline(x + 8, y, 11, "steel5").hline(x, y + 10, 9, "steel4");
  const finder = ["kkk", "kwk", "kkk"];
  art(p, x + 1, y + 1, finder, { k: "ink", w: "white" });
  art(p, x + 5, y + 1, finder, { k: "ink", w: "white" });
  art(p, x + 1, y + 5, finder, { k: "ink", w: "white" });
  art(p, x + 5, y + 5, ["k.k", ".kk", "k.."], { k: "ink2" });
  // The laminate's glare across the top left.
  p.px(x + 4, y + 1, "steel6").px(x + 4, y + 2, "steel5");
  // A clear acrylic stand behind and below.
  art(p, x - 1, y + 9, ["s.........", "sSSSSSSSSs"], { s: "steel4", S: "steel5" });
}

/**
 * The steelyard (杆秤) Auntie Xu still trusts over the electronic one: a dark beam studded with
 * brass marks hung from the canopy by a cord, a brass pan on three strings at the short end, the
 * iron weight on its loop at the long end. Hung from (x, y); about 26×22.
 */
function steelyard(p: Px, x: number, y: number): void {
  // Cord down from the canopy to the beam's lifting ring.
  p.vline(x + 7, y, 7, "cream2");
  p.px(x + 7, y + 7, "gold2");
  // The beam, tilted a pixel down toward the long end, brass studs along it.
  p.line(x, y + 8, x + 24, y + 10, "wood2");
  p.line(x, y + 9, x + 24, y + 11, "wood1");
  for (let i = 9; i < 24; i += 3) p.px(x + i, y + 8 + Math.round(i / 12), "gold4");
  p.px(x, y + 8, "gold3").px(x, y + 9, "gold2");
  // Pan strings and the pan at the short end.
  p.line(x + 2, y + 10, x - 2, y + 17, "cream2").line(x + 2, y + 10, x + 6, y + 17, "cream2").vline(x + 2, y + 10, 7, "cream3");
  art(p, x - 4, y + 17, [
    ".gGGGGGGg..",
    "gGGGGGGGgga",
    ".aggggggaa.",
    "...aaaaa...",
  ], { G: "gold4", g: "gold3", a: "gold2" });
  // A few loose beans left in the pan.
  p.px(x - 1, y + 17, "leaf3").px(x + 1, y + 17, "leaf2");
  // The weight on its loop near the long end.
  p.vline(x + 19, y + 11, 3, "steel3");
  art(p, x + 17, y + 14, [".ss.", "sSss", "ssss", ".kk."], { s: "steel2", S: "steel4", k: "steel1" });
}

/** A low square plastic stool in faded jade, a dent in the lid, with the vendor's glass tea jar on it. 18×18. */
function lowStool(p: Px, x: number, y: number): void {
  lowPlasticStool(p, x, y + 4, JADE, true);
  // The tea jar: a glass jar with a fat layer of leaves and a screw lid.
  art(p, x + 2, y - 4, [
    ".rrrr.",
    "rRRRrq",
    "b6666b",
    "b6ggga",
    "bgGgga",
    "bgggga",
    "bLLLLa",
    "bLlLla",
    ".aaaa.",
  ], { r: "rose3", R: "rose4", q: "rose2", b: "blue5", a: "steel4", "6": "blue6", g: "gold3", G: "gold4", L: "bamboo3", l: "bamboo2" });
}

/** A winter melon section lying on its side, the cut end wrapped in cling film. 24×11. */
function winterMelon(p: Px, x: number, y: number): void {
  art(p, x, y, [
    "...222222222222222222.",
    ".2233333333333343333cc",
    "233434333433333333cwWc",
    "234333343333433334cWwWc",
    "23333433333333333cwWwbc",
    "2333333334333333cwwbbwc",
    "2223333333333332cwWbbwc",
    ".22223333332222.cwwwwc.",
    "...1111111111111.cccc..",
  ], { "1": "jade1", "2": "jade2", "3": "jade3", "4": "jade5", c: "cream3", w: "cream5", W: "white", b: "bamboo4" });
  // The waxy bloom: pale dots in a loose scatter.
  for (const [dx, dy] of [[4, 3], [9, 2], [12, 5], [6, 6], [15, 3], [11, 7]] as const) p.px(x + dx, y + dy, "jade4");
  p.hline(x + 3, y + 1, 12, "jade4");
  // Cling film glints over the cut face.
  p.px(x + 19, y + 2, "steel6").px(x + 20, y + 3, "steel6");
}

const stall = townProps("market-stall").map((prop) => {
  const f = townFrame(prop, 70);
  return [townSpriteId(prop.id), {
    w: f.w, h: f.h, anchor: f.anchor, foot: townFoot(prop), shadow: { rx: Math.round(f.w / 2) - 4, ry: 6, dy: -12 },
    /**
     * Auntie Xu's vegetable and fruit stall, twenty years on this corner; Lin Jie from upstairs minds it
     * in the mornings (the `market-tender` hook stands at its front left). The table is a shikumen door
     * from a house pulled down on Jianguo Road, laid on two trestles and skirted with blue calico; the
     * tarp has been patched once and pools rain in the middle. Bok choy, a winter melon in cling film,
     * eggplants and garlic, two crates of oranges behind, a steelyard she trusts more than the
     * electronic scale, the QR card on the corner, and her low jade stool with a jar of cold tea.
     */
    draw: (p: Px) => {
      const W = f.w, G = f.gy;
      const tableX = 8, tableW = 70, topY = G - 48, frontY = G - 28, feetY = G - 9;
      // Back poles, mostly hidden.
      upright(p, 6, 26, G - 30);
      upright(p, W - 8, 26, G - 30);
      // Two jade crates stacked behind the table, the top one heaped with oranges.
      plasticCrate(p, 48, G - 40, 28, 5, 12, JADE);
      const well = plasticCrate(p, 47, G - 57, 28, 5, 12, JADE);
      orangeHeap(p, well.wellX + well.wellW / 2, well.wellY - 1, 12, 3, 4);
      // The table top: the old door, a rosewood lacquer worn through to wood, its panel moulding.
      p.rect(tableX, topY, tableW, frontY - topY, "rose3");
      p.hline(tableX, topY, tableW, "rose4");
      p.frame(tableX + 4, topY + 3, 28, frontY - topY - 6, "rose2");
      p.frame(tableX + 38, topY + 3, 28, frontY - topY - 6, "rose2");
      p.over(() => {
        for (const [gx, gy, n] of [[12, 3, 9], [40, 9, 12], [20, 13, 6], [55, 5, 8]] as const) p.hline(tableX + gx, topY + gy, n, "wood4");
        p.rect(tableX + 60, topY + 12, 6, 4, "wood3");
      });
      // The front edge of the door, then the calico skirt pinned along it.
      p.rect(tableX, frontY - 2, tableW, 2, "rose2").hline(tableX, frontY - 2, tableW, "rose4");
      const skirt = Array.from({ length: feetY - frontY }, (_, j) => {
        const row = "#".repeat(tableW);
        return j === feetY - frontY - 1 ? row.split("").map((c, i) => (i % 6 === 5 ? "." : c)).join("") : row;
      });
      cloth(p, tableX, frontY, skirt, {
        ramp: ["blue1", "blue2", "blue2", "blue3"],
        print: printMotif([".w.", "w.w", ".w."], { w: "blue5" }, 8, 6),
      }, [9, 21, 33, 46, 58]);
      // Pins along the top of the skirt.
      for (let x = tableX + 4; x < tableX + tableW; x += 11) p.px(x, frontY, "steel5");
      // Trestle feet below the skirt.
      // Trestle legs splayed below the skirt, a cross-brace between them, a brick under the short one.
      for (const x of [tableX + 4, tableX + tableW - 7]) {
        p.line(x, feetY, x - 2, G, "wood3").line(x + 1, feetY, x - 1, G, "wood4");
        p.line(x + 2, feetY, x + 4, G, "wood2").line(x + 3, feetY, x + 5, G, "wood3");
      }
      p.hline(tableX + 6, G - 4, tableW - 12, "wood3").hline(tableX + 6, G - 3, tableW - 12, "wood2");
      art(p, tableX + tableW - 11, G - 2, ["rrrrrrr", "RRRRRRR"], { r: "rose3", R: "rose2" });

      // Produce, back to front.
      winterMelon(p, tableX + 1, topY - 4);
      tray(p, tableX + 38, topY + 4, 11, 4);
      eggplant(p, tableX + 29, topY);
      eggplant(p, tableX + 33, topY + 3);
      eggplant(p, tableX + 28, topY + 5);
      for (const [dx, dy] of [[52, 5], [56, 4], [54, 8], [59, 7]] as const) garlic(p, tableX + dx - 8, topY + dy - 2);
      // A blue plastic basket of loose oranges at the front right.
      const bk = basket(p, tableX + 47, topY + 6, 20, 6, 8, { taper: 2, ramp: BLUE });
      orangeHeap(p, bk.cx, bk.cy - 2, 8, 2.2, 9);
      bk.front();
      // The bamboo basket of bok choy at the front left.
      const bc = basket(p, tableX + 2, topY + 8, 26, 7, 8, { taper: 2 });
      for (const [dx, dy, flip] of [[5, -14, true], [11, -15, false], [2, -8, false], [8, -10, true], [14, -9, false], [5, -5, true], [12, -6, false], [17, -5, true]] as const)
        bokChoy(p, tableX + 2 + dx, topY + 8 + dy, flip);
      bc.front();
      ginger(p, tableX + 31, topY + 13);
      // A blank price card on a bamboo skewer stuck in the bok choy.
      p.vline(tableX + 24, topY - 6, 8, "bamboo3");
      art(p, tableX + 21, topY - 11, ["cccccc", "cCCCCc", "cCCCCc", "dddddd"], { c: "oak5", C: "cream4", d: "oak3" });
      qrCard(p, tableX + tableW - 10, topY + 6);

      // Front poles.
      upright(p, 2, 34, G);
      upright(p, W - 4, 34, G);
      canopy(p, W, 4, 26, 6);
      // A bundle of thin white bags hooked on the left pole.
      art(p, 4, 46, [
        "s....",
        "ws...",
        "wWw..",
        "wWww.",
        "wWwwc",
        "wwWwc",
        ".wWcc",
        ".wwc.",
        "..c..",
      ], { s: "steel3", w: "cream5", W: "white", c: "cream3" });
      steelyard(p, 46, 33);
      // A bare bulb on a looped flex for the dark winter mornings, and a plait of garlic, hung from the front bar.
      art(p, 26, 32, [
        "kk...",
        "..k..",
        "..k..",
        ".k...",
        ".k...",
        "..k..",
        ".sss.",
        ".sSs.",
        "wwWww",
        "wWgWw",
        "wwgwc",
        ".wwc.",
        "..c..",
      ], { k: "ink2", s: "steel3", S: "steel5", w: "cream5", W: "white", g: "gold4", c: "cream3" });
      p.vline(15, 32, 4, "bamboo3");
      for (let k = 0; k < 4; k++) { garlic(p, 13 + (k % 2) * 2, 35 + k * 4); p.px(15 - (k % 2), 39 + k * 4, "bamboo3"); }
      lowStool(p, W - 22, G - 17);
      // Outer leaves trimmed off the bok choy, dropped by the trestle.
      art(p, tableX + 18, G - 2, [".23.", "2343"], { "2": "leaf2", "3": "leaf3", "4": "leaf4" });
      autoOutline(p, { map: { cream: "ink2", white: "ink2", bamboo: "wood1", orange: "brown1", steel: "steel1" } });
    },
  }] as const;
});

// ── baskets on the bricks ──────────────────────────────────────────────────────

const baskets = townProps("baskets").map((prop) => {
  const f = townFrame(prop, 28);
  return [townSpriteId(prop.id), {
    w: f.w, h: f.h, anchor: f.anchor, foot: townFoot(prop), shadow: { rx: Math.round(f.w / 2) - 2, ry: 4, dy: -4 },
    /**
     * What Auntie Xu sets out on the bricks: her husband's back-basket (背篓) bristling with leeks, its
     * shoulder strap mended with blue nylon cord; a round basket of brown eggs in straw, one of them
     * cracked and set aside on top; and a sieve of dried shiitake drying on an upturned blue crate.
     */
    draw: (p: Px) => {
      const G = f.gy;
      // The back-basket: tall, flaring to the rim, leeks standing up out of it.
      for (const [x, top, lean] of [[4, 4, -2], [6, 1, 0], [8, 3, 1], [10, 0, 2], [12, 5, 3], [7, 6, -1]] as const)
        scallion(p, x, G - 26, top, lean, true);
      const bb = basket(p, 1, G - 32, 18, 6, 29, { taper: 3 });
      // Leek whites and a few more tops in front of the far rim.
      for (const x of [5, 9, 13]) p.vline(x, bb.top - 4, 4, "cream4").px(x + 1, bb.top - 4, "cream3");
      bb.front();
      // A woven band round its middle and the mended strap looping off its side.
      p.over(() => { p.hline(2, G - 16, 16, "bamboo2"); p.hline(2, G - 15, 16, "bamboo4"); });
      art(p, 17, G - 26, ["b.", ".b", ".b", "B.", "B."], { b: "bamboo2", B: "blue3" });

      // The egg basket.
      const eb = basket(p, 20, G - 14, 22, 7, 11, { taper: 2 });
      art(p, 22, eb.top - 2, ["s.s..s..s..s.s", ".s.ss.ss.ss.s."], { s: "bamboo4" });
      for (let i = 0; i < 5; i++) egg(p, 24 + i * 3, eb.top - 5 + (i % 2), i % 3 === 1);
      for (let i = 0; i < 6; i++) egg(p, 22 + i * 3, eb.top - 2 + (i % 2), i % 2 === 0);
      for (let i = 0; i < 3; i++) egg(p, 27 + i * 3, eb.top - 8 + (i % 2), i === 1);
      eb.front();
      // The cracked one, set on top: a zigzag hairline.
      egg(p, 37, eb.top - 9);
      p.px(38, eb.top - 8, "oak2").px(39, eb.top - 7, "oak2");

      // An upturned blue crate, and on it the sieve of shiitake.
      plasticCrate(p, 42, G - 13, 21, 3, 10, BLUE);
      tray(p, 52.5, G - 15, 10.5, 3.5);
      const caps: [number, number][] = [[45, -17], [49, -18], [53, -17], [57, -18], [47, -15], [51, -15], [55, -15], [59, -16]];
      for (const [x, dy] of caps) {
        art(p, x, G + dy, [".bb.", "bBcb", "bbbb"], { b: "brown2", B: "brown3", c: "cream3" });
      }
      autoOutline(p, { map: { cream: "ink2", bamboo: "wood1", brown: "brown1" } });
    },
  }] as const;
});

export default defineSprites(Object.fromEntries([...stall, ...baskets]));
