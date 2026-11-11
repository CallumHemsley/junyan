/**
 * Small single props: the stone xiangqi table on the tea terrace, the bookshop's delivery ledge and
 * the shopping bag left on the junction bench. One sprite per map instance, footprint-sized.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { STONE, art, autoOutline, drumStool, scallion, townFoot, townFrame } from "./_helpers.ts";

/** One xiangqi piece, 4×3. */
function piece(p: Px, x: number, y: number, side: "red" | "black"): void {
  // A turned wooden disc seen from above: pale rim, the coloured inlay where the character would be.
  art(p, x, y, [".WW.", "WccW", ".ee."], { W: "oak5", c: side === "red" ? "red3" : "ink", e: "oak2" });
}

function stoneTable(prop: MapProp) {
  const f = townFrame(prop, 22);
  return {
    w: f.w, h: f.h, anchor: f.anchor, foot: townFoot(prop), shadow: { rx: Math.round(f.w / 2) - 2, ry: 7, dy: -9 },
    /**
     * The granite table on the tea terrace where Old Gu and Old Qian have played xiangqi every morning
     * since the eighties. The board is cut into the top; a frost crack across it was stapled with
     * iron by the stonemason in 1991. Today's game is left mid-play while they fetch more tea: a
     * glass of it sits by the river, and Old Gu's palm fan lies on the near edge.
     * Three drum stools; the right one is a concrete replacement, greyer and plainer.
     */
    draw: (p: Px) => {
      const G = f.gy, cx = Math.round(f.w / 2);
      const CONCRETE = ["steel1", "steel2", "steel3", "steel4", "stone4"] as const;
      // Side stools, at the table's depth, half under its rim.
      drumStool(p, 0, G - 29, 13, 13, STONE, 3);
      drumStool(p, f.w - 13, G - 29, 13, 13, CONCRETE, 5);
      // Pedestal: a stout column on a square plinth.
      p.rect(cx - 9, G - 22, 18, 4, "stone2").hline(cx - 9, G - 22, 18, "stone4").vline(cx + 8, G - 22, 4, "stone1");
      p.rect(cx - 6, G - 33, 12, 11, "stone3");
      p.rect(cx - 6, G - 33, 3, 11, "stone4").rect(cx + 2, G - 33, 4, 11, "stone2").vline(cx + 5, G - 33, 11, "stone1");
      p.hline(cx - 6, G - 33, 12, "stone1");
      // The slab: a thick front edge, then the top, lit from the upper left.
      const rx = 19, ry = 10, ty = G - 54;
      const cy = ty + ry;
      p.ellipse(cx, cy + 3, rx, ry, "stone2");
      p.ellipse(cx, cy + 2, rx, ry, "stone3");
      p.ellipse(cx, cy, rx, ry, "stone4");
      p.ellipse(cx - 1, cy - 1, rx - 2, ry - 1.5, "stone5");
      p.over(() => p.speckle(cx - rx, ty, rx * 2, ry * 2 + 3, "stone3", 0.05, 11));
      // The board cut into the top, shallow and worn: a frame, two files, two ranks, the river and the
      // two palaces' crossed diagonals. Abstract at this size, but a xiangqi player would know it.
      const bx = cx - 10, by = cy - 8;
      p.frame(bx, by, 21, 17, "stone3");
      for (const x of [bx + 5, bx + 15]) { p.vline(x, by, 7, "stone4"); p.vline(x, by + 10, 7, "stone4"); }
      for (const y of [by + 3, by + 13]) p.hline(bx + 1, y, 19, "stone4");
      p.hline(bx, by + 7, 21, "stone3").hline(bx, by + 9, 21, "stone3");
      p.line(bx + 7, by, bx + 13, by + 3, "stone3").line(bx + 13, by, bx + 7, by + 3, "stone3");
      p.line(bx + 7, by + 13, bx + 13, by + 16, "stone3").line(bx + 13, by + 13, bx + 7, by + 16, "stone3");
      // The frost crack and its iron staples.
      p.line(cx + 9, ty + 1, cx + 15, ty + 17, "stone2");
      for (const [dx, dy] of [[10, 5], [12, 10], [14, 14]] as const) art(p, cx + dx - 1, ty + dy, ["kk"], { k: "steel2" });
      // The game in progress: a few pieces either side of the river, one crossed over.
      for (const [dx, dy, side] of [[10, 0, "black"], [0, 3, "black"], [15, 3, "black"], [5, 10, "black"], [10, 16, "red"], [5, 13, "red"], [20, 13, "red"], [15, 6, "red"]] as const)
        piece(p, bx + dx - 2, by + dy - 1, side);
      // A glass of tea by the river and the palm-leaf fan lying flat.
      art(p, cx + 12, cy - 7, [".bbb.", "b666b", "bgggb", "bgGgb", "bLLLb", ".bbb."], { b: "blue5", "6": "blue6", g: "gold3", G: "gold4", L: "bamboo3" });
      art(p, cx - 4, cy + 7, [
        "..bbBBb.....",
        ".bBbBbBb....",
        ".bbBbBbbhh..",
        "..bbbbb...hh",
      ], { b: "bamboo3", B: "bamboo4", h: "wood3" });
      // A third stool at the front left, in front of everything.
      drumStool(p, 3, G - 13, 13, 13, STONE, 7);
      autoOutline(p, { map: { stone: "stone1", steel: "steel1", oak: "wood1", bamboo: "wood1", blue: "blue1", wood: "wood1" } });
    },
  };
}

function deliveryLedge(prop: MapProp) {
  const f = townFrame(prop, 22);
  return {
    w: f.w, h: f.h, anchor: f.anchor, foot: townFoot(prop), shadow: { rx: Math.round(f.w / 2) - 1, ry: 3, dy: -2 },
    /**
     * The granite ledge under the bookshop's shutter where couriers leave what comes before opening:
     * this morning a brown-paper parcel tied with string, its blank slip tucked under the knot, and a
     * strapped bundle of returned magazines. The ledge's lip is worn round where people sit.
     */
    draw: (p: Px) => {
      const G = f.gy, W = f.w;
      // The ledge: a lit granite top with a rounded lip worn into a dip where people sit, a face of two
      // dressed blocks, a damp dark band at the foot where the pavement is washed.
      p.rect(0, G - 13, W, 4, "stone4").hline(0, G - 13, W, "stone5").hline(0, G - 10, W, "stone3");
      p.rect(0, G - 9, W, 10, "stone3");
      p.hline(0, G - 9, W, "stone2").hline(0, G - 1, W, "stone2").hline(0, G, W, "stone1").vline(W - 1, G - 13, 14, "stone2");
      p.vline(17, G - 8, 7, "stone2").vline(18, G - 8, 7, "stone4");
      p.over(() => {
        p.hline(13, G - 13, 8, "stone4").hline(14, G - 12, 6, "stone5");
        p.speckle(0, G - 8, W, 6, "stone2", 0.06, 4);
        p.speckle(0, G - 8, W, 6, "stone4", 0.05, 9);
        p.line(28, G - 8, 31, G - 3, "stone2");
        p.hline(0, G - 2, W, "stone2");
      });
      // The magazines, strapped with white plastic tape, spines out.
      const mx = 22;
      for (let i = 0; i < 4; i++) {
        const y = G - 16 - i * 2, c = (["blue3", "cream4", "jade3", "plum3"] as const)[i];
        p.hline(mx + (i % 2), y, 13, c).hline(mx + (i % 2), y + 1, 13, "cream3");
      }
      p.hline(mx + 1, G - 22, 12, "cream5");
      p.vline(mx + 4, G - 22, 8, "white").vline(mx + 10, G - 22, 8, "white");
      // The parcel: brown paper, lit top, string crossed and knotted, the slip under the knot.
      const px = 3, py = G - 23;
      p.rect(px, py, 16, 4, "oak4").hline(px, py, 16, "oak5");
      p.rect(px, py + 4, 16, 6, "oak3").hline(px, py + 9, 16, "oak2").vline(px + 15, py + 4, 6, "oak2");
      p.over(() => { p.hline(px + 2, py + 6, 5, "oak2"); p.px(px + 12, py + 1, "oak3"); });
      p.vline(px + 8, py, 10, "cream3").hline(px, py + 2, 16, "cream3").hline(px, py + 6, 16, "cream3");
      art(p, px + 4, py - 1, ["sss.", "sSSs", "sss."], { s: "cream4", S: "white" });
      art(p, px + 7, py + 1, ["k.k", ".k."], { k: "cream2" });
      autoOutline(p, { map: { stone: "stone1", oak: "wood1", cream: "ink2", white: "ink2" } });
    },
  };
}

function restBag(prop: MapProp) {
  const f = townFrame(prop, 18);
  return {
    w: f.w, h: f.h, anchor: f.anchor, shadow: { rx: 6, ry: 2, dy: -12 },
    /**
     * Grandma Fang's woven shopping bag, set on the junction bench while she rests: blue-and-white
     * striped nylon gone soft with years, scallions and a rolled newspaper poking out of the top.
     * It sits on the bench seat, so its base is lifted about thirteen pixels above the ground row.
     */
    draw: (p: Px) => {
      const base = f.gy - 13;
      for (const [x, lean, top] of [[4, -2, 1], [6, -1, 0], [7, 1, 2]] as const) scallion(p, x, base - 7, top, lean);
      // The newspaper roll, blank, leaning right.
      art(p, 9, 0, ["..cc", ".cCc", ".cCc", "cCc.", "cCc.", "cc.."], { c: "cream3", C: "cream5" });
      art(p, 1, base - 10, [
        "..h......h...",
        ".h........h..",
        ".h........h..",
        "bwbwbwbwbwbw.",
        "BbWbWbWbWbwBb",
        "bwbwbwbwbwbwB",
        "BbWbWbWbWbwBb",
        "bwbwbwbwbwbwB",
        "BbWbWbWbwbwBb",
        ".BBBBBBBBBBB.",
      ], { h: "blue2", b: "blue3", B: "blue2", w: "blue6", W: "white" });
      autoOutline(p, { map: { blue: "blue1", cream: "ink2", white: "blue1" } });
    },
  };
}

export default defineSprites(Object.fromEntries([
  ...mapProps("all", "stone-table").map((p) => [propSpriteId(p.map, p.id), stoneTable(p)]),
  ...mapProps("all", "delivery-ledge").map((p) => [propSpriteId(p.map, p.id), deliveryLedge(p)]),
  ...mapProps("all", "rest-bag").map((p) => [propSpriteId(p.map, p.id), restBag(p)]),
]));
