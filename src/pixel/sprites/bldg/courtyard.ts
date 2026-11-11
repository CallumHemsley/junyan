/**
 * The courtyard's architecture (ticket 0183): the shikumen yard behind the town's moon gate, one sprite
 * per map prop, id `courtyard/<id>`, anchored on the footprint's bottom-centre (contract:
 * docs/design/pixel-contracts.md, pipeline: src/pixel/world/maps.ts). Built from the lane houses' kit
 * (`_lane.ts`), hip roofs throughout.
 *
 * - South-facing homes show a facade (the bottom of the sprite) under a hipped roof. A shallow plot's
 *   sprite rises above its footprint so the house still has a storey and a roof.
 * - The two homes at the map's edges run north–south: a long hipped roof seen from above, the south
 *   end wall facing the camera, and a strip of side wall toward the yard drawn foreshortened (its height
 *   squeezed across the strip, so doors and windows lie along it and the downpipes cross it).
 * - Walls, gates, the hall doorway and canopy, stoops, doorsteps, windows, the bicycle shed, the cat's
 *   ledge, utility boxes and the rose arch. The gate and arch keep their openings clear.
 */
import { defineSprites, hash, Px, TILE, type Color, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import {
  acUnit, basePot, birdcage, block, brickedWindow, bricks, castShadow, downpipe, eave, facadeShell, homeSign, hoseReel,
  laneRoof, laneWindow, laundryPole, lichen, meterCluster, moss, numberPlate, paintedRepair, pigeonLoft,
  satelliteDish, shadowWedge, sillPlants, solarHeater, stain, stoneGate, stoolAndBasin, tarp, tigerWindow,
  wornPatch, type Lacquer,
} from "./_lane.ts";

const MAP = "courtyard";
const props = (kind: string) => mapProps(MAP, kind);
const px = (tiles: number) => Math.round(tiles * TILE);

/** A sprite for a prop that may rise `rise` px above its footprint; anchored on the footprint's bottom-centre. */
function sprite(prop: MapProp, rise: number, draw: (p: Px, w: number, h: number) => void, extra: Partial<SpriteDef> = {}): SpriteDef {
  const { w, h: foot } = footprintPx(prop);
  const h = foot + rise;
  return { w, h, anchor: [Math.round((prop.width * TILE) / 2), h - 1], draw: (p) => draw(p, w, h), ...extra };
}

// ── wall windows (shared by the window props and the houses they sit on) ─────

/**
 * The two named wall windows. `x` is the window prop's left edge and `base` the wall's foot row, both
 * in the canvas being drawn: the window prop's sprite and the house under it draw the same pixels, so it
 * shows whichever of the two the depth sort puts in front.
 */
function wallWindow(p: Px, prop: MapProp, x: number, base: number): void {
  const w = footprintPx(prop).w;
  if (prop.variant === 0) {
    // The blue window: the widest on the yard, blue shutters folded back, a box of geraniums, a bench under it.
    const ww = 40, wx = x + Math.round((w - ww) / 2), wy = base - 62;
    laneWindow(p, wx, wy, ww, 34, { seed: 31, shutters: "open", shutterTone: "blue", glass: "curtain", curtain: "cream", frame: "cream", sill: "plain" });
    // A painted window box hung under the sill.
    p.rect(wx - 2, wy + 37, ww + 4, 6, "blue3");
    p.hline(wx - 2, wy + 37, ww + 4, "blue4").hline(wx - 2, wy + 42, ww + 4, "blue1");
    sillPlants(p, wx, wy + 37, ww, 9);
  } else {
    // The kitchen window: steam-fogged glass, jars on the sill, a little tin hood against the rain.
    const ww = 34, wx = x + Math.round((w - ww) / 2), wy = base - 58;
    laneWindow(p, wx, wy, ww, 28, { seed: 47, glass: "curtain", curtain: "jade", ajar: true, frame: "jade", sill: "jar" });
    p.faded(0.45, (q) => q.rect(wx + 3, wy + 3, 12, 10, "white"));
    p.rect(wx - 4, wy - 9, ww + 8, 4, "steel4");
    p.hline(wx - 4, wy - 9, ww + 8, "steel5").hline(wx - 4, wy - 6, ww + 8, "steel1");
    for (let i = 0; i < ww + 8; i += 4) p.px(wx - 4 + i, wy - 5, "steel2");
    block(p, wx + 2, wy + 22, ["ab.cd.ab", "bb.dd.bb"], { a: "orange3", b: "orange1", c: "cream5", d: "cream3" }, "jars");
  }
}

/** Window props whose footprint overlaps a house, with the house's base row in that house's canvas. */
const windowsOn = (house: MapProp) => props("window").filter((w) =>
  w.position.x < house.position.x + house.width && w.position.x + w.width > house.position.x
  && w.position.y < house.position.y + house.height && w.position.y + w.height > house.position.y + house.height - 1.5);

// ── south-facing homes ──────────────────────────────────────────────────────

type FrontPlan = {
  /** Facade height and the storey line from the bottom. */
  F: number; groundH: number;
  doors: { cx: number; w: number; lacquer: Lacquer; pediment: "plain" | "triangle" | "arch" | "scroll"; doorH: number }[];
  /** Windows: [x, y from the facade top, w, h, dressing]. */
  windows: [number, number, number, number, "shutters" | "cage" | "bars" | "curtain" | "bricked" | "plain"][];
  ridgeY: number;
  life: (p: Px, top: number, base: number, roofH: number) => void;
  roof: (p: Px, roofH: number, ridgeY: number) => void;
};

/**
 * Who lives where (doors where the doorsteps are):
 * - north-west: the Shens, retired; jade door, a birdcage, his pigeons on the roof.
 * - north-east: the Lus, the yard's oldest family: the blue window, the arched gate, the solar heater.
 * - central: three generations; the kitchen window over the yard where everybody's dinner is known.
 * - south: a widow's cottage, one storey and an attic; she takes in sewing.
 */
const FRONTS: Record<string, FrontPlan> = {
  "courtyard.north-west-home": {
    F: 112, groundH: 70, ridgeY: 12,
    doors: [{ cx: 196, w: 44, lacquer: "jade", pediment: "plain", doorH: 58 }],
    windows: [
      [26, 12, 22, 26, "shutters"], [92, 12, 22, 26, "cage"], [234, 12, 22, 26, "curtain"], [284, 12, 22, 26, "shutters"],
      [40, 62, 22, 26, "shutters"], [112, 62, 20, 24, "bars"], [250, 64, 20, 24, "bars"],
    ],
    life: (p, top, base) => {
      acUnit(p, 150, top + 18, 3, [134, top + 22]);
      birdcage(p, 118, top + 14);
      laundryPole(p, 16, top + 52, 104, 5, ["towel", "shirt", "socks", "trousers"]);
      wornPatch(p, 222, base - 32, 24, 24, 4);
      hoseReel(p, 6, base - 46);
    },
    roof: (p, roofH, ridgeY) => {
      pigeonLoft(p, 222, ridgeY + 6);
      shadowWedge(p, 251, ridgeY + 10, 6, 16);
      for (const [dx, dy] of [[-4, 30], [8, 34], [20, 32]] as const) p.px(236 + dx, ridgeY + dy, "white");
      tigerWindow(p, 70, ridgeY + 8, 11, { w: 28, plant: true });
      void roofH;
    },
  },
  "courtyard.north-east-home": {
    F: 112, groundH: 70, ridgeY: 12,
    doors: [{ cx: 296, w: 46, lacquer: "oxblood", pediment: "arch", doorH: 58 }],
    windows: [
      [24, 12, 22, 26, "curtain"], [84, 12, 22, 26, "shutters"], [150, 12, 22, 26, "shutters"], [214, 12, 22, 26, "cage"], [338, 12, 22, 26, "shutters"],
      [40, 64, 20, 24, "bricked"], [348, 64, 20, 24, "bars"],
    ],
    life: (p, top, base) => {
      // The quilt airs over the second upstairs sill every fine morning.
      p.rect(82, top + 34, 26, 20, "pink2");
      p.hline(82, top + 34, 26, "pink3").hline(82, top + 35, 26, "pink3").vline(107, top + 36, 18, "pink1");
      for (let k = 2; k < 26; k += 6) block(p, 81 + k, top + 40 + ((k / 6) % 2) * 6, [".a.", "aba", ".a."], { a: "pink1", b: "gold4" }, "quiltFlower");
      acUnit(p, 250, top + 18, 7, [236, top + 22]);
      numberPlate(p, 326, base - 52);
      paintedRepair(p, 66, base - 34, 16, 12, 3);
    },
    roof: (p, roofH, ridgeY) => {
      solarHeater(p, 150, ridgeY + 6);
      satelliteDish(p, 300, ridgeY + 10);
      void roofH;
    },
  },
  "courtyard.central-home": {
    F: 112, groundH: 70, ridgeY: 12,
    doors: [{ cx: 282, w: 40, lacquer: "wood", pediment: "scroll", doorH: 58 }],
    windows: [
      [30, 12, 22, 26, "shutters"], [104, 12, 22, 26, "curtain"], [178, 12, 22, 26, "shutters"], [252, 12, 22, 26, "cage"],
      [200, 64, 20, 24, "shutters"],
    ],
    life: (p, top, base) => {
      meterCluster(p, 232, base - 66, top + 50);
      laundryPole(p, 140, top + 52, 80, 9, ["vest", "pillow", "socks"]);
      wornPatch(p, 24, base - 30, 30, 22, 8);
    },
    roof: (p, roofH, ridgeY) => {
      tarp(p, 180, ridgeY + 14, 30, 14, 4);
      tigerWindow(p, 46, ridgeY + 8, 5, { w: 28, frame: "jade3", curtain: "cream4" });
      void roofH;
    },
  },
  "courtyard.south-home": {
    F: 96, groundH: 0, ridgeY: 10,
    doors: [{ cx: 32, w: 40, lacquer: "blue", pediment: "plain", doorH: 56 }],
    windows: [[86, 26, 24, 30, "shutters"], [170, 26, 24, 30, "curtain"], [250, 28, 22, 26, "bricked"]],
    life: (p, top, base) => {
      homeSign(p, 120, base - 34, 34);
      stoolAndBasin(p, 64, base - 1);
      basePot(p, 290, base - 1);
      laundryPole(p, 150, top + 8, 120, 2, ["shirt", "towel", "towel", "vest", "socks"]);
    },
    roof: (p, roofH, ridgeY) => {
      tigerWindow(p, 196, ridgeY + 6, 2, { w: 28, plant: true, frame: "wood3" });
      void roofH;
    },
  },
};

/** How far each south-facing home rises above its footprint (a shallow plot still gets a roof). */
const RISE: Record<string, number> = { "courtyard.south-home": 56 };

function frontHome(p: Px, prop: MapProp, W: number, H: number): void {
  const plan = FRONTS[prop.id];
  const seed = prop.variant * 37 + 11;
  const { F } = plan, top = H - F, base = H - 1;
  facadeShell(p, 0, top, W, base, { seed, groundH: plan.groundH || F - 8, quoins: true, bandCourses: plan.groundH ? 2 : 0 });
  for (const [x, y, w, h, d] of plan.windows) {
    const wy = top + y;
    if (d === "bricked") brickedWindow(p, x, wy, w, h, seed + x);
    else laneWindow(p, x, wy, w, h, {
      seed: seed + x, shutters: d === "shutters" ? (["open", "half", "closed"] as const)[x % 3] : null,
      shutterTone: (["jade", "wood", "blue", "cream"] as const)[(x >> 3) % 4], cage: d === "cage", bars: d === "bars",
      glass: d === "curtain" ? "curtain" : d === "bars" ? "dark" : "sky", curtain: (["cream", "plum", "pink", "jade"] as const)[(x >> 4) % 4],
      ajar: d === "curtain", sill: d === "bars" ? "jar" : "plants",
    });
  }
  for (const win of windowsOn(prop)) wallWindow(p, win, px(win.position.x - prop.position.x), base);
  for (const d of plan.doors) stoneGate(p, d.cx - d.w / 2, d.cx + d.w / 2, base, { doorH: d.doorH, pediment: d.pediment, lacquer: d.lacquer, seed });
  downpipe(p, 3, top + 4, base);
  downpipe(p, W - 7, top + 4, base);
  plan.life(p, top, base, top + 4);
  const roofH = top + 4;
  laneRoof(p, 0, 0, W, roofH, { seed, ridgeY: plan.ridgeY, damp: 0.1 });
  moss(p, 6, roofH - 18, W - 12, 12, seed, Math.floor(W / 70));
  plan.roof(p, roofH, plan.ridgeY);
}

// ── north–south homes at the map's edges ────────────────────────────────────

/**
 * A home whose long axis runs north–south: the roof seen from above (drawn as a lane roof turned a
 * quarter, so its courses run down to the side eaves and its hips cap the north and south ends), a
 * strip of side wall toward the yard, foreshortened, and the south end wall facing the camera.
 * `yard` is the side the wall strip shows: west-row shows its east wall, east-home its west wall.
 */
function longHome(p: Px, prop: MapProp, W: number, H: number, yard: "east" | "west"): void {
  const seed = prop.variant * 41 + 3;
  const F = 96, L = H - F, base = H - 1, S = 22, RW = W - S;
  const roofX = yard === "east" ? 0 : S, stripX = yard === "east" ? RW : 0;
  // The south end wall, facing the lane: brick, a window, and on east-home its door.
  facadeShell(p, 0, L, W, base, { seed, groundH: F - 8, quoins: true, bandCourses: 0 });
  if (yard === "east") {
    laneWindow(p, 30, L + 30, 24, 30, { seed, shutters: "open", shutterTone: "wood", glass: "curtain", curtain: "plum", sill: "plants" });
    acUnit(p, 8, L + 14, seed);
  } else {
    stoneGate(p, 8, 44, base, { doorH: 56, pediment: "plain", lacquer: "jade", seed });
    laneWindow(p, 80, L + 30, 24, 30, { seed: seed + 1, shutters: "half", shutterTone: "jade", glass: "sky", sill: "plants" });
    birdcage(p, 108, L + 26);
  }
  // The side wall toward the yard: lime render, its foot along the strip's outer edge, its top under the eave.
  sideWall(p, stripX, 0, S, L, yard, seed, prop);
  // The roof, drawn east–west into a scratch canvas and turned a quarter onto the plot.
  const T = new Px(L, RW);
  laneRoof(T, 0, 0, L, RW, { seed, ridgeY: Math.round(RW * 0.28), damp: 0.1 });
  lichen(T, 20, Math.round(RW * 0.28) + 6, L - 40, RW - Math.round(RW * 0.28) - 12, seed + 2, Math.round(L / 80));
  moss(T, 24, RW - 18, L - 48, 12, seed, Math.floor(L / 60));
  const lighter: Partial<Record<Color, Color>> = { steel2: "steel3", stone2: "stone3" };
  for (let a = 0; a < L; a++) for (let b = 0; b < RW; b++) {
    const c = T.get(a, b);
    if (!c) continue;
    // East-home's long slope faces west, into the morning sun: a step lighter.
    if (yard === "east") p.px(roofX + b, a, c);
    else p.px(roofX + (RW - 1 - b), a, b > RW * 0.3 ? lighter[c] ?? c : c);
  }
  // The eave's shadow on the side wall, and the drip tiles along the south end.
  castShadow(p, yard === "east" ? stripX : stripX + S - 3, 0, 3, L, 0);
  eave(p, roofX, L - 5, RW);
  // Roof life: a tarp on west-row, a dish and a loft on east-home.
  if (yard === "east") { tarp(p, 30, 140, 14, 30, seed); satelliteDish(p, 34, 300); }
  else { pigeonLoft(p, S + 50, 60); satelliteDish(p, S + 70, 150); }
}

/**
 * A side wall seen almost edge-on, as a vertical strip `S` px wide and `L` tall: the wall's height runs
 * across the strip (foot on the outer edge, top under the eave), its length down the strip. Windows,
 * doors and shutters lie along it; downpipes and laundry poles cross it.
 */
function sideWall(p: Px, x: number, y: number, S: number, L: number, yard: "east" | "west", seed: number, prop: MapProp): void {
  // Height coordinate: 0 at the foot, S - 1 under the eave.
  const at = (hgt: number) => (yard === "east" ? x + S - 1 - hgt : x + hgt);
  for (let j = 0; j < L; j++) for (let h = 0; h < S; h++) {
    let c: Color = h < 4 ? "stone2" : h < 5 ? "stone4" : "cream3";
    if (h >= 5 && hash(h >> 2, (y + j) >> 3, seed) > 0.85) c = "cream2";
    p.px(at(h), y + j, c);
  }
  // Brick showing where the render has fallen.
  for (let i = 0; i < 4; i++) {
    const jy = y + 30 + Math.floor(hash(i, 1, seed) * (L - 60));
    for (let j = 0; j < 10; j++) for (let h = 7; h < 13; h++) p.px(at(h), jy + j, (j % 4 === 3) ? "stone3" : (h % 3 === 2 ? "stone3" : "steel3"));
  }
  const doorAt = (j0: number, len: number, paint: Color) => {
    for (let j = j0; j < j0 + len; j++) for (let h = 0; h < 16; h++) {
      const edge = j === j0 || j === j0 + len - 1 || h === 15;
      p.px(at(h), j, edge ? "stone4" : (j - j0) % 8 === 0 ? "wood1" : paint);
    }
    for (let j = j0 - 1; j <= j0 + len; j++) p.px(at(0), j, "stone4");
    p.px(at(7), j0 + len - 4, "gold3");
  };
  const windowAt = (j0: number, len: number, shutter: Color | null) => {
    for (let j = j0; j < j0 + len; j++) for (let h = 9; h < 17; h++) {
      const frame = j === j0 || j === j0 + len - 1 || h === 9 || h === 16;
      p.px(at(h), j, frame ? "cream5" : h > 13 ? "blue3" : "blue2");
    }
    p.px(at(15), j0 + 2, "blue5").px(at(14), j0 + 3, "blue4");
    // The sill sticks out from the wall: a lit stone line at the window's foot, its shadow on the render.
    for (let j = j0 - 2; j < j0 + len + 2; j++) { p.px(at(8), j, "stone5"); p.px(at(7), j, "stone2"); }
    if (shutter) for (const [s0, s1] of [[j0 - 8, j0 - 1], [j0 + len + 1, j0 + len + 8]]) for (let j = s0; j <= s1; j++) for (let h = 9; h < 17; h++)
      p.px(at(h), j, (j % 2) ? shutter : "ink2");
  };
  // Where the yard door is: from the doorstep beside the wall, if one is there.
  const step = props("doorstep").find((d) => Math.abs((yard === "east" ? d.position.x : d.position.x + d.width) - (yard === "east" ? prop.position.x + prop.width : prop.position.x)) < 1.2
    && d.position.y >= prop.position.y && d.position.y <= prop.position.y + prop.height - 3);
  const doorJ = step ? px(step.position.y - prop.position.y) - 26 : -100;
  if (step) doorAt(doorJ, 30, yard === "east" ? "wood3" : "jade3");
  const shutters: Color[] = ["jade3", "wood4", "blue3"];
  for (let j = 24, k = 0; j < L - 40; j += 58, k++) {
    if (Math.abs(j - doorJ) < 44) continue;
    windowAt(j, 22, k % 3 === 2 ? null : shutters[k % 3]);
    // A bamboo laundry pole out from under every other window, toward the yard.
    if (k % 2 === 0) for (let h = 9; h < S; h++) { p.px(at(h), j + 26, "bamboo4"); p.px(at(h), j + 27, "bamboo2"); }
  }
  // Downpipes cross the strip from eave to foot; an AC unit stands out from the wall.
  for (const j of [6, Math.floor(L / 2) + 3, L - 10]) for (let h = 0; h < S; h++) { p.px(at(h), j, "steel4"); p.px(at(h), j + 1, "steel2"); }
  const acJ = Math.floor(L * 0.36) + 4;
  for (let j = acJ; j < acJ + 14; j++) for (let h = 10; h < 21; h++) p.px(at(h), j, h === 20 || j === acJ ? "steel6" : (j - acJ) % 3 === 0 ? "steel3" : "steel5");
  for (let j = acJ + 14; j < acJ + 30; j++) if (j % 2) p.px(at(9), j, "stone2");
  // The wall's top under the eave in shadow, its foot dark with splash-back.
  for (let j = 0; j < L; j++) { p.px(at(S - 1), y + j, "steel1"); p.px(at(0), y + j, "steel1"); }
}

// ── walls, gate, hall front ─────────────────────────────────────────────────

/** Whitewashed boundary wall either side of the town entry, a grey pantile coping along its top. 64px tall. */
function boundaryWall(p: Px, w: number, h: number, seed: number, end: "left" | "right"): void {
  const top = h - 64, base = h - 1;
  p.rect(0, top + 10, w, 54, "cream4");
  for (let y = top + 10; y < base; y++) for (let x = 0; x < w; x++) if (hash(x >> 4, y >> 3, seed) > 0.9) p.px(x, y, "cream3");
  // Flaking lime showing the brick, and a green damp line rising from the foot.
  for (const [fx, fy] of [[18, top + 22], [86, top + 34]] as const) {
    bricks(p, fx, fy, 16, 10, seed + fx);
    p.hline(fx, fy - 1, 16, "cream5").vline(fx - 1, fy, 10, "cream5").hline(fx, fy + 10, 16, "cream2");
  }
  for (let x = 0; x < w; x++) {
    // Rising damp: a ragged green-grey tide mark over a grey plinth.
    const d = 7 + Math.floor(hash(x >> 2, 1, seed) * 6);
    for (let y = base - d; y < base; y++) p.px(x, y, y > base - 4 ? "stone2" : y === base - d ? "jade5" : "jade4");
  }
  p.hline(0, base, w, "steel1");
  // Coping: a little pantile roof both ways along the wall top, seen from above, with tile ends.
  p.rect(0, top, w, 6, "steel3");
  for (let x = 0; x < w; x++) { const k = x % 8; p.px(x, top, k < 2 ? "steel6" : "steel4"); if (k === 7) p.vline(x, top + 1, 4, "steel1"); }
  p.hline(0, top + 3, w, "stone5");
  eave(p, 0, top + 5, w);
  // The wall's free end steps down to a pier.
  const ex = end === "left" ? 0 : w - 6;
  p.rect(ex, top - 4, 6, 68, "cream5");
  p.vline(end === "left" ? 5 : w - 6, top - 4, 68, "cream2");
  p.rect(ex - 1, top - 6, 8, 3, "steel4").hline(ex - 1, top - 6, 8, "steel6");
  stain(p, w / 2 - 4, top + 11, 8, 26);
}

/**
 * The lane gate (弄堂口) to the town: two granite piers on base blocks, a lintel high over the lane with
 * a blank name plaque (the DOM may letter it), a scroll pediment and a little pantile hood. The opening
 * between the piers stays clear for walking.
 */
function entryGate(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, pier = 13, lintelY = base - 100;
  for (const x0 of [0, w - pier]) {
    p.rect(x0, lintelY, pier, base - lintelY + 1, "stone4");
    p.vline(x0, lintelY, base - lintelY + 1, "stone5").vline(x0 + pier - 1, lintelY, base - lintelY + 1, "stone2");
    p.vline(x0 + 4, lintelY + 14, 70, "stone3").vline(x0 + 5, lintelY + 14, 70, "stone5");
    p.rect(x0 - 1, base - 10, pier + 2, 11, "stone4");
    p.hline(x0 - 1, base - 10, pier + 2, "stone5").vline(x0 + pier, base - 10, 11, "stone2").hline(x0 - 1, base, pier + 2, "steel1");
    // Rubbed dark at hip height by a century of handcarts.
    for (let y = base - 34; y < base - 24; y++) if (hash(x0, y, seed) > 0.3) p.px(x0 + 6, y, "stone3");
  }
  // The lintel and its blank plaque.
  p.rect(-1 + 1, lintelY - 14, w, 14, "stone4");
  p.hline(0, lintelY - 14, w, "stone5").hline(0, lintelY - 1, w, "stone2").hline(0, lintelY, w, "steel1");
  const pw = 70, plx = Math.round((w - pw) / 2);
  p.rect(plx, lintelY - 12, pw, 10, "cream5");
  p.frame(plx, lintelY - 12, pw, 10, "stone3");
  p.hline(plx + 1, lintelY - 3, pw - 2, "cream3");
  // Scroll pediment and hood.
  const cy = lintelY - 15;
  p.rect(14, cy - 10, w - 28, 10, "stone4");
  p.hline(14, cy - 10, w - 28, "stone5").vline(w - 15, cy - 10, 10, "stone2");
  p.rect(30, cy - 8, w - 60, 6, "stone5");
  p.frame(30, cy - 8, w - 60, 6, "stone3");
  for (const [sx, flip] of [[6, false], [w - 14, true]] as const) block(p, sx, cy - 8, flip
    ? [".bba...", "bbccb..", "bc..cb.", "b.ba.cb", "..cb.cb", "..bccb.", "...bb.."]
    : ["...abb.", "..bccbb", ".bc..cb", "bc.ab.b", "bc.bc..", ".bccb..", "..bb..."], { a: "stone5", b: "stone4", c: "stone2" }, "scroll");
  p.rect(10, cy - 16, w - 20, 6, "steel3");
  for (let x = 10; x < w - 10; x++) { const k = x % 8; p.px(x, cy - 16, k < 2 ? "steel6" : "steel4"); if (k === 7) p.vline(x, cy - 15, 4, "steel1"); }
  eave(p, 10, cy - 12, w - 20, 0);
  // A lamp bracket on the left pier and a bicycle bell's worth of rust.
  block(p, pier, lintelY + 8, ["aa...", "..b..", ".ccc.", "cddde", ".eee."], { a: "steel2", b: "steel2", c: "steel3", d: "gold4", e: "steel1" }, "gateLamp");
}

/**
 * The hall's doorway at the yard's north end: a stone frame round the open double door of the shared
 * hall (the leaves folded back inside), warm dark within, a worn sill. 96 wide.
 */
function hallDoorway(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, J = 8, top = base - 74;
  // A bit of the hall's front either side of the frame: grey brick.
  bricks(p, 0, top - 8, w, base - top + 9, seed);
  p.rect(J, top + 6, w - 2 * J, base - top - 8, "wood1");
  // Inside: the hall's floorboards in lamplight, a stair foot, a coat on a hook.
  p.rect(J + 2, base - 22, w - 2 * J - 4, 18, "oak2");
  for (let y = base - 20; y < base - 4; y += 4) p.hline(J + 2, y, w - 2 * J - 4, "oak1");
  p.faded(0.3, (q) => q.ellipse(w / 2 - 6, base - 16, 12, 4, "gold4"));
  for (let k = 0; k < 5; k++) p.rect(w - J - 22 + k * 3, base - 26 - k * 6, 18 - k * 3, 2, "wood3");
  block(p, J + 8, top + 16, [".a.", "bbb", "bcb", "bbb", "bcb", "b.b"], { a: "steel3", b: "plum2", c: "plum1" }, "coat");
  // The folded-back leaves at the reveals.
  for (const x of [J, w - J - 6]) { p.rect(x, top + 6, 6, base - top - 10, "wood2"); p.vline(x, top + 6, base - top - 10, "wood3"); p.vline(x + 5, top + 6, base - top - 10, "wood1"); }
  // Stone frame and lintel.
  for (const x of [0, w - J]) { p.rect(x, top, J, base - top + 1, "stone4"); p.vline(x, top, base - top + 1, "stone5"); p.vline(x + J - 1, top, base - top + 1, "stone2"); }
  p.rect(0, top - 8, w, 9, "stone4");
  p.hline(0, top - 8, w, "stone5").hline(0, top, w, "steel1");
  p.rect(28, top - 6, w - 56, 5, "cream5");
  p.frame(28, top - 6, w - 56, 5, "stone3");
  // Sill.
  p.rect(J - 2, base - 3, w - 2 * J + 4, 4, "stone4");
  p.hline(J - 2, base - 3, w - 2 * J + 4, "stone5").hline(J - 2, base, w - 2 * J + 4, "steel1");
  p.hline(w / 2 - 12, base - 3, 24, "stone3");
}

/** A tiled pent canopy over the hall door on two posts, seen from above: its roof, eave and post feet. */
function hallCanopy(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, eaveY = base - 80, roofRows = 26;
  const T = new Px(w, roofRows);
  laneRoof(T, 0, 0, w, roofRows, { seed, ridgeY: 2, damp: 0.04 });
  p.blit(T, 0, eaveY - roofRows + 5);
  // Posts: square timbers on stone bases.
  for (const x of [4, w - 10]) {
    p.rect(x, eaveY + 5, 6, base - eaveY - 8, "wood3");
    p.vline(x, eaveY + 5, base - eaveY - 8, "wood4").vline(x + 5, eaveY + 5, base - eaveY - 8, "wood1");
    p.rect(x - 1, base - 4, 8, 5, "stone4");
    p.hline(x - 1, base - 4, 8, "stone5").hline(x - 1, base, 8, "steel1");
  }
  // A brass lamp hung under the canopy's middle and a wind chime.
  p.vline(w / 2, eaveY + 5, 6, "steel2");
  block(p, w / 2 - 3, eaveY + 11, [".aa..", "abbc.", "bddc.", "bddc.", ".cc.."], { a: "gold4", b: "gold3", c: "gold1", d: "gold5" }, "canopyLamp");
  p.vline(w - 30, eaveY + 5, 10, "steel3");
  for (const dx of [-2, 0, 2]) p.vline(w - 30 + dx, eaveY + 15, 4 + Math.abs(dx), "bamboo3");
}

/** Granite steps up to the hall door, worn in the middle, moss in the end joints. */
function stoop(p: Px, w: number, h: number, seed: number): void {
  const steps = 3, sh = Math.floor(h / steps);
  for (let i = 0; i < steps; i++) {
    const y = i * sh, inset = (steps - 1 - i) * 4;
    p.rect(inset, y, w - 2 * inset, sh - 3, "stone4");
    p.hline(inset, y, w - 2 * inset, "stone5");
    p.ellipse(w / 2, y + (sh - 3) / 2, w / 5, Math.max(1, (sh - 3) / 2 - 1), "stone5");
    p.rect(inset, y + sh - 3, w - 2 * inset, 3, "stone3");
    p.hline(inset, y + sh - 1, w - 2 * inset, "stone2");
    p.vline(inset, y, sh, "stone5").vline(w - 1 - inset, y, sh, "stone2");
  }
  moss(p, 0, 0, 10, h, seed, 1);
  p.hline(0, h - 1, w, "steel1");
}

/** A doorstep: one granite slab, its top dished by feet, a riser in shade. */
function doorstep(p: Px, w: number, h: number, seed: number): void {
  p.rect(1, 0, w - 2, h - 5, "stone4");
  p.hline(1, 0, w - 2, "stone5");
  p.ellipse(w / 2, (h - 5) / 2, w / 4, Math.max(1, (h - 5) / 2 - 1), "stone5");
  p.rect(1, h - 5, w - 2, 4, "stone3");
  p.hline(1, h - 5, w - 2, "stone5").hline(1, h - 2, w - 2, "stone2").hline(0, h - 1, w, "steel1");
  p.vline(0, 0, h - 1, "stone2").vline(w - 1, 0, h - 1, "stone2");
  if (seed % 2) p.px(4 + (seed % 5), h - 4, "stone2").px(5 + (seed % 5), h - 4, "stone2");
  if (seed % 3 === 0) block(p, w - 9, 1, ["ab.", "bcd"], { a: "leaf4", b: "leaf3", c: "leaf2", d: "leaf1" }, "stepMoss");
}

// ── yard structures ─────────────────────────────────────────────────────────

/**
 * The bicycle shed: a lean-to of corrugated iron on timber posts against the back wall, open to the
 * yard so the bikes (their own sprites) show under the eave, a shadow under the roof. 224 × 128 plot,
 * rising 72.
 */
function bicycleShed(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, eaveY = base - 62, roofTop = 0;
  // Shade under the roof, over whatever stands inside.
  p.faded(0.28, (q) => q.rect(4, eaveY + 5, w - 8, base - eaveY - 8, "ink"));
  // Roof: corrugations running down the slope, rust from the bolts, a newer sheet, a lost tennis ball.
  for (let y = roofTop; y <= eaveY; y++) for (let x = 0; x < w; x++) {
    const k = x % 5, fy = (y - roofTop) / (eaveY - roofTop);
    const tone: Color[] = fy < 0.5 ? ["steel5", "steel4", "steel3", "steel2", "steel3"] : ["steel4", "steel4", "steel3", "steel2", "steel2"];
    p.px(x, y, x >= 120 && x < 150 ? (["steel6", "steel5", "steel4", "steel3", "steel4"] as Color[])[k] : tone[k]);
  }
  for (const ly of [roofTop + 44, roofTop + 92]) { p.hline(0, ly, w, "steel1"); p.hline(0, ly + 1, w, "steel5"); for (let x = 2; x < w; x += 10) p.px(x, ly + 3, "steel1"); }
  for (let i = 0; i < 16; i++) {
    const rx = 4 + Math.floor(hash(i, 1, seed) * (w - 8)), ry = 4 + Math.floor(hash(i, 2, seed) * (eaveY - 30)), len = 6 + Math.floor(hash(i, 3, seed) * 16);
    if (rx >= 120 && rx < 150) continue;
    for (let j = 0; j < len; j++) if (j < 3 || hash(i, j, seed) > 0.3) p.px(rx, ry + j, j < len / 3 ? "orange1" : j < (2 * len) / 3 ? "wood3" : "gold1");
  }
  block(p, 170, 60, [".ab.", "abbc", "bbcc", ".cc."], { a: "leaf5", b: "leaf4", c: "leaf3" }, "ball");
  moss(p, 4, eaveY - 20, 100, 14, seed, 2);
  p.hline(0, roofTop, w, "steel1").vline(0, roofTop, eaveY, "steel1").vline(w - 1, roofTop, eaveY, "steel1");
  // Front eave: the corrugation's wavy edge and a gutter.
  for (let x = 0; x < w; x++) p.px(x, eaveY + 1, x % 5 < 3 ? "steel2" : "steel1");
  p.rect(0, eaveY + 2, w, 3, "steel3");
  p.hline(0, eaveY + 2, w, "steel5").hline(0, eaveY + 4, w, "steel1");
  // Posts.
  for (const x of [2, Math.floor(w / 2) - 3, w - 8]) {
    p.rect(x, eaveY + 5, 6, base - eaveY - 5, "oak3");
    p.vline(x, eaveY + 5, base - eaveY - 5, "oak4").vline(x + 5, eaveY + 5, base - eaveY - 5, "oak1");
    p.hline(x, base, 6, "wood1");
  }
  // A cardboard notice on the middle post (blank) and a pump hanging from a nail.
  p.rect(Math.floor(w / 2) - 6, eaveY + 18, 12, 9, "oak5");
  p.frame(Math.floor(w / 2) - 6, eaveY + 18, 12, 9, "oak2");
  block(p, w - 16, eaveY + 14, ["a", "b", "b", "b", "c"], { a: "steel2", b: "steel4", c: "steel1" }, "pump");
}

/** The cats' ledge: a low concrete plinth in the shade, its top polished by fur, a saucer at one end. */
function catLedge(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, top = base - 18;
  p.rect(0, top, w, 7, "stone4");
  p.hline(0, top, w, "stone5");
  p.ellipse(w * 0.4, top + 3.5, w * 0.18, 2.5, "stone5");
  p.rect(0, top + 7, w, base - top - 7, "stone3");
  p.hline(0, top + 7, w, "stone5").hline(0, base, w, "steel1");
  for (let x = 12; x < w; x += 24) p.vline(x, top + 8, base - top - 9, "stone2");
  p.vline(0, top, base - top, "stone5").vline(w - 1, top, base - top, "stone2");
  block(p, w - 14, top + 1, [".aaab.", "acccdb", ".bbbb."], { a: "white", b: "steel4", c: "cream4", d: "steel5" }, "saucer");
  void seed;
}

/** A utility box: variant 0 the grey electric cabinet on its post, 1 the gas meter on its riser. */
function utilityBox(p: Px, w: number, h: number, variant: number): void {
  const base = h - 1, cx = Math.floor(w / 2);
  if (variant % 2 === 0) {
    p.rect(cx - 1, base - 12, 3, 13, "steel2");
    p.rect(1, base - 34, w - 2, 22, "steel4");
    p.hline(1, base - 34, w - 2, "steel5").vline(1, base - 34, 22, "steel5").vline(w - 2, base - 34, 22, "steel2").hline(1, base - 13, w - 2, "steel2");
    p.rect(4, base - 30, w - 8, 6, "cream4").frame(4, base - 30, w - 8, 6, "steel2");
    p.px(w - 5, base - 20, "steel1");
    p.vline(cx, 0, base - 34, "ink2");
  } else {
    p.vline(cx, 0, base, "gold2").vline(cx + 1, 0, base, "gold1");
    p.rect(2, base - 26, w - 4, 14, "steel5");
    p.hline(2, base - 26, w - 4, "steel6").vline(w - 3, base - 26, 14, "steel3").hline(2, base - 13, w - 4, "steel3");
    p.ellipse(cx, base - 19, 3, 3, "cream5");
    p.px(cx, base - 20, "ink2");
    block(p, cx - 2, base - 9, ["aaaaa", ".bcb."], { a: "red3", b: "red2", c: "steel4" }, "valve");
  }
  p.hline(0, base, w, "steel1");
}

/**
 * The rose arch onto the park path: two pairs of bamboo-and-iron legs (north pair behind, south pair in
 * front), a lattice top running between them over the path, roses climbing it. The path under it is
 * clear: only the legs stand on the ground.
 */
function roseArch(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, foot = h - 1 - 128, legH = 70, crown = 28;
  // Where the lattice crosses at plot row y (0..127 north to south): its screen row (it humps up mid-path).
  const topAt = (yy: number) => foot + yy - legH - Math.round(crown * Math.sin((Math.PI * yy) / 127));
  // North legs (behind).
  for (const x of [3, w - 5]) { p.vline(x, foot - legH, legH, "steel2"); p.vline(x + 1, foot - legH, legH, "bamboo2"); }
  // The lattice: two rails and cross bars, seen from above.
  for (let yy = 0; yy < 128; yy++) {
    const r = topAt(yy);
    p.px(3, r, "steel2").px(4, r, "bamboo3").px(w - 5, r, "steel2").px(w - 4, r, "bamboo2");
    if (yy % 10 === 0) p.hline(4, r, w - 8, "bamboo3");
    if (yy % 10 === 1) p.hline(4, r, w - 8, "bamboo1");
  }
  // Roses smother the lattice: a dense band of leaves along its whole run, blooms scattered through it,
  // trails hanging off both rails. Only a few bars still show.
  for (let yy = 0; yy < 128; yy += 2) {
    const r = topAt(yy);
    for (let x = 1; x < w - 1; x += 3) {
      const n = hash(x, yy, seed);
      if (n < 0.18 && yy % 10 < 2) continue;
      const dy = Math.floor(hash(x, yy, seed + 1) * 5) - 2;
      // Lit on the sunny west side of the arbour, shaded on the east.
      const lit = x < w / 2 - 2;
      p.rows(x - 1, r + dy, n > 0.6 ? [".ab", "abc"] : n > 0.3 ? ["ab.", "bcc"] : [".a.", "bcb"], lit ? { a: "leaf4", b: "leaf3", c: "leaf2" } : { a: "leaf3", b: "leaf2", c: "leaf1" });
    }
    if (yy % 6 === 0) for (const x of [1, w - 4]) p.rows(x, r + 2, ["ab", "bc", ".c"], { a: "leaf3", b: "leaf2", c: "leaf1" });
  }
  for (let i = 0; i < 46; i++) {
    const yy = Math.floor(hash(i, 1, seed) * 126), r = topAt(yy) + Math.floor((hash(i, 3, seed) - 0.5) * 6);
    const x = 2 + Math.floor(hash(i, 4, seed) * (w - 7));
    const pale = hash(i, 5, seed) > 0.6;
    p.rows(x, r, [".ab.", "abba", ".bc."], pale ? { a: "pink3", b: "cream5", c: "leaf2" } : { a: "pink2", b: "pink3", c: "leaf2" });
  }
  // South legs (in front) with roses twining up them.
  for (const x of [3, w - 5]) {
    p.vline(x, base - legH, legH + 1, "steel2"); p.vline(x + 1, base - legH, legH + 1, "bamboo3");
    for (let y = base - legH; y < base; y += 7) p.rows(x - 1 + ((y >> 3) % 2) * 2, y, ["ab", ".c"], { a: "leaf4", b: "leaf3", c: "leaf2" });
    p.rect(x - 1, base - 2, 4, 3, "stone3");
  }
  p.rows(1, base - legH + 10, [".a.", "aba", ".c."], { a: "pink2", b: "gold4", c: "leaf2" });
}

// ── sprites ─────────────────────────────────────────────────────────────────

const LONG: Record<string, "east" | "west"> = { "courtyard.west-row": "east", "courtyard.east-home": "west" };

function houseSprite(prop: MapProp): SpriteDef {
  const yard = LONG[prop.id];
  if (yard) return sprite(prop, 0, (p, w, h) => longHome(p, prop, w, h, yard));
  if (FRONTS[prop.id]) return sprite(prop, RISE[prop.id] ?? 0, (p, w, h) => frontHome(p, prop, w, h));
  // Any row house added later: a front home with one door in the middle.
  return sprite(prop, Math.max(0, 160 - footprintPx(prop).h), (p, w, h) => {
    FRONTS[prop.id] = {
      F: 112, groundH: 70, ridgeY: 12,
      doors: [{ cx: Math.round(w / 2), w: 40, lacquer: "black", pediment: "plain", doorH: 58 }],
      windows: [[24, 12, 22, 26, "shutters"], [w - 46, 12, 22, 26, "curtain"]],
      life: () => {}, roof: () => {},
    };
    frontHome(p, prop, w, h);
  });
}

/** The window prop's own sprite: the same window, placed on the wall of the house it belongs to. */
function windowSprite(prop: MapProp): SpriteDef {
  const house = props("row-house").find((hs) => windowsOn(hs).some((w) => w.id === prop.id));
  const houseBase = house ? house.position.y + house.height : prop.position.y + prop.height;
  // Rows from the window sprite's bottom up to the wall's foot (negative: the foot is below the sprite).
  const offset = px(prop.position.y + prop.height - houseBase);
  return sprite(prop, 80, (p, w, h) => {
    const base = h - 1 - offset;
    p.clip(0, 0, w, h, () => wallWindow(p, prop, 0, base));
  });
}

export default defineSprites(Object.fromEntries([
  ...props("row-house").map((p) => [propSpriteId(MAP, p.id), houseSprite(p)] as const),
  ...props("window").map((p) => [propSpriteId(MAP, p.id), windowSprite(p)] as const),
  ...props("boundary-wall").map((p, i) => [propSpriteId(MAP, p.id), sprite(p, 54, (q, w, h) => boundaryWall(q, w, h, 7 + i, p.position.x < 21 ? "right" : "left"))] as const),
  ...props("entry-gate").map((p) => [propSpriteId(MAP, p.id), sprite(p, 110, (q, w, h) => entryGate(q, w, h, 3))] as const),
  ...props("doorway").map((p) => [propSpriteId(MAP, p.id), sprite(p, 48, (q, w, h) => hallDoorway(q, w, h, 5))] as const),
  ...props("canopy").map((p) => [propSpriteId(MAP, p.id), sprite(p, 66, (q, w, h) => hallCanopy(q, w, h, 9))] as const),
  ...props("stoop").map((p) => [propSpriteId(MAP, p.id), sprite(p, 0, (q, w, h) => stoop(q, w, h, 2))] as const),
  ...props("doorstep").map((p, i) => [propSpriteId(MAP, p.id), sprite(p, 0, (q, w, h) => doorstep(q, w, h, i * 7 + p.variant))] as const),
  ...props("bicycle-shed").map((p) => [propSpriteId(MAP, p.id), sprite(p, 72, (q, w, h) => bicycleShed(q, w, h, 6))] as const),
  ...props("ledge").map((p) => [propSpriteId(MAP, p.id), sprite(p, 6, (q, w, h) => catLedge(q, w, h, 4))] as const),
  ...props("utility-box").map((p) => [propSpriteId(MAP, p.id), sprite(p, 18, (q, w, h) => utilityBox(q, w, h, p.variant))] as const),
  ...props("garden-arch").map((p) => [propSpriteId(MAP, p.id), sprite(p, 100, (q, w, h) => roseArch(q, w, h, 8))] as const),
]));
