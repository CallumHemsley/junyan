/**
 * The dining tables. Four tables for the four places in the room, each a different table with its
 * own history, plus a two-seater and a round family table. Every anchor is the front edge of the
 * front legs on the floor; each doc comment gives the clear plate area on the top.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { boards, bowtie, each, grid, oval, ovalHalves, peg, ROSE, roundCorners, squareLeg, TEA, topEdges } from "./_helpers.ts";

const STEEL = { "1": "steel1", "2": "steel2", "3": "steel3", "4": "steel4", "5": "steel5", "6": "steel6" } as const;

/** One step lighter or darker for a colour inside a ramp, used to light patterned surfaces. */
const LIGHTER: Partial<Record<Color, Color>> = {
  cream4: "cream5", cream5: "white", gold2: "gold3", gold3: "gold4", gold4: "gold5", jade5: "jade6", jade4: "jade5", jade6: "white",
  steel4: "steel5", steel5: "steel6", blue4: "blue5", blue3: "blue4", rose2: "rose3", rose3: "rose4", rose4: "wood5",
};
const DARKER: Partial<Record<Color, Color>> = {
  white: "cream5", cream5: "cream4", cream4: "cream3", cream3: "cream2", gold5: "gold4", gold4: "gold3", gold3: "gold2", gold2: "gold1",
  jade6: "jade5", jade5: "jade4", jade4: "jade3", blue4: "blue3", blue5: "blue4", rose4: "rose3", rose3: "rose2", rose2: "rose1",
  steel6: "steel5", steel5: "steel4",
};

export default defineSprites({
  /**
   * Table 1. The owner's father's tea-wood table, older than the shop: boards running front to
   * back between pegged breadboard ends, a split mended with a pale butterfly key, two tea rings
   * from the same pot, a drawer stuffed with receipts that no longer shuts, and a split front leg
   * bound with wire. Plates: x 10–52, y 4–28.
   */
  "furn/table-1": {
    w: 64, h: 57, anchor: [32, 55], foot: [-30, -26, 60, 24], shadow: { rx: 33, ry: 9, dy: -2 },
    draw: (p) => {
      p.rect(3, 1, 58, 1, "wood5").rect(2, 2, 60, 1, "wood4").rect(1, 3, 62, 30, "wood4");
      boards(p, 8, 1, 48, 32, { dir: "v", seams: [12, 24, 36], seed: 11, flush: [20, -99, 8], density: 1.2 });
      boards(p, 1, 1, 6, 32, { dir: "h", seams: [], seed: 12, density: 3 });
      boards(p, 57, 1, 6, 32, { dir: "h", seams: [], seed: 13, density: 3 });
      // Grooves where the breadboard ends meet the boards, the lit lip beyond them.
      p.over(() => p.vline(7, 2, 31, "wood3").vline(8, 3, 29, "wood5").vline(56, 2, 31, "wood3").vline(57, 3, 29, "wood5"));
      topEdges(p, 1, 1, 62, 32);
      for (const y of [5, 15, 26]) { peg(p, 3, y); peg(p, 59, y); }
      p.over(() => {
        // Two tea rings from the same pot, a week apart.
        grid(p, 41, 6, 11, [
          "...rrrr....",
          ".rr....r...",
          "r...rrrrr..",
          "r..r...r.rr",
          ".rr.....r.r",
          "...r....r.r",
          "....rr..r..",
          "......rr...",
        ], { r: "wood3" });
        // Pale patch rubbed by elbows along the front, and chopstick-tip dents.
        for (const [x, y, n] of [[16, 27, 9], [14, 28, 14], [38, 27, 10], [36, 28, 13], [17, 29, 6]] as const) p.hline(x, y, n, "wood5");
        for (const [x, y] of [[12, 10], [14, 11], [47, 22], [49, 21]] as const) p.px(x, y, "wood3");
      });
      // A split running back from the front edge, held by a butterfly key.
      grid(p, 25, 18, 3, ["2..", "2..", ".2.", ".2.", ".2.", "..2", ".2.", ".2.", ".2.", "2..", "2..", ".2.", ".2.", ".2.", ".2."], { "2": "wood2" });
      bowtie(p, 21, 24);
      // The edge of the top catches the light, then turns under; a nick where a chair back hit it.
      p.hline(1, 33, 62, "wood5").rect(1, 34, 62, 2, "wood3").hline(1, 36, 62, "wood2");
      p.rows(47, 33, ["3333", ".44."], { "3": "wood3", "4": "wood4" });
      // Apron, and the drawer that will not shut: its box shows above the front, receipts poke out.
      p.rect(5, 37, 54, 7, "wood2").hline(5, 37, 54, "wood1").hline(5, 43, 54, "wood1");
      p.rect(20, 38, 24, 1, "wood1");
      p.rect(20, 39, 24, 7, "wood3").hline(20, 39, 24, "wood5").hline(20, 40, 24, "wood4").vline(20, 40, 5, "wood4").vline(43, 40, 6, "wood2").hline(21, 45, 23, "wood2");
      p.over(() => p.hline(23, 42, 7, "wood4").hline(34, 43, 6, "wood2"));
      grid(p, 33, 35, 6, ["...cc.", "..cccC", ".ccCC.", "cCC.c.", "...cC."], { c: "cream5", C: "cream3" });
      // Brass bail pull hanging from two posts.
      grid(p, 28, 40, 7, ["g.....g", "G.....G", ".g...g.", "..ggg.."], { g: "gold3", G: "gold1" });
      p.px(28, 40, "gold5").px(30, 42, "gold4");
      // Front legs.
      squareLeg(p, 3, 37, 7, 18);
      squareLeg(p, 54, 37, 7, 18);
      // The right leg split up the grain and bound with two wraps of wire.
      grid(p, 55, 39, 3, ["..1", "..1", ".1.", ".1.", ".1.", "1..", "1..", ".1.", ".1.", ".1.", "..1", "..1"], { "1": "wood1" });
      for (const y of [42, 48]) grid(p, 53, y, 9, ["456665432", "233333321"], STEEL);
      p.rows(58, 41, ["6", "4"], STEEL);
      p.outline("wood1");
    },
  },

  /**
   * Table 2. A cheap round-cornered table under sunflower-yellow gingham oilcloth that the owner's
   * wife wipes forty times a morning. A regular's cigarette burn, a fold crease from the shop it
   * came from, and the torn front corner patched with yellowed tape. Plates: x 8–56, y 5–28.
   */
  "furn/table-2": {
    w: 64, h: 57, anchor: [32, 55], foot: [-30, -26, 60, 24], shadow: { rx: 33, ry: 9, dy: -2 },
    draw: (p) => {
      // Plain tapered legs under the cloth.
      for (const [x, flip] of [[7, false], [51, true]] as const) {
        grid(p, x, 40, 6, [
          "222222", "332222", "443322", "44332.", ".4332.", ".4332.", ".4332.", ".4332.", ".4332.", ".4332.", ".4322.", ".3322.", ".2222.", ".2222.", ".3332.",
        ].map((r) => (flip ? r : r)), { "4": "wood4", "3": "wood3", "2": "wood2" });
      }
      // The top, then the cloth hanging over its front edge.
      const gingham = (x: number, y: number, face: boolean) => {
        const col = ((x + 1) % 8) < 4, row = face ? ((y - 33) % 6) < 3 : ((y + 1) % 6) < 3;
        const c: Color = col && row ? "gold3" : col || row ? "gold4" : "cream5";
        if (!face) return c;
        const d = DARKER[c] ?? c;
        return y > 34 ? (DARKER[d] ?? d) : d;
      };
      each(1, 1, 62, 32, (x, y) => p.px(x, y, gingham(x, y, false)));
      roundCorners(p, 1, 1, 62, 32, 4, "tl tr");
      // Hem: the cloth drops 7px down the front, dipping into soft folds at the corners.
      each(0, 33, 64, 9, (x, y) => {
        const dip = x < 7 ? Math.max(0, 3 - Math.floor(x / 2)) : x > 56 ? Math.max(0, 3 - Math.floor((63 - x) / 2)) : 0;
        if (y < 40 + dip) p.px(x, y, gingham(x, y, true));
      });
      // Pinked hem: a zigzag bottom edge.
      for (let x = 0; x < 64; x++) {
        const dip = x < 7 ? Math.max(0, 3 - Math.floor(x / 2)) : x > 56 ? Math.max(0, 3 - Math.floor((63 - x) / 2)) : 0;
        if (x % 2 === 0) p.px(x, 40 + dip, "cream3");
        else p.px(x, 39 + dip, null);
      }
      // The front edge of the table under the cloth catches the light; folds fall from the corners.
      each(1, 33, 62, 1, (x, y) => p.px(x, y, LIGHTER[p.get(x, y)!] ?? "white"));
      p.over(() => {
        for (const [x, y, n] of [[2, 34, 5], [4, 36, 4], [58, 34, 4], [57, 36, 5]] as const) for (let i = 0; i < n; i++) p.px(x + i, y + Math.floor(i / 2), DARKER[p.get(x + i, y + Math.floor(i / 2))!] ?? "cream3");
      });
      // Gloss: the window's reflection slides across the oilcloth.
      each(6, 3, 30, 14, (x, y) => {
        const u = x - 6 + (y - 3) * 0.9;
        if (u > 3 && u < 7) { const c = p.get(x, y); if (c && LIGHTER[c]) p.px(x, y, LIGHTER[c]!); }
      });
      // Right side and front edge of the top in shade.
      each(60, 3, 3, 30, (x, y) => { const c = p.get(x, y); if (c && x - 60 >= (y < 6 ? 0 : 1) && DARKER[c]) p.px(x, y, DARKER[c]!); });
      // The old fold crease across the middle.
      each(3, 17, 58, 1, (x, y) => { const c = p.get(x, y); if (c && LIGHTER[c]) p.px(x, y, LIGHTER[c]!); });
      each(3, 18, 58, 1, (x, y) => { const c = p.get(x, y); if (c && DARKER[c] && x % 5) p.px(x, y, DARKER[c]!); });
      // The cigarette burn: a melted hole with a scorched halo.
      grid(p, 44, 21, 6, ["..bb..", ".bkkb.", "bkKKkb", ".bkkb.", "..bo.."], { b: "gold2", k: "brown2", K: "brown1", o: "orange1" });
      // The torn corner, and the tape over it, yellowed and lifting at one end.
      grid(p, 3, 26, 8, ["......4.", ".....43.", "....4...", "...43...", "..4.....", ".43.....", "4......."], { "4": "wood4", "3": "wood3" });
      p.faded(0.5, () => p.rect(2, 27, 11, 4, "cream5"));
      p.faded(0.85, () => p.hline(2, 27, 11, "white").hline(2, 30, 10, "cream3"));
      p.px(12, 30, "cream4").px(13, 31, "white");
      p.outline("wood1");
    },
  },

  /**
   * Table 3. A 1980s mint formica table with chrome edging and tubular legs, bought second-hand
   * when the shop opened. A pale ring where somebody set down a hot pot, a chip at the front where
   * the laminate broke off to show the chipboard, a dent in the chrome, and one leg that lost its
   * rubber foot. Plates: x 6–58, y 4–28.
   */
  "furn/table-3": {
    w: 64, h: 57, anchor: [32, 55], foot: [-30, -26, 60, 24], shadow: { rx: 33, ry: 9, dy: -2 },
    draw: (p) => {
      // Tubular legs: chrome that picks up the warm floor near the bottom.
      for (const [x, capped] of [[7, true], [52, false]] as const) {
        grid(p, x, 36, 5, Array<string>(17).fill("45632"), STEEL);
        p.over(() => p.vline(x + 2, 46, 4, "oak5").vline(x + 3, 47, 3, "oak3"));
        if (capped) grid(p, x - 1, 51, 7, [".22222.", "1222221", "1111111", "1111111"], STEEL);
        else grid(p, x, 51, 5, ["45632", "45632", "35532", "22221"], STEEL);
      }
      // A steel rail under the top.
      p.rect(4, 36, 56, 3, "steel3").hline(4, 36, 56, "steel1").hline(4, 38, 56, "steel2");
      // The formica top: mint, with the classic scatter of little boomerangs and dashes.
      p.rect(1, 1, 62, 31, "jade6");
      roundCorners(p, 1, 1, 62, 31, 3, "tl tr");
      each(1, 1, 62, 31, (x, y) => {
        const gx = Math.floor((x + (Math.floor(y / 6) % 2) * 5) / 10), gy = Math.floor(y / 6);
        const lx = (x + (Math.floor(y / 6) % 2) * 5) % 10, ly = y % 6;
        const kind = (gx * 7 + gy * 3) % 4;
        if (kind === 0 && ((lx === 3 && ly === 2) || (lx === 4 && ly === 2) || (lx === 5 && ly === 3))) p.px(x, y, "jade4");
        if (kind === 1 && ly === 3 && (lx === 5 || lx === 6)) p.px(x, y, "blue4");
        if (kind === 2 && ((lx === 2 && ly === 3) || (lx === 3 && ly === 2) || (lx === 4 && ly === 3))) p.px(x, y, "jade5");
        if (kind === 3 && ly === 2 && lx === 6) p.px(x, y, "gold3").px(x + 1, y, "gold3");
      });
      // The window's reflection in the laminate: two panes and a glazing bar.
      each(5, 3, 26, 12, (x, y) => {
        const u = x - 5 - (y - 3) * 0.6;
        if (u >= 1 && u < 18 && Math.abs(u - 9) > 1 && y !== 8) { const c = p.get(x, y); if (c && LIGHTER[c]) p.px(x, y, LIGHTER[c]!); }
      });
      // Shade at the right, and the side rim of chrome.
      each(59, 2, 3, 30, (x, y) => { const c = p.get(x, y); if (c && x - 59 >= 1 && DARKER[c]) p.px(x, y, DARKER[c]!); });
      p.vline(1, 4, 27, "steel6").vline(62, 4, 27, "steel4").hline(4, 1, 56, "steel6");
      // The heat ring.
      p.over(() => grid(p, 14, 15, 10, ["..wwwwww..", ".w......w.", "w........w", ".w......w.", "..wwwwww.."], { w: "white" }));
      // Chip at the front: chipboard showing through.
      grid(p, 39, 28, 7, [".44444.", "4o3oo34", "o3oo3o3", "3oo3oo3"], { "4": "jade4", o: "oak3", "3": "oak2" });
      // Chrome edge band, mirroring the room: a window glint, dark chair legs, the warm floor.
      p.hline(1, 32, 62, "steel6").hline(1, 33, 62, "steel5").hline(1, 34, 62, "steel4").hline(1, 35, 62, "steel2");
      p.hline(4, 33, 10, "white").hline(20, 33, 3, "steel2").hline(20, 34, 3, "steel1").hline(44, 33, 2, "steel2").hline(44, 34, 2, "steel1");
      p.hline(28, 34, 12, "oak4").hline(30, 34, 6, "oak5");
      // The dent.
      p.rows(13, 32, ["6.4", "36.", ".3."], STEEL);
      p.px(14, 32, "steel4");
      p.outline("steel1");
    },
  },

  /**
   * Table 4. A heavy rosewood table with a waisted top, carved cloud-scroll aprons and
   * horse-hoof feet, from the owner's aunt's house in the old town and far too grand for the shop.
   * Brass corner caps, the lacquer polished to a mirror at the back and worn through to honey wood
   * where elbows rest, and the left spandrel snapped off once and glued back a pixel crooked.
   * Plates: x 6–58, y 4–27.
   */
  "furn/table-4": {
    w: 64, h: 57, anchor: [32, 55], foot: [-30, -26, 60, 24], shadow: { rx: 33, ry: 9, dy: -2 },
    draw: (p) => {
      // Thick legs ending in hoof feet that kick inward.
      for (const [x, inward] of [[2, 1], [53, -1]] as const) {
        p.rect(x, 35, 9, 15, "rose2").vline(x, 36, 13, "rose3").vline(x + 1, 36, 13, "rose3").vline(x + 2, 37, 10, "rose4").rect(x + 7, 35, 2, 15, "rose1");
        const fx = x + inward * 2;
        p.rect(fx, 50, 9, 5, "rose2").hline(fx, 50, 9, "rose3").hline(fx + 1, 51, 6, "rose4").hline(fx, 54, 9, "rose1");
        p.vline(inward > 0 ? fx + 8 : fx, 51, 3, "rose1");
      }
      // Top slab, polished.
      p.rect(3, 1, 58, 1, "rose4").rect(2, 2, 60, 1, "rose3").rect(1, 3, 62, 27, "rose3");
      boards(p, 1, 1, 62, 30, { dir: "h", seams: [10, 20], seed: 41, t: ROSE, density: 0.8 });
      topEdges(p, 1, 1, 62, 30, ROSE);
      // The lattice window mirrored in the lacquer.
      each(5, 3, 30, 13, (x, y) => {
        const u = x - 5 - (y - 3) * 0.5;
        if (u >= 1 && u < 20 && Math.abs(u - 10) > 0 && y !== 9 && (u < 5 || u > 6)) { const c = p.get(x, y); if (c && LIGHTER[c]) p.px(x, y, LIGHTER[c]!); }
      });
      // Lacquer worn through to honey wood along the front.
      p.over(() => {
        for (const [x, y, n] of [[14, 28, 8], [12, 29, 12], [39, 28, 6], [37, 29, 10]] as const) p.hline(x, y, n, "wood4");
        p.hline(15, 29, 5, "wood5").hline(39, 29, 4, "wood5");
      });
      // Brass corner caps.
      for (const [x, flip] of [[1, false], [56, true]] as const) {
        grid(p, x, 27, 7, (flip ? ["....g5g", "....g4g", "...gg4g", "g5444Gg"] : ["g5g....", "g4g....", "g4gg...", "g4444Gg"]), { g: "gold2", "5": "gold5", "4": "gold4", G: "gold3" });
      }
      // Moulded edge, then the recessed waist.
      p.hline(1, 31, 62, "rose4").hline(1, 32, 62, "rose3").hline(1, 33, 62, "rose2").hline(1, 34, 62, "rose1");
      p.hline(2, 31, 30, "wood4");
      p.rect(4, 35, 56, 3, "rose2").hline(4, 35, 56, "rose1").hline(6, 36, 50, "rose3");
      // Apron with a shaped lower edge: spandrels curving into the legs, a cloud scroll at the centre.
      const depth = (x: number) => {
        const fromLeg = Math.min(x - 11, 52 - x);
        const spandrel = fromLeg < 7 ? [6, 5, 4, 3, 2, 1, 1][fromLeg] : 0;
        const c = Math.abs(x - 31.5);
        const pendant = c < 5 ? [4, 4, 3, 2, 1][Math.floor(c)] : 0;
        return 5 + Math.max(spandrel, pendant);
      };
      for (let x = 11; x < 53; x++) {
        const bottom = 38 + depth(x);
        p.vline(x, 38, bottom - 38, "rose3").px(x, 38, "rose4").px(x, bottom - 1, "rose2");
        // An incised line two pixels inside the edge, lit on its lower lip.
        p.px(x, bottom - 3, "rose1").px(x, bottom - 2, "rose4");
      }
      grid(p, 27, 40, 10, ["..rrrrrr..", ".r......r.", "r..rrr...r", "r.r...r..r", ".r..r.r.r.", "....rr..r."], { r: "rose1" });
      p.over(() => grid(p, 27, 41, 10, ["..llllll..", ".l......l.", "...lll....", "..l...l...", "....l....."], { l: "rose4" }));
      // The left spandrel, glued back crooked: a pale line of old glue.
      p.rows(11, 41, ["g..", ".g.", "..g"], { g: "gold2" });
      p.outline("rose1");
    },
  },

  /**
   * The two-seater by the window: a little tea-wood table with a drop leaf whose bracket snapped
   * years ago, so it hangs. The owner's daughter drew a crayon sun on it. Plates: x 4–36, y 4–20.
   */
  "furn/table-small": {
    w: 40, h: 45, anchor: [20, 43], foot: [-18, -20, 36, 18], shadow: { rx: 21, ry: 7, dy: -2 },
    draw: (p) => {
      p.rect(3, 1, 34, 1, "wood5").rect(2, 2, 36, 1, "wood4").rect(1, 3, 38, 20, "wood4");
      boards(p, 1, 1, 38, 22, { dir: "h", seams: [7, 14], seed: 51, flush: [26, 9] });
      topEdges(p, 1, 1, 38, 22);
      p.over(() => p.hline(9, 19, 7, "wood5").hline(24, 18, 6, "wood5").hline(26, 8, 4, "wood3"));
      p.hline(1, 23, 38, "wood5").rect(1, 24, 38, 2, "wood3").hline(1, 26, 38, "wood2");
      p.rect(4, 27, 32, 4, "wood2").hline(4, 27, 32, "wood1");
      squareLeg(p, 2, 27, 6, 15, TEA, 4);
      squareLeg(p, 32, 27, 6, 15, TEA, 4);
      // The hanging D-shaped leaf, its grain running across, darker toward its rounded edge.
      const leaf = oval(ovalHalves(30, 28), 5, 10);
      for (let y = 24; y < 39; y++) for (let x = 5; x < 35; x++) if (leaf.inside(x, y)) p.px(x, y, y < 27 ? "wood4" : y > 34 ? "wood2" : "wood3");
      p.over(() => {
        p.vline(5, 26, 6, "wood4").vline(6, 32, 3, "wood4");
        for (const [x, y, n, c] of [[9, 28, 10, "wood4"], [22, 30, 8, "wood2"], [10, 32, 6, "wood2"], [24, 27, 6, "wood4"], [14, 35, 9, "wood1"]] as const) p.hline(x, y, n, c);
        for (let y = 24; y < 39; y++) for (let x = 5; x < 35; x++) if (leaf.inside(x, y) && !leaf.inside(x + 1, y)) p.px(x, y, "wood2");
      });
      // Rusted hinges.
      for (const x of [10, 27]) grid(p, x, 25, 3, ["454", "323", "3o3"], { ...STEEL, o: "orange1" });
      // The crayon sun.
      grid(p, 22, 28, 7, ["o..o..o", "..yyy..", "oyYyyyo", "..yyy..", "o..o..o"], { y: "gold4", Y: "gold5", o: "orange2" });
      p.outline("wood1");
    },
  },

  /**
   * The round family table for big orders, on a turned pedestal with four splayed feet. A split
   * ran across the top one dry winter; it was mended with two butterfly keys. A pale ring where the
   * hot congee pot always goes. Plates: anywhere in x 8–56, y 5–30.
   */
  "furn/table-round": {
    w: 64, h: 64, anchor: [32, 62], foot: [-28, -26, 56, 22], shadow: { rx: 30, ry: 9, dy: -3 },
    draw: (p) => {
      // Feet first: left and right splay outward, the front one comes toward us.
      p.poly([[27, 49], [16, 55], [8, 58], [6, 61], [12, 61], [20, 59], [29, 56]], "wood3");
      p.poly([[37, 49], [48, 55], [56, 58], [58, 61], [52, 61], [44, 59], [35, 56]], "wood2");
      p.line(26, 50, 15, 56, "wood5").line(15, 56, 8, 58, "wood4");
      p.line(38, 50, 49, 56, "wood3").hline(52, 61, 6, "wood1");
      p.rect(6, 60, 7, 2, "wood2").rect(52, 60, 7, 2, "wood1");
      grid(p, 26, 48, 12, [
        "..43333222..",
        ".4433333222.",
        ".4433333222.",
        "..44333322..",
        "..44333322..",
        "..44333322..",
        "..44333322..",
        "..44333322..",
        ".5444333222.",
        ".5443333222.",
        "..22222222..",
        "..33333332..",
        ".4443333322.",
        ".4433333222.",
      ], { "5": "wood5", "4": "wood4", "3": "wood3", "2": "wood2" });
      // Turned column under the top.
      grid(p, 25, 35, 14, [
        "...22222222...",
        "...22222222...",
        "....233322....",
        "...24433322...",
        "..2544333222..",
        "..2544333222..",
        "...24433322...",
        "....443322....",
        "....443322....",
        "...54433322...",
        "...22222222...",
        "...44333322...",
        "..5443333222..",
      ], { "5": "wood5", "4": "wood4", "3": "wood3", "2": "wood2" });
      // The top: an oval with a rim showing under its front curve.
      const top = oval(ovalHalves(62, 34), 1, 1);
      top.fill(p, "wood4");
      boards(p, 1, 1, 62, 34, { dir: "h", seams: [9, 17, 26], seed: 61, flush: [40, 12, 30] });
      for (let y = 0; y < 36; y++) for (let x = 0; x < 64; x++) {
        if (!top.inside(x, y)) continue;
        if (!top.inside(x, y, 1, 1) && x < 40 && y < 22) p.px(x, y, !top.inside(x, y, 2, 2) && x < 30 && y < 10 ? "wood6" : "wood5");
        if (!top.inside(x, y, -1, -1) && x > 36 && y < 26) p.px(x, y, "wood3");
      }
      p.under(() => { top.fill(p, "wood3", 0, 1); top.fill(p, "wood3", 0, 2); top.fill(p, "wood2", 0, 3); });
      p.over(() => {
        for (let x = 0; x < 64; x++) for (let y = 34; y < 38; y++) if (!top.inside(x, y) && top.inside(x, y, 0, 1) && !top.inside(x, y - 1, 0, 1)) p.px(x, y, "wood5");
      });
      // The split and its two butterfly keys.
      grid(p, 30, 2, 4, ["2...", ".2..", ".2..", "..2.", "..2.", "..2.", ".2..", ".2..", "..2.", "..2.", "...2", "...2", "..2.", "..2.", "..2.", "...2", "...2", "..2.", "..2."], { "2": "wood2" });
      bowtie(p, 26, 5);
      bowtie(p, 27, 14);
      // The congee pot's ring.
      p.over(() => grid(p, 41, 18, 12, ["...555555...", ".55......55.", "5..........5", ".55......55.", "...55555...."], { "5": "wood5" }));
      p.outline("wood1");
    },
  },
});
