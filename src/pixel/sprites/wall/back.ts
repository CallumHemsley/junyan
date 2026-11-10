/**
 * The back (north) wall, face-on, in 32×96 slices that tile horizontally in any order.
 * Dining side: lime plaster over dark-stained raised-panel wainscot, put in when the building was a
 * Concession bistro in the thirties. Each variant records a different event in the room's life.
 *
 * Slices anchor at their top-left corner: place them at (x, 0) along the top of the room.
 * Wall-mounted pieces (windows, the post) anchor at the wall's foot, 96px below the slice top, so they
 * sort after the wall slices they hang on.
 */
import { defineSprites, Px, type Color } from "../../kit/index.ts";
import { PALE_PANEL, PLASTER, block, capAndCornice, diningWall, kitchenWall, plaster, skirting, wainscot } from "./_helpers.ts";

const slice = (draw: (p: Px) => void) => ({ w: 32, h: 96, anchor: [0, 0] as const, layer: "floor" as const, draw });

/**
 * A plaster patch: an irregular polygon of fresher, whiter plaster with crisp edges. Its trowelled
 * ridge catches the sun along the top and left and throws a hairline shade along the bottom and right.
 */
function patch(p: Px, points: readonly (readonly [number, number])[]) {
  const m = new Px(32, 96);
  m.poly(points, "white");
  const inside = (x: number, y: number) => m.solid(x, y);
  for (let y = 10; y < 58; y++) for (let x = 0; x < 32; x++) {
    if (inside(x, y)) p.px(x, y, !inside(x - 1, y) || !inside(x, y - 1) ? "white" : "cream5");
    else if (inside(x - 1, y) || inside(x, y - 1)) p.px(x, y, "cream3");
  }
}

/** Soft occlusion where the back wall meets a side wall. `depth[i]` is how far down column i darkens. */
function cornerShadow(p: Px, side: "left" | "right", kitchen = false) {
  const at = (i: number) => (side === "left" ? i : 31 - i);
  const depth = side === "left" ? [48, 48, 48, 34, 18] : [48, 36, 14];
  depth.forEach((rows, i) => {
    for (let y = 10; y < 10 + rows; y++) {
      // Feather the end of each run so the shadow tapers instead of banding.
      if (i > 0 && y > 10 + rows - 6 && (y + i) % 2 === 1) continue;
      const c = p.get(at(i), y);
      const darker: Partial<Record<string, Color>> = i === 0
        ? { cream4: "cream2", cream5: "cream3", cream3: "cream2", white: "cream4", stone4: "stone3" }
        : { cream4: "cream3", cream5: "cream4", white: "cream5", cream3: "cream2" };
      if (c && darker[c]) p.px(at(i), y, darker[c]!);
    }
  });
  const down: Partial<Record<string, Color>> = {
    wood6: "wood4", wood5: "wood4", wood4: "wood3", wood3: "wood2", wood2: "wood1",
    white: "cream4", cream5: "cream4", cream4: "cream3", stone4: "stone3", steel3: "steel2", steel2: "steel1",
  };
  for (let i = 0; i < (side === "left" ? 2 : 1); i++) for (let y = kitchen ? 18 : 58; y < 96; y++) {
    const c = p.get(at(i), y);
    if (c && down[c]) p.px(at(i), y, down[c]!);
  }
}

export default defineSprites({
  /** Quiet plaster. The workhorse. */
  "wall/back-a": slice((p) => diningWall(p, 11)),

  /** Quiet plaster with a different broken cornice shadow and skirting grain. */
  "wall/back-b": slice((p) => diningWall(p, 23)),

  /**
   * The building settled in the thirties and again in the seventies: a crack filled with whiter plaster,
   * starting to open again below, and running on as a split down the panel under it.
   */
  "wall/back-c": slice((p) => {
    diningWall(p, 31);
    block(p, 9, 14, [
      "........CKC.",
      ".......CkC..",
      ".......CkC..",
      "......CCkC..",
      "......CkCC..",
      ".....CCkC...",
      ".....CkC....",
      "....CCkC....",
      "....CkCC....",
      "....CkC.....",
      "...CCkC.....",
      "...CkCC.....",
      "...CCkCC....",
      "....CCkC....",
      ".....CkC....",
      ".....CkCC...",
      "......CkC...",
      "......CkC...",
      ".....CCkC...",
      ".....CkCC...",
      ".....CK.....",
      "......K.....",
      "......K.....",
      ".....K......",
      ".....K......",
      "......K.....",
    ], PLASTER, "filled-crack");
    block(p, 13, 66, ["2..", "1..", "13.", ".1.", ".1.", ".13", "..1", ".1.", ".13", "..1", "..1", "...", "..1", "..1"], { 1: "wood1", 2: "wood2", 3: "wood3" }, "split");
  }),

  /**
   * Where the old owner's wedding photograph hung for thirty years: a paler rectangle with a dust line
   * along its top, one nail still in, one hole where the other was pulled.
   */
  "wall/back-d": slice((p) => {
    diningWall(p, 41);
    p.rect(6, 20, 20, 23, "cream5");
    p.hline(6, 19, 20, "cream3").vline(6, 20, 23, "cream5");
    p.hline(7, 43, 19, "cream4");
    block(p, 9, 14, ["n.", "nK", ".K"], PLASTER, "nail");
    block(p, 21, 15, ["K.", ".C"], PLASTER, "hole");
  }),

  /** Replastered after the old wiring came out: a whiter patch, trowel arcs still showing. */
  "wall/back-e": slice((p) => {
    diningWall(p, 53);
    patch(p, [[7, 24], [15, 21], [24, 23], [27, 29], [25, 36], [17, 38], [12, 35], [6, 33], [9, 29]]);
    // The wiring chase it covers, ghosting through as a faint straight line.
    p.vline(16, 14, 7, "cream3");
  }),

  /** Bentwood chair backs have knocked the top rail here for ninety years: the varnish rubbed through to pale wood, dents, a ding in the panel. */
  "wall/back-f": slice((p) => {
    diningWall(p, 61);
    p.hline(6, 58, 8, "wood5").hline(5, 59, 10, "wood4").hline(7, 61, 5, "wood4");
    p.hline(19, 58, 5, "wood5").hline(18, 59, 6, "wood4");
    for (const x of [9, 12, 21]) p.px(x, 60, "wood1").px(x + 1, 61, "wood4");
    block(p, 16, 72, [".11", "1w3", ".3."], { 1: "wood1", 3: "wood3", w: "wood4" }, "ding");
    for (const [x, y, n] of [[7, 65, 6], [20, 65, 5]] as const) p.hline(x, y, n, "wood4");
    p.hline(5, 92, 4, "ink").hline(20, 93, 5, "ink");
  }),

  /**
   * Under a window that has leaked in every typhoon: a tea-coloured tide mark on the plaster below the
   * sill, and the varnish on the rail and panel bloomed milky where the water ran. Hang a window above it.
   */
  "wall/back-g": slice((p) => {
    diningWall(p, 73);
    block(p, 4, 52, [
      "yyyyyyyyyyyyyyyyyyyyyyy.",
      "Yyyyyyyyyyyyyyyyyyyyyyy.",
      ".YyyyyyyYyyyyyyyyyyyyyY.",
      "..YyyyyY.YyyyyyyyyYyyY..",
      "...YyyY...YyyyyyyY.YY...",
      "....YY.....YyyyyY.......",
    ], { y: "bamboo5", Y: "bamboo4" }, "tide");
    // Water bloom: the varnish gone milky in soft clusters on the rail and down the panel.
    for (const [x, y, n] of [[8, 59, 9], [10, 60, 6], [9, 61, 8], [12, 64, 4], [11, 65, 6], [14, 68, 3], [13, 69, 5], [15, 73, 3]] as const) p.hline(x, y, n, "cream1");
    for (const [x, y, n] of [[11, 66, 5], [16, 70, 4], [14, 74, 3]] as const) p.vline(x, y, n, "cream1");
  }),

  /**
   * A stool went through this panel during the 1987 typhoon party; the carpenter let in a new one of
   * paler wood and never stained it to match. Filler shows at its edges.
   */
  "wall/back-h": slice((p) => {
    capAndCornice(p, 83);
    plaster(p, 83);
    wainscot(p, 83, PALE_PANEL);
    skirting(p, 83);
    for (const [x, y] of [[4, 67], [27, 67], [4, 83], [27, 83]] as const) p.px(x, y, "cream2");
  }),

  /**
   * The shop's first light switch, still working: a porcelain rotary switch on a wooden pattress,
   * fed by twisted cloth cable stapled down from the cornice. Fingers have greyed the plaster round it.
   */
  "wall/back-i": slice((p) => {
    diningWall(p, 97);
    // Cloth cable, a twist catching the light every third pixel.
    for (let y = 10; y < 39; y++) p.px(21, y, y % 3 ? "stone2" : "stone3").px(22, y, "stone1");
    for (const y of [15, 24, 33]) p.hline(20, y, 4, "steel4").px(23, y, "steel2");
    // Finger grime, heaviest on the lower left where hands reach.
    block(p, 14, 37, [
      "....kkkkkk....",
      "..kk......kk..",
      ".k..........k.",
      "kk..........k.",
      "kk..........k.",
      "kk.........k..",
      ".kk.......k...",
      "..kkkkkkkk....",
    ], PLASTER, "grime");
    // Turned wooden pattress, porcelain dome, brass lever turned to "on".
    block(p, 16, 38, [
      "..322223..",
      ".34444443.",
      "3445555442",
      "3455555432",
      "3455555432",
      "3445555442",
      ".24444442.",
      "..122221..",
    ], { 1: "wood1", 2: "wood2", 3: "wood3", 4: "wood4", 5: "wood4" }, "pattress");
    block(p, 18, 39, [
      ".WWww.",
      "WWwwwc",
      "Wwwwcc",
      "wwwccc",
      ".wcck.",
    ], { W: "white", w: "cream5", c: "cream4", k: "cream3" }, "porcelain");
    block(p, 21, 37, ["..L", ".Lg", "Lg."], { L: "gold4", g: "gold2" }, "lever");
  }),

  /** The leftmost slice, against the left side wall, in its shadow. */
  "wall/back-end-left": slice((p) => { diningWall(p, 101); cornerShadow(p, "left"); }),

  /** The rightmost dining slice, for a room with no kitchen on that side. */
  "wall/back-end-right": slice((p) => { diningWall(p, 103); cornerShadow(p, "right"); }),

  // ── kitchen ───────────────────────────────────────────────────────────────

  /** White glazed tiles with a jade trim course, clean. */
  "wall/back-kitchen-a": slice((p) => kitchenWall(p, 201)),

  /** One tile replaced in a creamier white with fresh grout, and a corner knocked off another by a ladle. */
  "wall/back-kitchen-b": slice((p) => {
    kitchenWall(p, 202, (col, course) => (col === 0 && course === 2 ? { lit: "cream5", face: "cream4", shade: "cream3", grout: "stone5" } : undefined));
    block(p, 19, 74, ["..sss", ".skKk", "skKKk", "kkkkk"], { s: "stone4", k: "cream3", K: "cream2" }, "chip");
  }),

  /** Above the stove: grease has yellowed the tiles and grout, spattered heaviest at wok height. */
  "wall/back-kitchen-c": slice((p) => {
    kitchenWall(p, 203, (col, course) => (course === 3 && col !== 1 ? { lit: "cream5", face: "cream4", shade: "cream3", grout: "bamboo4" } : course === 2 || course === 4 ? { lit: "white", face: "cream5", shade: "cream4", grout: "bamboo4" } : undefined));
    for (const [x, y] of [[4, 40], [12, 43], [21, 39], [27, 45], [8, 49], [17, 48], [25, 52], [3, 55], [14, 56], [29, 58]] as const) p.px(x, y, "bamboo3").px(x + 1, y, "bamboo4").px(x, y + 1, "bamboo4");
    for (const [x, y, n] of [[10, 50, 6], [23, 54, 5]] as const) p.vline(x, y, n, "bamboo3");
  }),

  /** A shelf came down here: two rawlplugs left in the tiles with rust tears under them, two empty screw holes. */
  "wall/back-kitchen-d": slice((p) => {
    kitchenWall(p, 204);
    for (const x of [6, 25]) {
      p.px(x, 32, "steel2").px(x + 1, 32, "steel3").px(x, 33, "steel1").px(x + 1, 33, "steel2");
      p.vline(x, 34, 4, "bamboo3").px(x, 38, "bamboo4");
    }
    for (const [x, y] of [[12, 33], [19, 33]] as const) p.px(x, y, "stone3").px(x + 1, y + 1, "cream4");
  }),

  /** Hard over the wok: grease thick enough to have browned at the grout, a hairline crack through one tile. */
  "wall/back-kitchen-e": slice((p) => {
    kitchenWall(p, 205, (col, course) => (course === 3 ? { lit: "cream5", face: col === 0 ? "bamboo5" : "cream4", shade: "cream3", grout: "bamboo3" } : course === 2 || course === 4 ? { lit: "cream5", face: "cream4", shade: "cream3", grout: "bamboo4" } : undefined));
    for (const [x, y] of [[6, 41], [15, 44], [24, 40], [10, 52], [20, 50], [28, 55], [4, 58]] as const) p.px(x, y, "bamboo3").px(x, y + 1, "bamboo2").px(x + 1, y, "bamboo4");
    block(p, 9, 46, ["..K", ".K.", ".K.", "K..", "K.."], PLASTER, "crack");
  }),

  /** The rightmost kitchen slice, against the right side wall. */
  "wall/back-kitchen-end-right": slice((p) => { kitchenWall(p, 206); cornerShadow(p, "right", true); }),
});
