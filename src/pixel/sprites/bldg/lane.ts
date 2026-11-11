/**
 * The town's lane houses: shikumen residences, row houses and the pump house, one sprite per map prop
 * (`town/<id>`), each exactly its footprint (contract: docs/design/pixel-contracts.md). The front facade
 * is the bottom 3–5 tiles; the roof seen from above fills the rest. Doors sit where `openingsOn` says.
 *
 * The parts live in `_lane.ts`; each building here is a short composition with its own story.
 */
import { defineSprites, hash, TILE, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, openingsOn, townProps, townSpriteId, type TownProp } from "../../town/map.ts";
import {
  acUnit, aerial, basePot, birdcage, block, brickedWindow, bricks, castShadow, chimney, downpipe, homeSign, hoseReel, meterCluster,
  paintedRepair, satelliteDish, stoolAndBasin, wallBicycle, wornPatch, type Lacquer, eave, facadeShell, laneRoof, laneWindow, laundryPole, meterBox, moss,
  numberPlate, partyWall, pigeonLoft, quiltRack, renderPatch, roofGarden, sillPlants, skylight, solarHeater,
  RED_BRICK, shadowWedge, stain, stoneGate, stringCourse, tarp, tigerWindow, waterTank, type GateOptions, type Pediment,
} from "./_lane.ts";

type Draw = (p: Px, prop: TownProp, w: number, h: number) => void;

/** The door opening on the prop's bottom edge, from the map's exits, or a fallback centred at `cx`. */
function doorOf(prop: TownProp, cx: number, width: number): { x0: number; x1: number; open: boolean } {
  const door = openingsOn(prop).find((o) => o.kind === "door");
  return door ? { x0: door.x0, x1: door.x1, open: true } : { x0: cx - width / 2, x1: cx + width / 2, open: false };
}

// ── the big residence ───────────────────────────────────────────────────────

/**
 * 敦和里 No. 1, the lane's grandest house, 13×11 tiles. Built 1924 for a silk merchant, now home to
 * four families. Two brick wings flank a gate wall; behind the wall the main house's timber upper
 * storey (long casements, a bamboo pole of washing) sits back under the big roof. The left gate leaf
 * stands open (the scene adds the leaf), showing the sunlit courtyard. On the roof: a tiger window
 * where the Wangs' son sleeps, a tarp over last summer's leak, a skylight, and at the back the shared
 * sun terrace with the quilt rack, the scallion boxes and the water tank.
 */
const residence: Draw = (p, prop, W, H) => {
  const seed = prop.variant * 31 + 7;
  const F = 160, top = H - F, base = H - 1;
  const door = doorOf(prop, 240, 64);
  const gateL = 152, gateR = 328;
  const wallTop = base - 92;

  // Wings and the recessed centre.
  facadeShell(p, 0, top, W, base, { seed, groundH: 96, quoins: true });
  // The main house's upper storey behind the gate wall: a timber front of long casements.
  timberFront(p, gateL, top + 4, gateR - gateL, wallTop - (top + 4), seed);
  // The left wing throws a shadow on the recessed front; the right wing's side catches the sun.
  for (let yy = top + 4; yy < wallTop; yy++) for (let i = 0; i < 5; i++) if (i < 3 || (yy + i) % 2) p.px(gateL + i, yy, i === 0 ? "ink" : "wood1");
  p.vline(gateR - 1, top + 4, wallTop - top - 4, "stone4");
  // The gate wall: brick, a pantile coping along its top, the stone gate.
  bricks(p, gateL, wallTop + 4, gateR - gateL, base - wallTop - 10, seed + 3);
  p.rect(gateL, wallTop - 3, gateR - gateL, 3, "stone4");
  p.hline(gateL, wallTop - 3, gateR - gateL, "stone5");
  eave(p, gateL, wallTop, gateR - gateL, 2);
  stoneGate(p, door.x0, door.x1, base, { doorH: 68, pediment: "triangle", open: door.open ? "left" : null, couplets: true, seed });
  numberPlate(p, door.x1 + 12, base - 58);
  meterCluster(p, gateR - 34, base - 66, wallTop + 2);
  // Bicycles lean left of the gate every night: the brick is rubbed dark and a pale scrape at handlebar height.
  wornPatch(p, gateL + 12, base - 34, 30, 26, seed);
  for (let x = gateL + 14; x < gateL + 40; x++) if (hash(x, 1, seed) > 0.3) p.px(x, base - 26, "stone4");
  stoolAndBasin(p, door.x0 - 30, base - 1);
  basePot(p, door.x1 + 10, base - 1);
  p.vline(gateL, wallTop - 3, base - wallTop + 3, "steel1").vline(gateR - 1, wallTop - 3, base - wallTop + 3, "steel1");

  // Left wing: barred kitchen windows below; above, a caged window full of plants and a shuttered one.
  laneWindow(p, 24, base - 70, 26, 34, { seed, bars: true, glass: "dark", sill: "jar" });
  laneWindow(p, 98, base - 70, 26, 34, { seed: seed + 1, shutters: "open", shutterTone: "wood", glass: "curtain", curtain: "cream", sill: "plain" });
  laneWindow(p, 24, top + 14, 26, 36, { seed: seed + 2, cage: true, glass: "curtain", curtain: "plum", frame: "wood" });
  laneWindow(p, 100, top + 14, 26, 36, { seed: seed + 3, shutters: "open", shutterTone: "jade", glass: "sky", sill: "plants", ajar: true });
  acUnit(p, 60, top + 26, seed, [84, top + 18]);
  paintedRepair(p, 58, base - 44, 18, 13, seed);
  hoseReel(p, 132, base - 46);
  // Right wing: one window each floor; the downpipe from the eave gutter at the corner.
  laneWindow(p, 360, base - 70, 24, 34, { seed: seed + 4, bars: true, glass: "dark", sill: "shoes" });
  laneWindow(p, 358, top + 14, 26, 36, { seed: seed + 5, shutters: "half", shutterTone: "wood", glass: "curtain", curtain: "pink", sill: "plants" });
  downpipe(p, gateR + 3, top + 4, base);
  downpipe(p, W - 8, top + 4, base);
  stain(p, W - 22, top + 6, 4, 30);

  // Roof: the back terrace, the short north slope, the ridge, the long south slope to the lane.
  const roofH = top + 4, ridgeY = 72;
  laneRoof(p, 0, 0, W, roofH, { seed, ridgeY, mend: [224, 150, 32, 18] });
  // Fire walls between the wings and the main house run down the slope from the ridge.
  for (const x of [gateL - 2, gateR - 2]) { partyWall(p, x, ridgeY + 6, roofH - ridgeY - 11); castShadow(p, x + 5, ridgeY + 6, 3, roofH - ridgeY - 11, 0); }
  moss(p, 8, roofH - 34, 140, 26, seed, 4);
  moss(p, 300, ridgeY + 10, 100, 30, seed + 1, 2);
  moss(p, 8, 6, 140, ridgeY - 10, seed + 2, 3);
  tigerWindow(p, 56, ridgeY + 30, seed, { plant: true, w: 40 });
  tigerWindow(p, 334, ridgeY + 30, seed + 1, { w: 36, frame: "jade3", curtain: "cream4" });
  tarp(p, 176, ridgeY + 66, 36, 18, seed);
  skylight(p, 262, ridgeY + 34, 22, 16);
  aerial(p, 120, ridgeY - 6);
  // The shared sun terrace (晒台) at the back.
  sunTerrace(p, 168, 0, W - 168, ridgeY - 12, seed);
};

/**
 * The main house's upper front behind a gate wall: a timber frame of long casements (长窗) with a
 * lattice head in each, a bamboo pole of washing along it, a strip of shadow under the eave.
 */
function timberFront(p: Px, x: number, y: number, w: number, h: number, seed: number): void {
  p.rect(x, y, w, h, "wood2");
  p.hline(x, y, w, "wood1").hline(x, y + 1, w, "wood1");
  const n = Math.round(w / 28), lw = Math.floor((w - 8) / n);
  for (let i = 0; i < n; i++) {
    const lx = x + 4 + i * lw;
    // Casement: frame, a lattice head (a cracked-ice pattern), glass below.
    p.rect(lx, y + 6, lw - 2, h - 10, "wood3");
    p.vline(lx, y + 6, h - 10, "wood4").vline(lx + lw - 3, y + 6, h - 10, "wood1");
    const gx = lx + 2, gw = lw - 6;
    p.rect(gx, y + 8, gw, 12, "wood1");
    for (let k = 0; k < gw; k += 4) p.line(gx + k, y + 8, Math.min(gx + gw - 1, gx + k + 3), y + 19, "wood4");
    for (let k = 3; k < gw; k += 5) p.line(gx + k, y + 19, Math.max(gx, gx + k - 4), y + 9, "wood3");
    p.rect(gx, y + 22, gw, h - 28, "blue2");
    for (let j = 0; j < h - 28; j++) for (let k = 0; k < gw; k++) if (j + k * 0.7 < 6) p.px(gx + k, y + 22 + j, "blue4"); else if (j + k * 0.7 < 10) p.px(gx + k, y + 22 + j, "blue3");
    p.hline(gx, y + 21, gw, "wood3");
    // Some casements are open a crack, some have a curtain.
    if (hash(i, 4, seed) > 0.6) for (let j = y + 22; j < y + h - 6; j++) if (j % 3) p.px(gx + gw - 3, j, "cream4");
  }
  // A bamboo pole across the front, propped on iron hooks, today's washing on it.
  laundryPole(p, x + 10, y + 26, w - 20, seed + 5, ["vest", "pillow", "trousers", "shirt", "socks", "towel", "vest"]);
}

/**
 * A flat concrete sun terrace behind the roof: a low parapet round it, the north slope dropping onto
 * its south edge. On it the stair house with its door, the quilt rack, the scallion boxes, the water
 * tank, a folding chair somebody reads in, and a washing line.
 */
function sunTerrace(p: Px, x: number, y: number, w: number, h: number, seed: number): void {
  p.rect(x, y, w, h, "stone4");
  // Screeded concrete in bays, a few hairline cracks, damp under the tank.
  for (let yy = y + 14; yy < y + h; yy += 16) p.hline(x, yy, w, "stone3");
  for (let xx = x + 26; xx < x + w; xx += 32) p.vline(xx, y, h, "stone3");
  for (let i = 0; i < 4; i++) {
    let cx = x + 10 + Math.floor(hash(i, 1, seed) * (w - 20));
    for (let yy = y + 6 + i * 9; yy < y + 12 + i * 9; yy++) { p.px(cx, yy, "stone3"); cx += hash(yy, i, seed) > 0.5 ? 1 : 0; }
  }
  // Parapet: the back wall's coping along the top, the west wall down the left side.
  p.rect(x, y, w, 4, "stone3");
  p.hline(x, y, w, "stone5").hline(x, y + 1, w, "stone4").hline(x, y + 4, w, "steel2");
  p.rect(x, y, 4, h, "stone4");
  p.vline(x, y, h, "steel1").vline(x + 1, y, h, "stone5").vline(x + 4, y + 4, h - 4, "steel2");
  // The stair house: a brick box with its own little roof and a plank door onto the terrace.
  const sx = x + 8, sw = 40;
  bricks(p, sx, y + 16, sw, h - 18, seed);
  p.rect(sx - 1, y + 4, sw + 2, 13, "steel3");
  for (let xx = sx - 1; xx < sx + sw + 1; xx++) for (let yy = y + 4; yy < y + 17; yy++) {
    const k = (xx & 7);
    p.px(xx, yy, k === 0 ? "steel4" : k < 3 ? "steel3" : k === 7 ? "steel1" : "steel2");
  }
  p.hline(sx - 1, y + 4, sw + 2, "steel5").hline(sx - 1, y + 17, sw + 2, "steel1");
  p.rect(sx + 12, y + 22, 14, h - 24, "oak2");
  for (let xx = sx + 14; xx < sx + 26; xx += 4) p.vline(xx, y + 22, h - 24, "oak1");
  p.vline(sx + 12, y + 22, h - 24, "oak3").px(sx + 23, y + 34, "steel4");
  p.vline(sx, y + 16, h - 18, "steel1").vline(sx + sw - 1, y + 16, h - 18, "steel1");
  // Washing line from the stair house to the tank stand, with a sheet and towels.
  p.line(sx + sw, y + 20, x + w - 34, y + 14, "steel2");
  block(p, sx + sw + 8, y + 20, ["aaaaaaaaaa", "abbbbbbbba", "abbbbbbbbc", "abbbbbbbbc", "abbbbbbbbc", "abbbbbbbbc", "abbbbbbbbc", ".bbbbbbbcc", ".c.cc.c.c."], { a: "white", b: "cream5", c: "cream3" }, "sheet");
  quiltRack(p, sx + sw + 28, y + 14, 50, "peony");
  roofGarden(p, x + w - 72, y + h - 18);
  // A folding chair and the stool its feet go on.
  block(p, sx + sw + 4, y + h - 16, ["aaaab", "accab", "accab", "abbbb", "a...b", "a...b"], { a: "jade3", b: "jade1", c: "jade5" }, "chair");
  waterTank(p, x + w - 32, y + 6, seed);
}

// ── the south residence ─────────────────────────────────────────────────────

/**
 * 敦和里 No. 9, 13×12 tiles: a symmetrical house of 1931, three bays, the gate in an oxblood-lacquered
 * arch. A retired teacher keeps pigeons on the roof; the solar heater was the son-in-law's idea. Its
 * upper bays have a cast-iron balcony on the left and a cage on the right; red-brick quoins.
 */
const southResidence: Draw = (p, prop, W, H) => {
  const seed = prop.variant * 31 + 7;
  const F = 160, top = H - F, base = H - 1;
  const door = doorOf(prop, W / 2, 56);
  facadeShell(p, 0, top, W, base, { seed, groundH: 96, quoins: true, bandCourses: 3 });
  stoneGate(p, door.x0, door.x1, base, { doorH: 68, pediment: "arch", lacquer: "oxblood", seed });
  numberPlate(p, door.x0 - 22, base - 58);
  // Ground floor: two windows each side, barred; a bench of potted plants by the gate.
  for (const [x, i] of [[40, 0], [108, 1], [W - 64, 2], [W - 132, 3]] as const)
    laneWindow(p, x, base - 72, 24, 34, { seed: seed + i, bars: i !== 1, shutters: i === 1 ? "open" : null, shutterTone: "blue", glass: i % 2 ? "curtain" : "dark", curtain: "jade", sill: i === 2 ? "jar" : "plain" });
  sillPlants(p, door.x1 + 12, base - 6, 34, seed + 4);
  wornPatch(p, door.x0 - 40, base - 34, 28, 26, seed);
  stoolAndBasin(p, 76, base - 1);
  hoseReel(p, 12, base - 48);
  meterCluster(p, W - 104, base - 70, base - 92);
  basePot(p, W - 40, base - 1);
  paintedRepair(p, 140, base - 30, 16, 11, seed + 3);
  // Upper storey: a French window onto a cast-iron balcony, a centre window over the gate, a caged window.
  laneWindow(p, 62, top + 14, 30, 44, { seed: seed + 5, shutters: "open", shutterTone: "blue", glass: "curtain", curtain: "cream", frame: "cream" });
  balcony(p, 46, top + 54, 62, seed);
  laneWindow(p, W / 2 - 13, top + 14, 26, 32, { seed: seed + 6, shutters: "closed", shutterTone: "wood" });
  laneWindow(p, W - 92, top + 14, 28, 36, { seed: seed + 7, cage: true, glass: "sky", frame: "cream" });
  laneWindow(p, 146, top + 14, 24, 34, { seed: seed + 8, glass: "sky", sill: "plants", ajar: true, frame: "cream" });
  laneWindow(p, W - 172, top + 14, 24, 34, { seed: seed + 9, shutters: "half", shutterTone: "blue", glass: "dark", sill: "plants" });
  acUnit(p, W - 132, top + 58, seed + 1, [W - 110, top + 40]);
  laundryPole(p, W - 102, top + 64, 64, seed, ["trousers", "shirt", "shirt", "socks"]);
  downpipe(p, 4, top + 4, base);
  downpipe(p, W - 8, top + 4, base);

  // Above the facade: a short front roof, then the third storey set back behind it, then the main roof.
  const mainH = 148, ridgeY = 52, upperTop = mainH - 4, frontTop = 190;
  setbackStorey(p, 0, upperTop, W, frontTop - upperTop, seed);
  laneRoof(p, 0, frontTop - 2, W, top + 4 - (frontTop - 2), { seed: seed + 9, ridgeY: 0, damp: 0.1 });
  p.hline(0, frontTop - 2, W, "steel4").hline(0, frontTop - 1, W, "steel2");
  laneRoof(p, 0, 0, W, mainH, { seed: seed + 2, ridgeY, damp: 0.12 });
  moss(p, 8, mainH - 30, W - 16, 22, seed, 5);
  moss(p, 8, frontTop + 4, W - 16, 24, seed + 3, 4);
  tigerWindow(p, 90, ridgeY + 18, seed, { open: true, w: 36 });
  tigerWindow(p, W - 128, ridgeY + 18, seed + 1, { plant: true, frame: "jade3", w: 36 });
  castShadow(p, 214, 74, 5, 26, 0.4);
  solarHeater(p, 174, 70);
  castShadow(p, W - 48, 24, 5, 26, 0.3);
  pigeonLoft(p, W - 78, 18);
  // The teacher's pigeons leave their mark on the slope below the loft.
  for (const [dx, dy] of [[-6, 34], [4, 40], [14, 38], [-2, 44], [20, 46]] as const) p.px(W - 64 + dx, 18 + dy, "white");
  sunTerrace(p, 0, 0, 150, ridgeY - 8, seed + 4);
};

/**
 * A third storey set back behind the front roof: lime render gone the colour of weak tea, a row of
 * small casements, a loggia of potted plants, an AC unit, and a quilt over a rail. (x, y) w × h.
 */
function setbackStorey(p: Px, x: number, y: number, w: number, h: number, seed: number): void {
  p.rect(x, y, w, h, "cream3");
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (hash(xx >> 2, yy >> 3, seed) > 0.8) p.px(xx, yy, "cream2");
  p.hline(x, y, w, "cream2").hline(x, y + h - 1, w, "cream2");
  const n = 6, step = Math.floor((w - 40) / n);
  for (let i = 0; i < n; i++) {
    const wx = x + 24 + i * step;
    if (i === 2) {
      // The loggia: an open bay with a balustrade and the plants of whoever lives up here.
      p.rect(wx - 4, y + 7, 34, h - 9, "wood1");
      p.rect(wx - 2, y + 9, 30, h - 13, "ink2");
      for (let xx = wx - 2; xx < wx + 28; xx += 4) p.vline(xx, y + h - 12, 9, "cream4");
      p.hline(wx - 4, y + h - 13, 34, "cream5").hline(wx - 4, y + h - 3, 34, "cream2");
      sillPlants(p, wx - 2, y + h - 14, 30, seed + 7);
      continue;
    }
    laneWindow(p, wx, y + 9, 18, h - 16, {
      seed: seed + i, frame: "cream", glass: i % 3 === 0 ? "curtain" : "sky", curtain: (["cream", "pink", "jade"] as const)[i % 3],
      shutters: i === 4 ? "closed" : null, shutterTone: "wood", sill: i === 1 ? "plants" : "plain",
    });
  }
  // A quilt thrown over the loggia rail? No: over the last window's sill, airing.
  const qx = x + 24 + 5 * step - 4;
  p.rect(qx, y + h - 8, 26, 7, "jade4");
  p.hline(qx, y + h - 8, 26, "jade5").hline(qx, y + h - 2, 26, "jade2");
  for (let k = 2; k < 26; k += 5) p.vline(qx + k, y + h - 7, 5, "jade3");
  acUnit(p, x + w - 30, y + 14, seed + 3);
  stain(p, x + 6, y + 2, 6, h - 4);
  p.vline(x, y, h, "steel1").vline(x + w - 1, y, h, "steel1");
}

/** A shallow cast-iron balcony seen from the front: a lit slab, curled railings, a pot or two. */
function balcony(p: Px, x: number, y: number, w: number, seed: number): void {
  // Slab top seen from above, then its front edge.
  p.rect(x, y, w, 4, "stone4").hline(x, y, w, "stone5");
  p.rect(x, y + 4, w, 3, "stone3").hline(x, y + 7, w, "steel1");
  for (const bx of [x + 6, x + w - 9]) block(p, bx, y + 8, ["aab", ".ab", "..b"], { a: "stone4", b: "steel2" }, "corbel");
  sillPlants(p, x + 4, y + 3, w - 8, seed + 9);
  // Railing: posts and a scroll in each panel.
  const ry = y - 14;
  p.hline(x, ry, w, "steel3").hline(x, ry + 1, w, "ink");
  for (let xx = x; xx < x + w; xx += 8) {
    p.vline(xx, ry, 15, "ink");
    if (xx + 8 <= x + w) block(p, xx + 1, ry + 4, [".aa...", "a..a..", "a.aa..", ".a..a.", "....a.", "...aa.", "......"].map((r) => r + "."), { a: "ink" }, "scroll");
  }
  p.vline(x + w - 1, ry, 15, "ink");
}

// ── row houses ──────────────────────────────────────────────────────────────

type BayStyle = {
  pediment: Pediment;
  lacquer?: GateOptions["lacquer"];
  shutterTone: "jade" | "wood" | "blue" | "cream";
  /** What the bay is known for. */
  story: "cage" | "ac" | "quilt" | "ivy" | "studio" | "plain" | "laundry";
};

/**
 * A row of two-storey shikumen bays sharing one roof, 128px a bay: a gate per bay, two upper windows,
 * party walls up the roof between bays. `bays` sets each bay's character.
 */
function rowHouses(p: Px, prop: TownProp, W: number, H: number, bays: readonly BayStyle[], roof: (p: Px, roofH: number, bayW: number) => void): void {
  const seed = prop.variant * 31 + 7;
  const F = 128, top = H - F, base = H - 1;
  const bayW = Math.floor(W / bays.length);
  facadeShell(p, 0, top, W, base, { seed, groundH: 84, quoins: false });
  bays.forEach((bay, i) => {
    const bx = i * bayW, bw = i === bays.length - 1 ? W - bx : bayW, cx = bx + Math.floor(bw / 2);
    const s = seed + i * 13;
    const doorW = 44;
    // Pilaster at the party wall: a thin projecting brick pier with red quoins.
    if (i > 0) {
      p.rect(bx - 2, top + 4, 4, F - 5, "steel3");
      p.vline(bx - 2, top + 4, F - 5, "steel4").vline(bx + 1, top + 4, F - 5, "steel1");
      for (let yy = top + 8; yy < base - 8; yy += 8) p.hline(bx - 2, yy, 4, (yy >> 3) & 1 ? "rose3" : "stone3");
    }
    const wy = top + 12, ww = 22, wh = 28;
    const story = bay.story;
    const left = bx + 10, right = bx + bw - 10 - ww;
    laneWindow(p, left, wy, ww, wh, {
      seed: s, shutters: story === "studio" ? null : "open", shutterTone: bay.shutterTone,
      glass: story === "plain" ? "dark" : "curtain", curtain: (["cream", "plum", "jade", "pink"] as const)[i % 4],
      sill: "plants", cage: story === "cage",
    });
    laneWindow(p, right, wy, ww, wh, {
      seed: s + 1, shutters: story === "studio" ? null : i % 2 ? "half" : "closed", shutterTone: bay.shutterTone,
      glass: "sky", sill: story === "laundry" ? "plain" : "plants", ajar: story === "quilt",
    });
    // Ground-floor kitchen window, barred, beside the gate.
    laneWindow(p, i % 2 ? right + 2 : left + 2, base - 54, 18, 22, { seed: s + 2, bars: true, glass: i % 2 ? "dark" : "curtain", curtain: "cream", sill: i % 3 ? "jar" : "plain" });
    if (story === "studio") studioWindow(p, bx + 42, top + 10, bw - 84, 22);
    stoneGate(p, cx - doorW / 2, cx + doorW / 2, base, { doorH: 62, pediment: bay.pediment, lacquer: bay.lacquer, seed: s });
    if (story === "ac") acUnit(p, cx - 11, top + 18, s, [left + ww, top + 20]);
    if (story === "quilt") {
      // A quilt hung out over the sill to air, the morning routine.
      const qx = right - 2, qw = ww + 4;
      p.rect(qx, wy + wh - 4, qw, 22, "pink2");
      p.hline(qx, wy + wh - 4, qw, "pink3").hline(qx, wy + wh - 3, qw, "pink3");
      for (let k = 0; k < qw; k += 6) block(p, qx + 1 + k, wy + wh + 3 + ((k / 6) % 2) * 6, [".a.", "aba", ".a."], { a: "pink1", b: "gold4" }, "quiltFlower");
      p.vline(qx + qw - 1, wy + wh - 2, 20, "pink1");
      for (let k = 0; k < qw; k++) if ((k * 7) % 5 < 2) p.px(qx + k, wy + wh + 18, "pink1");
    }
    if (story === "laundry") laundryPole(p, bx + 10, top + 50, bw - 20, s, ["towel", "trousers", "vest", "socks", "shirt"]);
    if (story === "ivy") ivy(p, bx + 2, top + 6, 40, F - 12, s);
  });
  downpipe(p, 3, top + 4, base);
  downpipe(p, W - 7, top + 4, base);
  const roofH = top + 4;
  laneRoof(p, 0, 0, W, roofH, { seed, ridgeY: 12, damp: 0.1 });
  for (let i = 1; i < bays.length; i++) partyWall(p, i * bayW - 2, 0, roofH - 5);
  moss(p, 6, roofH - 22, W - 12, 16, seed, Math.floor(W / 40));
  roof(p, roofH, bayW);
}

/** Ivy climbing a brick corner, w × h from (x, y): thick at the foot, thinning up the wall. */
function ivy(p: Px, x: number, y: number, w: number, h: number, seed: number): void {
  for (let i = 0; i < Math.floor((w * h) / 30); i++) {
    const t = hash(i, 1, seed);
    const yy = y + h - Math.floor(Math.sqrt(t) * h);
    const spread = Math.floor(((yy - y) / h) * w * 0.9) + 6;
    const xx = x + Math.floor(hash(i, 2, seed) * spread);
    block(p, xx, yy, ["ab.", "bcd", ".d."], { a: "leaf4", b: "leaf3", c: "leaf2", d: "leaf1" }, "ivyLeaf");
  }
  // The woody stems where they show.
  p.line(x + 2, y + h, x + 6, y + Math.floor(h * 0.4), "wood2");
  p.line(x + 6, y + Math.floor(h * 0.6), x + 18, y + Math.floor(h * 0.3), "wood2");
}

/** A wide steel-framed studio window, many small panes, one pane replaced with a board. */
function studioWindow(p: Px, x: number, y: number, w: number, h: number): void {
  p.rect(x - 2, y - 3, w + 4, 3, "stone4").hline(x - 2, y - 3, w + 4, "stone5");
  p.rect(x, y, w, h, "steel1");
  for (let j = 0; j < h - 2; j++) for (let i = 0; i < w - 2; i++) {
    const t = j / h + (i / w) * 0.6;
    p.px(x + 1 + i, y + 1 + j, t < 0.3 ? "blue5" : t < 0.7 ? "blue4" : "blue3");
  }
  for (let xx = x + 1; xx < x + w - 1; xx += 7) p.vline(xx, y, h, "steel1");
  for (let yy = y + 1; yy < y + h - 1; yy += 8) p.hline(x, yy, w, "steel1");
  p.vline(x + w - 1, y, h, "steel1").hline(x, y + h - 1, w, "steel1");
  // One pane boarded where a football went through it.
  p.rect(x + 15, y + 18, 6, 7, "oak3");
  p.hline(x + 15, y + 18, 6, "oak4").px(x + 16, y + 20, "oak1").px(x + 19, y + 23, "oak1");
  // Hanging plants inside.
  block(p, x + 4, y + 2, ["..a..", ".aba.", "abcba", ".c.c.", ".c..c", "....c"], { a: "leaf4", b: "leaf3", c: "leaf2" }, "hanging");
  p.rect(x - 3, y + h, w + 6, 3, "stone4").hline(x - 3, y + h, w + 6, "stone5").hline(x - 2, y + h + 3, w + 4, "steel2");
}

/**
 * North Row (北排), 敦和里 Nos. 2–4: three bays, 12×6 tiles. No. 2 has the AC and its drip stain,
 * No. 3 airs the family quilt every fine morning, No. 4's grandmother grows everything in a cage.
 */
const northRow: Draw = (p, prop, W, H) => rowHouses(p, prop, W, H, [
  { pediment: "triangle", shutterTone: "jade", story: "ac" },
  { pediment: "scroll", shutterTone: "wood", story: "quilt", lacquer: "oxblood" },
  { pediment: "arch", shutterTone: "blue", story: "cage" },
], (q, roofH, bayW) => {
  const seed = prop.variant * 31;
  tigerWindow(q, bayW + 52, roofH - 34, seed, { plant: true });
  solarHeater(q, 2 * bayW + 30, roofH - 34);
  aerial(q, 40, roofH - 30);
  tarp(q, 20, roofH - 26, 26, 12, seed);
});

/**
 * The linen house, Nos. 6–7, 8×6 tiles: where the lane's washing gets done. Two bays, poles on both,
 * a stain where the old copper boiler vented, an ivy corner on the right.
 */
const linenHouse: Draw = (p, prop, W, H) => rowHouses(p, prop, W, H, [
  { pediment: "scroll", shutterTone: "cream", story: "laundry" },
  { pediment: "triangle", shutterTone: "jade", story: "ivy" },
], (q, roofH, bayW) => {
  quiltRack(q, 14, roofH - 34, 50, "check");
  skylight(q, bayW + 54, roofH - 32, 18, 12);
  q.rect(bayW + 20, roofH - 30, 8, 14, "rose3");
  q.hline(bayW + 20, roofH - 30, 8, "rose4").vline(bayW + 27, roofH - 30, 14, "rose2").hline(bayW + 20, roofH - 17, 8, "rose1");
  q.rect(bayW + 21, roofH - 30, 6, 2, "ink");
  // Soot round the old boiler flue.
  for (let k = 0; k < 10; k++) q.px(bayW + 19 + Math.floor(hash(k, 1, 2) * 10), roofH - 33 - Math.floor(hash(k, 2, 2) * 4), "steel1");
});

/**
 * The south studio, 9×6 tiles: two bays knocked into one painter's studio upstairs in the 1980s, the
 * steel window and a row of north-light skylights to prove it; ivy has the left corner.
 */
const southStudio: Draw = (p, prop, W, H) => rowHouses(p, prop, W, H, [
  { pediment: "arch", shutterTone: "wood", story: "studio" },
  { pediment: "scroll", shutterTone: "jade", story: "ivy", lacquer: "oxblood" },
], (q, roofH) => {
  for (let i = 0; i < 3; i++) skylight(q, 30 + i * 30, roofH - 38, 20, 16);
  aerial(q, W - 40, roofH - 26);
});

// ── the pump house ──────────────────────────────────────────────────────────

/**
 * The pump house, 6×9 tiles: the lane's water since 1934. A rendered brick box with a steel door
 * gone from jade to grey where hands push it, a louvred vent, the rising main with its valve wheel;
 * over it a lean-to of corrugated iron, rust-streaked and bolted; behind, the round cistern on its pad
 * with a ladder and the inlet pipe arching over the roof.
 */
const pumpHouse: Draw = (p, prop, W, H) => {
  const seed = prop.variant * 31 + 7;
  const F = 96, top = H - F, base = H - 1;
  // Cistern yard at the back: a concrete pad with a kerb.
  const padH = 104;
  p.rect(0, 0, W, padH, "stone4");
  for (let yy = 10; yy < padH; yy += 22) p.hline(0, yy, W, "stone3");
  for (let xx = 30; xx < W; xx += 48) p.vline(xx, 0, padH, "stone3");
  p.frame(0, 0, W, padH, "stone2");
  p.hline(1, 1, W - 2, "stone5");
  cistern(p, 34, 2, 124, seed);
  // Weeds in the pad's cracks.
  for (const [wx, wy] of [[12, 80], [176, 30], [160, 92]] as const) block(p, wx, wy, ["a.b", ".bc", "bcd"], { a: "leaf4", b: "leaf3", c: "leaf2", d: "leaf1" }, "weed");

  // Facade: cement render over brick, a brick plinth showing where the render has fallen.
  p.rect(0, top, W, F, "stone4");
  // Render streaked by rain under the eave, and three places where it has spalled off the brick.
  for (let xx = 0; xx < W; xx += 1) if (hash(xx >> 2, 6, seed) > 0.7 && (xx & 3) === 1) p.vline(xx, top + 6, 6 + Math.floor(hash(xx, 5, seed) * 12), "stone3");
  for (const [sx, sy, sw, sh] of [[50, top + 20, 22, 14], [118, top + 46, 18, 12], [6, top + 58, 14, 10]] as const) {
    // The hole's outline wanders by whole bricks; brick shows inside, the render's broken edge lit above.
    const inside = (x: number, y: number) => {
      const u = (x + 0.5 - sw / 2) / (sw / 2), v = (y + 0.5 - sh / 2) / (sh / 2);
      return u * u + v * v + (hash((sx + x) >> 2, (sy + y) >> 2, seed) - 0.5) * 0.6 < 1;
    };
    p.clip(sx, sy, sw, sh, (q) => {
      for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) if (inside(x, y)) q.px(x, y, "steel3");
    });
    const hole = new Set<number>();
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) if (inside(x, y)) hole.add(y * sw + x);
    bricks(p, sx, sy, sw, sh, seed + sx);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      if (hole.has(y * sw + x)) continue;
      const below = hole.has((y + 1) * sw + x) && y + 1 < sh, right = hole.has(y * sw + x + 1) && x + 1 < sw;
      const above = y > 0 && hole.has((y - 1) * sw + x), left = x > 0 && hole.has(y * sw + x - 1);
      p.px(sx + x, sy + y, below || right ? "stone5" : above || left ? "stone3" : "stone4");
    }
  }
  laneWindow(p, 120, top + 16, 18, 16, { seed, bars: true, glass: "dark", sill: "plain" });
  p.hline(0, top, W, "stone3").hline(0, top + 1, W, "stone2");
  bricks(p, 0, base - 14, 46, 14, seed);
  bricks(p, 120, base - 10, 40, 10, seed + 1);
  p.hline(0, base - 15, 46, "stone5").hline(120, base - 11, 40, "stone5");
  for (let xx = 0; xx < W; xx++) p.px(xx, base, "steel1");
  // Steel door, jade paint worn to grey round the handle; a blank enamel notice (DOM may label it).
  const dx = 76, dw = 40, dh = 66, dy = base - dh;
  p.rect(dx - 3, dy - 4, dw + 6, dh + 4, "stone3");
  p.hline(dx - 3, dy - 4, dw + 6, "stone5");
  p.rect(dx, dy, dw, dh, "jade3");
  p.vline(dx, dy, dh, "jade4").vline(dx + dw - 1, dy, dh, "jade1").hline(dx, dy, dw, "jade4");
  for (let yy = dy + 6; yy < dy + dh - 4; yy += 12) p.hline(dx + 2, yy, dw - 4, "jade2");
  for (let i = 0; i < 40; i++) {
    const ax = dx + 6 + Math.floor(hash(i, 1, seed) * (dw - 8)), ay = dy + 26 + Math.floor(hash(i, 2, seed) * 20);
    if (Math.abs(ax - (dx + dw - 8)) + Math.abs(ay - (dy + 36)) < 12) p.px(ax, ay, "steel4");
  }
  p.rect(dx + dw - 8, dy + 34, 3, 6, "steel2").px(dx + dw - 8, dy + 34, "steel5");
  p.rect(dx + 8, dy + 10, 18, 12, "white");
  p.frame(dx + 8, dy + 10, 18, 12, "blue3");
  p.hline(dx + 9, dy + 21, 16, "steel4");
  p.vline(dx + dw / 2, dy, dh, "jade2");
  // Louvred vent high on the left.
  p.rect(14, top + 14, 30, 20, "stone2");
  for (let yy = top + 15; yy < top + 33; yy += 3) { p.hline(15, yy, 28, "steel4"); p.hline(15, yy + 1, 28, "steel2"); }
  p.frame(13, top + 13, 32, 22, "stone5");
  stain(p, 22, top + 35, 8, 30);
  // The rising main: a fat pipe out of the ground, a flange, the valve wheel, up through the roof.
  const mx = 150;
  p.rect(mx, top - 6, 10, base - top + 6, "steel3");
  p.vline(mx, top - 6, base - top + 6, "steel5").vline(mx + 1, top - 6, base - top + 6, "steel4").vline(mx + 8, top - 6, base - top + 6, "steel2").vline(mx + 9, top - 6, base - top + 6, "steel1");
  for (const fy of [base - 20, top + 30]) { p.rect(mx - 2, fy, 14, 4, "steel3"); p.hline(mx - 2, fy, 14, "steel5"); p.hline(mx - 2, fy + 3, 14, "steel1"); }
  for (let j = 0; j < 30; j++) if (hash(j, 9, seed) > 0.5) p.px(mx + 3 + (j % 3), top + 34 + j, j < 12 ? "orange1" : "wood3");
  block(p, mx - 6, base - 52, [
    "...abbbc...",
    ".ab..d..cc.",
    ".b...d...c.",
    "a....d....c",
    "bdddeeeddddc",
    "b....d....c",
    ".b...d...c.",
    ".cb..d..cc.",
    "...cccc....",
  ].map((r) => r.slice(0, 11)), { a: "red4", b: "red3", c: "red2", d: "steel3", e: "steel5" }, "valve");
  meterBox(p, 20, base - 56, 4);
  // A hose coiled on a hook.
  block(p, 54, base - 44, [".aaaa.", "ab..ba", "a.cc.a", "a.c..a", "ab..ba", ".bbbb.", "...b..", "...b.."], { a: "jade4", b: "jade2", c: "steel2" }, "hose");

  // Roof: corrugated iron lean-to, ridges running down to the lane.
  const roofTop = padH, roofH = top - roofTop + 2;
  for (let yy = roofTop; yy < roofTop + roofH; yy++) for (let xx = 0; xx < W; xx++) {
    const k = xx % 5;
    p.px(xx, yy, k === 0 ? "steel5" : k === 1 ? "steel4" : k === 2 ? "steel3" : k === 3 ? "steel2" : "steel3");
  }
  // Sheet laps and bolt rows.
  for (const ly of [roofTop + 30, roofTop + 62]) { p.hline(0, ly, W, "steel1"); p.hline(0, ly + 1, W, "steel5"); for (let xx = 2; xx < W; xx += 10) p.px(xx, ly + 3, "steel1"); }
  // Rust streaks running downhill from the bolts and laps.
  for (let i = 0; i < 14; i++) {
    const rx = 4 + Math.floor(hash(i, 1, seed) * (W - 8)), ry = roofTop + 4 + Math.floor(hash(i, 2, seed) * 60), len = 8 + Math.floor(hash(i, 3, seed) * 18);
    for (let j = 0; j < len; j++) if (j < 4 || hash(i, j, seed) > 0.3) p.px(rx, ry + j, j < len / 3 ? "orange1" : j < (2 * len) / 3 ? "wood3" : "gold1");
  }
  // A replaced sheet, still galvanised bright.
  for (let yy = roofTop + 32; yy < roofTop + 62; yy++) for (let xx = 110; xx < 140; xx++) { const k = xx % 5; p.px(xx, yy, k === 0 ? "steel6" : k === 1 ? "steel5" : k === 3 ? "steel3" : "steel4"); }
  // Turbine vent.
  block(p, 40, roofTop + 36, [
    "..abbbc..",
    ".abcbcbc.",
    "abcbcbcbd",
    "bcbcbcbcd",
    ".cbcbcbd.",
    "..ddddd..",
    "..beeec..",
    "..beeec..",
    "..ddddd..",
  ], { a: "steel6", b: "steel5", c: "steel3", d: "steel1", e: "steel2" }, "turbine");
  // The inlet pipe from the cistern arching over the roof into the pump room.
  p.rect(mx + 1, roofTop - 12, 8, top - roofTop + 6, "steel3");
  p.vline(mx + 1, roofTop - 12, top - roofTop + 6, "steel5").vline(mx + 8, roofTop - 12, top - roofTop + 6, "steel1");
  for (let yy = roofTop + 10; yy < top; yy += 26) { p.hline(mx - 1, yy, 12, "steel2"); p.hline(mx - 1, yy + 1, 12, "steel1"); }
  // Eave: the corrugation's wavy front edge and a sagging gutter.
  for (let xx = 0; xx < W; xx++) p.px(xx, top + 1, xx % 5 < 3 ? "steel2" : "steel1");
  p.hline(0, top + 2, W, "steel1");
  p.rect(0, top + 3, W, 3, "steel3");
  p.hline(0, top + 3, W, "steel5").hline(0, top + 5, W, "steel1");
  p.vline(0, roofTop, roofH + 4, "steel1").vline(W - 1, roofTop, roofH + 4, "steel1");
  downpipe(p, 4, top + 4, base);
};

/** The round cistern on its pad, a drum seen from above-front, `d` across at (x, y). */
function cistern(p: Px, x: number, y: number, d: number, seed: number): void {
  const r = d / 2, cx = x + r, lidY = y + 22, ry = 20, bodyH = 58;
  // Body: lit on the left, shaded right, riveted bands, a long rust tear.
  for (let yy = lidY; yy < lidY + bodyH; yy++) for (let xx = x; xx < x + d; xx++) {
    const u = (xx + 0.5 - cx) / r;
    const bottom = lidY + bodyH + Math.round(ry * 0.5 * Math.sqrt(Math.max(0, 1 - u * u)));
    if (yy > bottom) continue;
    p.px(xx, yy, u < -0.75 ? "steel4" : u < -0.2 ? "steel5" : u < 0.4 ? "steel4" : u < 0.8 ? "steel3" : "steel2");
  }
  for (let xx = x; xx < x + d; xx++) {
    const u = (xx + 0.5 - cx) / r;
    const bottom = lidY + bodyH + Math.round(ry * 0.5 * Math.sqrt(Math.max(0, 1 - u * u)));
    for (let yy = bottom; yy < bottom + 3; yy++) p.px(xx, yy, "steel1");
    for (const band of [18, 38]) {
      const by = lidY + band + Math.round(ry * 0.5 * Math.sqrt(Math.max(0, 1 - u * u)));
      p.px(xx, by, "steel2");
      if (xx % 6 === 0) p.px(xx, by - 1, "steel5");
    }
  }
  for (let j = 0; j < 30; j++) if (hash(j, 3, seed) > 0.25) p.px(cx + 30 + (j > 15 ? 1 : 0), lidY + 16 + j, j < 10 ? "orange1" : "wood3");
  // Lid.
  p.ellipse(cx, lidY, r, ry * 0.5 + 1, "steel3");
  p.ellipse(cx, lidY - 1, r - 1, ry * 0.5, "steel5");
  p.ellipse(cx + 3, lidY, r - 10, ry * 0.5 - 4, "steel4");
  p.ellipse(cx - 14, lidY - 1, 8, 4, "steel3");
  p.ellipse(cx - 14, lidY - 1.5, 7, 3, "steel4");
  p.hline(cx - 18, lidY - 3, 7, "steel6");
  // Ladder up the front.
  const lx = cx - 40;
  for (const sx of [lx, lx + 10]) p.vline(sx, lidY - 2, bodyH + 10, "steel2");
  for (let yy = lidY + 2; yy < lidY + bodyH + 8; yy += 6) p.hline(lx, yy, 11, "steel3");
  // The vent cap.
  block(p, cx + 18, lidY - 12, ["..aa..", ".abbc.", "abbbcc", "..dd..", "..dd.."], { a: "steel6", b: "steel5", c: "steel3", d: "steel2" }, "ventCap");
}

// ── the row-house generator ─────────────────────────────────────────────────

/** FNV-1a over a prop id: the seed that makes every generated row its own. */
function idHash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** A deterministic stream of 0..1 numbers from a seed. */
function stream(seed: number): () => number {
  let k = 0;
  return () => hash(seed, k++, 977);
}

function shuffled<T>(list: readonly T[], next: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

type Finish = "grey" | "banded" | "render";
type Treatment = "shutters-jade" | "shutters-wood" | "shutters-blue" | "shutters-cream" | "cage" | "bars" | "bricked" | "curtain";
type Story = "ac" | "quilt" | "birdcage" | "laundry" | "pomegranate" | "bicycle" | "sign" | "dish" | "tarp" | "loft" | "tiger";
const PEDIMENTS: readonly Pediment[] = ["triangle", "arch", "scroll", "plain"];
const DOORS: readonly Lacquer[] = ["black", "oxblood", "jade", "blue", "wood"];
const FINISHES: readonly Finish[] = ["grey", "banded", "render"];
const TREATMENTS: readonly Treatment[] = ["shutters-jade", "shutters-wood", "shutters-blue", "shutters-cream", "cage", "bars", "bricked", "curtain"];
const STORIES: readonly Story[] = ["ac", "quilt", "birdcage", "laundry", "pomegranate", "bicycle", "sign", "dish", "tarp", "loft", "tiger"];

/** One window in a generated bay, dressed by `t`. */
function dressedWindow(p: Px, x: number, y: number, w: number, h: number, t: Treatment, seed: number, finish: Finish): void {
  if (t === "bricked") { brickedWindow(p, x, y, w, h, seed, finish === "render"); return; }
  const curtains = ["cream", "plum", "jade", "pink"] as const;
  const curtain = curtains[seed % 4];
  if (t.startsWith("shutters-")) {
    const tone = t.slice(9) as "jade" | "wood" | "blue" | "cream";
    const state = (["open", "half", "closed"] as const)[seed % 3];
    laneWindow(p, x, y, w, h, { seed, shutters: state, shutterTone: tone, glass: seed % 2 ? "sky" : "curtain", curtain, sill: "plants" });
  } else if (t === "cage") laneWindow(p, x, y, w, h, { seed, cage: true, glass: "curtain", curtain, frame: "cream" });
  else if (t === "bars") laneWindow(p, x, y, w, h, { seed, bars: true, glass: "dark", sill: seed % 2 ? "jar" : "shoes" });
  else laneWindow(p, x, y, w, h, { seed, glass: "curtain", curtain, ajar: true, sill: "plants", frame: seed % 2 ? "cream" : "jade" });
}

/** Lay a bay's wall finish over the grey brick shell: red banding courses, or lime render gone patchy. */
function bayFinish(p: Px, bx: number, top: number, bw: number, base: number, finish: Finish, seed: number): void {
  if (finish === "banded") {
    for (let yy = ((top + 12) & ~3); yy < base - 16; yy += 20) bricks(p, bx, yy, bw, 4, seed + yy, RED_BRICK);
  } else if (finish === "render") {
    p.rect(bx, top + 4, bw, base - top - 11, "cream3");
    for (let yy = top + 4; yy < base - 7; yy++) for (let xx = bx; xx < bx + bw; xx++) if (hash(xx >> 2, yy >> 3, seed) > 0.82) p.px(xx, yy, "cream2");
    // Where the render has fallen away, the brick shows; a hairline crack wanders down from a sill.
    for (let i = 0; i < 2; i++) {
      const sx = bx + 6 + Math.floor(hash(i, 1, seed) * (bw - 26)), sy = top + 20 + Math.floor(hash(i, 2, seed) * (base - top - 50));
      bricks(p, sx, sy, 16, 8, seed + i);
      p.hline(sx, sy - 1, 16, "cream4").vline(sx - 1, sy, 8, "cream4").hline(sx, sy + 8, 16, "cream1");
    }
    let cx = bx + Math.floor(bw * 0.6);
    for (let yy = top + 40; yy < top + 70 && yy < base - 8; yy++) { p.px(cx, yy, "cream1"); if (hash(yy, 3, seed) > 0.6) cx += hash(yy, 4, seed) > 0.5 ? 1 : -1; }
  }
}

/**
 * Any lane row the map adds that has no hand-made drawing: bays from the width, storeys from the depth,
 * and per bay a pediment, door paint, window dressing, wall finish and one story, all chosen from the
 * prop's id and variant so neighbouring rows differ and no two adjacent bays match. A deep plot gets a
 * back terrace; a utility plot (the hot-water shop) gets a plain door, render and a steaming chimney.
 */
const laneRow: Draw = (p, prop, W, H) => {
  const seed = (idHash(prop.id) ^ Math.imul(prop.variant + 1, 7919)) & 0xffff;
  const next = stream(seed);
  const utility = prop.kind === "building-utility";
  const F = Math.min(H - 40, H >= 176 ? 128 : H >= 152 ? 112 : 96);
  const two = F >= 112, top = H - F, base = H - 1;
  const n = utility ? 1 : Math.max(1, Math.round(W / 124));
  const bayW = Math.floor(W / n);
  const peds = utility ? ["plain" as Pediment] : shuffled(PEDIMENTS, next);
  const doors = utility ? ["wood" as Lacquer] : shuffled(DOORS, next);
  const finishes = utility ? ["render" as Finish] : shuffled(FINISHES, next);
  const treatments = shuffled(TREATMENTS, next);
  let stories = shuffled(STORIES, next);
  const roofH = top + 4;
  const ridgeY = roofH > 110 ? Math.round(roofH * 0.38) : Math.max(8, Math.min(28, Math.round(roofH * 0.22)));
  const slope = roofH - 5 - (ridgeY + 6);
  // Roof stories need room on the slope.
  if (slope < 34) stories = stories.filter((st) => st !== "loft" && st !== "tiger");
  if (utility) stories = ["sign"];

  facadeShell(p, 0, top, W, base, { seed, groundH: two ? Math.round(F * 0.66) : F - 10, quoins: next() > 0.5, bandCourses: two ? 2 : 0 });
  const roofJobs: (() => void)[] = [];
  for (let i = 0; i < n; i++) {
    const bx = i * bayW, bw = i === n - 1 ? W - bx : bayW, s = seed + i * 131;
    const finish = finishes[i % finishes.length];
    bayFinish(p, bx, top, bw, base, finish, s);
    if (i > 0) {
      p.rect(bx - 2, top + 4, 4, F - 5, "steel3");
      p.vline(bx - 2, top + 4, F - 5, "steel4").vline(bx + 1, top + 4, F - 5, "steel1");
      for (let yy = top + 8; yy < base - 8; yy += 8) p.hline(bx - 2, yy, 4, (yy >> 3) & 1 ? "rose3" : "stone3");
    }
    const doorW = bw >= 112 ? 44 : 40, doorH = F >= 128 ? 62 : F >= 112 ? 56 : 50;
    const lo = bx + doorW / 2 + 12, hi = bx + bw - doorW / 2 - 12;
    const cx = Math.round(Math.max(lo, Math.min(hi, bx + bw * (0.36 + 0.28 * next()))));
    const x0 = cx - doorW / 2, x1 = cx + doorW / 2;
    const leftRoom = x0 - 9 - bx, rightRoom = bx + bw - (x1 + 9);
    const story = stories[i % stories.length];
    // Windows: two upstairs if the bay is wide enough; one downstairs on the roomier side of the door.
    const ww = 22, wh = F >= 128 ? 28 : 24, wy = top + 12;
    const wins: [number, number, number, number][] = [];
    if (two) {
      if (bw >= 100) wins.push([bx + 12, wy, ww, wh], [bx + bw - 12 - ww, wy, ww, wh]);
      else wins.push([cx - ww / 2, wy, ww, wh]);
    }
    const gwH = two ? 22 : 28, gwW = two ? 18 : 22, gy = base - Math.round(F * (two ? 0.42 : 0.62));
    const groundSide = leftRoom >= rightRoom ? "left" : "right";
    const groundRoom = Math.max(leftRoom, rightRoom);
    if (groundRoom >= gwW + 14) wins.push([groundSide === "left" ? bx + Math.round((leftRoom - gwW) / 2) : x1 + 9 + Math.round((rightRoom - gwW) / 2), gy, gwW, gwH]);
    wins.forEach(([x, y, w, h], k) => dressedWindow(p, x, y, w, h, treatments[(i * 3 + k) % treatments.length], s + k, finish));
    stoneGate(p, x0, x1, base, { doorH, pediment: peds[i % peds.length], lacquer: doors[i % doors.length], seed: s });
    // The bay's story.
    const freeX = groundSide === "left" ? x1 + 10 : bx + 6, freeW = groundSide === "left" ? rightRoom : leftRoom;
    const first = wins[0];
    if (story === "ac") acUnit(p, two && bw >= 100 ? cx - 11 : Math.min(bx + bw - 26, x1 + 12), two ? top + 18 : top + 14, s, first ? [first[0] + first[2], first[1] + 6] : undefined);
    else if (story === "quilt" && first) {
      const [qx0, qy0, qw0, qh0] = first, qx = qx0 - 2, qw = qw0 + 4, qy = qy0 + qh0 - 4;
      const cloth = (["pink", "jade", "blue"] as const)[s % 3];
      const tone = { pink: ["pink3", "pink2", "pink1"], jade: ["jade5", "jade4", "jade2"], blue: ["blue5", "blue4", "blue2"] }[cloth] as [Color, Color, Color];
      p.rect(qx, qy, qw, 20, tone[1]);
      p.hline(qx, qy, qw, tone[0]).hline(qx, qy + 1, qw, tone[0]).vline(qx + qw - 1, qy + 2, 18, tone[2]);
      for (let k = 2; k < qw; k += 6) block(p, qx + k - 1, qy + 6 + ((k / 6) % 2) * 6, [".a.", "aba", ".a."], { a: tone[2], b: "gold4" }, "quiltFlower");
      for (let k = 0; k < qw; k++) if ((k * 7) % 5 < 2) p.px(qx + k, qy + 19, tone[2]);
    } else if (story === "birdcage") birdcage(p, first ? Math.min(bx + bw - 13, first[0] + first[2] + 4) : x1 + 10, first ? first[1] + 2 : top + 10);
    else if (story === "laundry") laundryPole(p, bx + 10, two ? top + 50 : top + 12, bw - 20, s, shuffled(["shirt", "trousers", "towel", "socks", "vest", "pillow"] as const, next));
    else if (story === "pomegranate") basePot(p, freeW >= 22 ? freeX : x1 + 8, base - 1);
    else if (story === "bicycle") wallBicycle(p, freeW >= 34 ? freeX : bx + 4, base - 1);
    else if (story === "sign") homeSign(p, Math.max(bx + 4, Math.min(bx + bw - 34, freeX)), base - doorH + 4, 30);
    else roofJobs.push(() => {
      const rx = Math.max(bx + 26, Math.min(bx + bw - 60, bx + Math.floor(bw * 0.3 + next() * bw * 0.3)));
      const ry = ridgeY + 8;
      if (story === "dish") satelliteDish(p, rx, ry + Math.floor(slope / 3));
      else if (story === "tarp") tarp(p, rx, ry + Math.floor(slope / 2) - 6, 30, 14, s);
      else if (story === "loft") { shadowWedge(p, rx + 29, ry + 6, 6, 20); pigeonLoft(p, rx, ry + 2); }
      else if (story === "tiger") tigerWindow(p, rx, ry + 2, s, { w: slope >= 44 ? 36 : 28, plant: s % 2 === 0, frame: s % 3 ? "wood3" : "jade3" });
    });
  }
  downpipe(p, 3, top + 4, base);
  downpipe(p, W - 7, top + 4, base);
  if (!utility && next() > 0.65) ivy(p, next() > 0.5 ? 2 : W - 44, top + 6, 40, F - 12, seed);

  laneRoof(p, 0, 0, W, roofH, { seed, ridgeY, damp: 0.06 + next() * 0.08, mend: next() > 0.5 ? [Math.floor(next() * (W - 60)) + 20, ridgeY + 12, 30, 18] : undefined });
  for (let i = 1; i < n; i++) partyWall(p, i * bayW - 2, ridgeY + 6, roofH - ridgeY - 11);
  moss(p, 6, roofH - 22, W - 12, 16, seed, Math.max(1, Math.floor(W / 60)));
  for (const job of roofJobs) job();
  if (utility) chimney(p, Math.floor(W * 0.6), Math.max(0, ridgeY - 12));
  // A deep plot keeps a sun terrace at the back.
  if (roofH > 110 && ridgeY - 8 >= 40 && W >= 140) {
    const tw = Math.min(W - 20, 120 + Math.floor(next() * 60));
    sunTerrace(p, next() > 0.5 ? 0 : W - tw, 0, tw, ridgeY - 8, seed);
  }
};

// ── sprites ─────────────────────────────────────────────────────────────────

const DRAW: Record<string, Draw> = {
  "town.residence": residence,
  "town.south-residence": southResidence,
  "town.north-row": northRow,
  "town.linen-house": linenHouse,
  "town.south-studio": southStudio,
  "town.pump-house": pumpHouse,
};

/** Every other lane building on the map is generated, so no two rows repeat. */
const BY_KIND: Record<string, Draw> = { "building-residence": laneRow, "building-row": laneRow, "building-utility": laneRow };

function buildingSprite(prop: TownProp): SpriteDef {
  const { w, h } = footprintPx(prop);
  const draw = DRAW[prop.id] ?? BY_KIND[prop.kind];
  const ax = Math.round((prop.width * TILE) / 2);
  return {
    w, h,
    anchor: [ax, h - 1],
    foot: [-ax, -(h - 1), w, h],
    draw: (p) => draw(p, prop, w, h),
  };
}

export default defineSprites(Object.fromEntries(
  townProps("building-residence", "building-row", "building-utility").map((prop) => [townSpriteId(prop.id), buildingSprite(prop)]),
));
