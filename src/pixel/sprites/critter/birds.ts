/**
 * The town's birds. Walk-through actors anchored at the feet; actions `idle`, `peck`, `hop`, `fly`
 * in `down`, `right` and `left` (mirrored). Flying frames use a taller canvas so the bird hangs
 * well above its shadow.
 *
 * - `critter/sparrow`: a Eurasian tree sparrow (麻雀), the lane's commonest bird. Chestnut cap,
 *   white cheek with the black ear spot, black bib, streaky brown back, one white wing bar. This
 *   one is a fluffed-up winter bird that has learned where the breakfast stalls drop crumbs.
 * - `critter/pigeon`: a canal-side feral pigeon. Blue-grey, two black wing bars and a dark tail
 *   band, a green and purple sheen on the neck, the white cere over the beak, an orange eye,
 *   coral feet. Plump and unbothered.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { art, blob, defineCritter } from "./_helpers.ts";

// ── sparrow ────────────────────────────────────────────────────────────────

const SP = {
  C: "brown3", c: "brown2", W: "cream5", K: "hair1", k: "hair2", E: "ink", y: "steel2", Y: "steel3",
  b: "brown3", B: "oak4", d: "brown1", v: "cream4", U: "stone5", u: "stone4", g: "stone3",
  T: "brown2", t: "brown1", L: "tan1",
} as const;

type SparrowPose = { dx?: number; dy?: number; head?: 0 | 1 | 2; blink?: boolean; tail?: 0 | 1; legs?: "stand" | "crouch" | "tuck"; wing?: "up" | "mid" | "down" };

/** Profile, facing right. Standing, the bird spans x0–14, y5–15 with its feet on row 15. */
function sparrowSide(p: Px, o: SparrowPose = {}) {
  const dx = o.dx ?? 0, dy = o.dy ?? 0;
  if (o.wing === "down") art(p, 4 + dx, 12 + dy, ["bdbbbb", ".bdBbb", "..bdbb", "...db."], SP);
  // Tail, body, then the head over the shoulders.
  art(p, dx, 10 + dy, o.tail ? ["..TTt", ".TTTt", "TTt.."].slice(0, 3) : ["...Tt", ".TTTt", "TTt.."], SP);
  if (o.tail) art(p, 1 + dx, 9 + dy, ["Tt"], SP);
  art(p, dx, 9 + dy, [
    "......bBb.....",
    ".....bdBbdbbUu",
    "....bBdbBdbuUu",
    "....vvvvvbbuUu",
    "......bbbbguuu",
  ], SP);
  const [hx, hy] = [[0, 0], [1, 2], [2, 4]][o.head ?? 0];
  art(p, 8 + dx + hx, 5 + dy + hy, [
    "..CCc..",
    ".CCCCc.",
    `.WW${o.blink ? "c" : "E"}Cky`,
    "bWKWWKY",
    ".WWKK..",
  ], SP);
  // A dipped head pulls the nape down with it.
  if (hy) art(p, 7 + dx, 9 + dy, hy > 2 ? ["bBbb", ".bbb"] : ["bBb"], SP);
  if (o.wing === "up") art(p, 4 + dx, 4 + dy, ["...bb.", "..bBd.", ".bBdb.", "bBdbb.", "vvvv.."], SP);
  if (o.wing === "mid") art(p, 3 + dx, 10 + dy, ["bdBdbdb", "vvvvvv."], SP);
  p.outline("brown1");
  const legs = o.legs ?? "stand";
  if (legs === "stand") art(p, 7 + dx, 14 + dy, [".L.L.", "LL.LL"], SP);
  if (legs === "crouch") art(p, 7 + dx, 15 + dy, ["LL.LL"], SP);
  if (legs === "tuck") art(p, 8 + dx, 14 + dy, ["LL"], SP);
}

/** Facing the camera. Standing, the bird spans x3–12, y5–15. */
function sparrowFront(p: Px, o: SparrowPose = {}) {
  const dx = o.dx ?? 0, dy = o.dy ?? 0;
  if (o.wing === "up") {
    art(p, dx, 2 + dy, ["bb..............bb", ".bBb..........bBd.", "..bBdb......bBdb..", "...vbBb....bBbv...", ".....vbb..bbv....."], SP);
  }
  if (o.wing === "mid") art(p, dx, 9 + dy, ["bbBBdb......bdBBbb", ".vvvvbb....bbvvvv."], SP);
  if (o.wing === "down") art(p, 1 + dx, 10 + dy, ["...bdb....bdb...", "..bBdb....bdBb..", ".bBdv......vdBb.", ".bv..........vb."], SP);
  const ox = o.wing ? 1 : 0;
  // Tipped forward to peck, the tail rises into view behind the back.
  if (o.head === 2) art(p, 6 + dx + ox, 6 + dy, [".TT.", "TTtt", ".Tt."], SP);
  art(p, 3 + dx + ox, 9 + dy, [
    ".bb....bb.",
    "bbbuUUubbb",
    "bBbUUUUudb",
    "bvbuUUuudb",
    ".bbuuuugb.",
  ], SP);
  const head = o.head ?? 0;
  const rows = head === 0
    ? [".cCCc.", "cCCCCc", `W${o.blink ? "c" : "E"}CC${o.blink ? "c" : "E"}W`, "KWyyWK", ".KKKK."]
    : head === 1
      ? [".cCCc.", "cCCCCc", "cCCCCc", "WECCEW", "KWyyWK"]
      : [".cCCc.", "cCCCCc", "cCCCCc", "cCCCCc", "WccccW"];
  art(p, 5 + dx + ox, 5 + dy + (head === 0 ? 0 : head === 1 ? 2 : 4), rows, SP);
  p.outline("brown1");
  const legs = o.legs ?? "stand";
  if (legs === "stand") art(p, 5 + dx + ox, 14 + dy, [".L..L.", "LL..LL"], SP);
  if (legs === "crouch") art(p, 5 + dx + ox, 15 + dy, ["LL..LL"], SP);
  if (legs === "tuck") art(p, 6 + dx + ox, 14 + dy, ["L..L"], SP);
}

const sparrow = defineCritter("sparrow", {
  /** A breath and a blink, then a flick of the tail. */
  idle: {
    w: 16, h: 16, anchor: [9, 15], shadow: { rx: 5, ry: 2 }, frames: 4, fps: 3,
    right: (p, f) => sparrowSide(p, { blink: f === 1, tail: f === 3 ? 1 : 0 }),
    down: (p, f) => sparrowFront(p, { blink: f === 1, dy: f === 3 ? -1 : 0, legs: f === 3 ? "stand" : "stand" }),
  },
  /** Dip, peck, peck, look up. */
  peck: {
    w: 18, h: 16, anchor: [9, 15], shadow: { rx: 5, ry: 2 }, frames: 4, fps: 6,
    right: (p, f) => sparrowSide(p, { head: ([1, 2, 2, 0] as const)[f], tail: f === 2 ? 1 : 0 }),
    down: (p, f) => sparrowFront(p, { head: ([1, 2, 2, 0] as const)[f] }),
  },
  /** Crouch, spring, hang, land: the engine moves the bird along the ground. */
  hop: {
    w: 18, h: 20, anchor: [9, 19], shadow: { rx: 5, ry: 2 }, frames: 4, fps: 8,
    right: (p, f) => sparrowSide(p, [{ dy: 5, legs: "crouch" }, { dy: 1, legs: "tuck", tail: 1 }, { dy: 0, legs: "tuck", tail: 1 }, { dy: 4, legs: "stand" }][f] as SparrowPose),
    down: (p, f) => sparrowFront(p, [{ dy: 5, legs: "crouch" }, { dy: 1, legs: "tuck" }, { dy: 0, legs: "tuck" }, { dy: 4, legs: "stand" }][f] as SparrowPose),
  },
  /** Wingbeats well above the ground. */
  fly: {
    w: 18, h: 30, anchor: [9, 29], shadow: { rx: 3, ry: 1 }, frames: 4, fps: 10,
    right: (p, f) => sparrowSide(p, { dy: ([2, 3, 4, 3] as const)[f], head: 1, legs: "tuck", wing: (["up", "mid", "down", "mid"] as const)[f] }),
    down: (p, f) => sparrowFront(p, { dy: ([2, 3, 4, 3] as const)[f], legs: "tuck", wing: (["up", "mid", "down", "mid"] as const)[f] }),
  },
});

// ── pigeon ─────────────────────────────────────────────────────────────────

const PG = {
  H: "steel4", h: "steel3", s: "steel3", S: "steel2", k: "steel1", G: "steel5",
  N: "jade3", n: "jade4", M: "plum3", m: "plum2",
  e: "orange3", E: "ink", Y: "cream5", y: "stone2", f: "pink2", F: "pink1",
  w: "steel4", W: "steel5",
} as const;

type PigeonPose = { dx?: number; dy?: number; head?: 0 | 1 | 2 | 3; blink?: boolean; puff?: boolean; tail?: 0 | 1; legs?: "stand" | "crouch" | "tuck"; wing?: "up" | "mid" | "down" };

/** Profile, facing right. Standing, the bird spans x1–22, y5–23 with its feet on row 23. */
function pigeonSide(p: Px, o: PigeonPose = {}) {
  const dx = o.dx ?? 0, dy = o.dy ?? 0;
  if (o.wing === "down") art(p, 6 + dx, 16 + dy, ["Shhhhhhs", ".Shhhhs.", "..ShhhS.", "...Shs..", "....S..."], PG);
  // Tail: grey with the dark band at its end.
  art(p, 1 + dx, (o.tail ? 13 : 14) + dy, ["..sss", "kssss", "kkss.", ".k..."], PG);
  blob(p, 12 + dx, 16.5 + dy + (o.puff ? -0.5 : 0), 8, o.puff ? 5.2 : 4.6, ["steel5", "steel4", "steel3", "steel2"], [1.05, 0.5, 0.05]);
  // The folded wing, with its two black bars.
  art(p, 6 + dx, 14 + dy, [
    "..GGhhhhh",
    ".GhhhhhhS",
    "shhkkkkkk",
    "sshhhhhhhS",
    ".ssskkkkkk",
  ], PG);
  // Neck and breast sheen, then the head.
  const [hx, hy] = [[0, 0], [1, 3], [3, 7], [-1, -1]][o.head ?? 0];
  art(p, 16 + dx, 11 + dy, ["hNNh", "NnNNs", "MNMMs", "MMmMs", ".mms"], PG);
  if (hy > 0) art(p, 16 + dx, 11 + dy, hy > 4 ? ["hNNNh.", "sNnNNN", "sMNMMM", "sMMmM."] : ["hNNh.", "sNnNN", "sMNMM"], PG);
  if (o.puff) art(p, 17 + dx, 12 + dy, ["NNNh", "MnMMs", "MMMms"], PG);
  art(p, 16 + dx + hx, 6 + dy + hy, [
    ".hGHh..",
    "hGHHHh.",
    `hH${o.blink ? "hh" : "eE"}HYy`,
    "shHHhsy",
    ".shhs..",
  ], PG);
  if (o.wing === "up") art(p, 6 + dx, 7 + dy, ["......SS", ".....ShS", "....ShhS", "...ShhhS", "..Shhhs.", ".Shhhhs.", "kkhkhhs."], PG);
  if (o.wing === "mid") art(p, 4 + dx, 14 + dy, ["Shhhhhhhhh", "kSskSskSs."], PG);
  p.outline("steel1");
  const legs = o.legs ?? "stand";
  if (legs === "stand") art(p, 10 + dx, 21 + dy, [".f..f.", "Ff.Ff.", "ff.ff."].slice(0, 2).concat(["ffFffF"]).slice(1), PG);
  if (legs === "crouch") art(p, 10 + dx, 22 + dy, ["ffFffF"], PG);
  if (legs === "tuck") art(p, 11 + dx, 21 + dy, ["ff"], PG);
}

/** Facing the camera. Standing, the bird spans x5–18, y5–23. */
function pigeonFront(p: Px, o: PigeonPose = {}) {
  const dx = o.dx ?? 0, dy = o.dy ?? 0;
  if (o.wing === "up") art(p, dx, 3 + dy, ["SS....................SS", "ShS..................ShS", ".ShhS..............ShhS.", "..ShhhS..........ShhhS..", "...khkhS........ShkhkS..", ".....kkhS......Shkk....."], PG);
  if (o.wing === "mid") art(p, dx, 13 + dy, ["Shhhhhhh........hhhhhhhS", ".kSkSkShh......hhSkSkSk."], PG);
  if (o.wing === "down") art(p, 2 + dx, 15 + dy, ["....Shh........hhS...", "...Shhk........khhS..", "..Shhk..........khhS.", "..Sk..............kS."], PG);
  blob(p, 12 + dx, 16.5 + dy + (o.puff ? -0.5 : 0), o.puff ? 6.5 : 6, o.puff ? 5.2 : 4.8, ["steel5", "steel4", "steel3", "steel2"], [1.05, 0.5, 0.05]);
  // Wings folded at the sides with the bar ends showing.
  if (!o.wing) {
    art(p, 6 + dx, 13 + dy, [".G", "Gh", "kk", "hh", "kk", ".s"], PG);
    art(p, 16 + dx, 13 + dy, ["h.", "sS", "kk", "sS", "kk", "S."], PG);
  }
  const head = o.head ?? 0;
  const hy = [0, 2, 5, -1][head];
  art(p, 9 + dx, 10 + dy, ["hNNNNh", "NnNMNN", "MMNMMm", ".mMMm."], PG);
  const face = head === 2
    ? [".hGHh.", "hGHHHh", "hHHHhs", "hHHHhs", "shhhhs"]
    : [".hGHh.", "hGHHHh", `${o.blink ? "hh" : "eE"}HH${o.blink ? "hh" : "Ee"}`, "shHYhs", "..yy.."];
  art(p, 9 + dx, 5 + dy + hy, face, PG);
  p.outline("steel1");
  const legs = o.legs ?? "stand";
  if (legs === "stand") art(p, 9 + dx, 21 + dy, [".f..f.", "fFf.fFf"], PG);
  if (legs === "crouch") art(p, 9 + dx, 22 + dy, ["fFf.fFf"], PG);
  if (legs === "tuck") art(p, 10 + dx, 21 + dy, ["f..f"], PG);
}

const pigeon = defineCritter("pigeon", {
  /** Settled, then a puff of the chest and a little coo, a blink, a flick of the tail. */
  idle: {
    w: 26, h: 24, anchor: [12, 23], shadow: { rx: 8, ry: 2 }, frames: 4, fps: 3,
    right: (p, f) => pigeonSide(p, { puff: f === 1, blink: f === 2, tail: f === 3 ? 1 : 0, head: f === 1 ? 3 : 0 }),
    down: (p, f) => pigeonFront(p, { puff: f === 1, blink: f === 2, head: f === 1 ? 3 : 0 }),
  },
  /** The head goes down and down again. */
  peck: {
    w: 26, h: 24, anchor: [12, 23], shadow: { rx: 8, ry: 2 }, frames: 4, fps: 6,
    right: (p, f) => pigeonSide(p, { head: ([1, 2, 2, 0] as const)[f], tail: f === 2 ? 1 : 0 }),
    down: (p, f) => pigeonFront(p, { head: ([1, 2, 2, 0] as const)[f] }),
  },
  /** A heavy little flutter-hop. */
  hop: {
    w: 26, h: 28, anchor: [12, 27], shadow: { rx: 8, ry: 2 }, frames: 4, fps: 8,
    right: (p, f) => pigeonSide(p, [{ dy: 5, legs: "crouch" }, { dy: 1, legs: "tuck", wing: "up" }, { dy: 0, legs: "tuck", wing: "mid" }, { dy: 4, legs: "stand" }][f] as PigeonPose),
    down: (p, f) => pigeonFront(p, [{ dy: 5, legs: "crouch" }, { dy: 1, legs: "tuck", wing: "up" }, { dy: 0, legs: "tuck", wing: "mid" }, { dy: 4, legs: "stand" }][f] as PigeonPose),
  },
  /** Wingbeats well above the ground. */
  fly: {
    w: 26, h: 40, anchor: [12, 39], shadow: { rx: 5, ry: 1 }, frames: 4, fps: 9,
    right: (p, f) => pigeonSide(p, { dy: ([2, 3, 4, 3] as const)[f], head: 1, legs: "tuck", wing: (["up", "mid", "down", "mid"] as const)[f] }),
    down: (p, f) => pigeonFront(p, { dy: ([2, 3, 4, 3] as const)[f], legs: "tuck", wing: (["up", "mid", "down", "mid"] as const)[f] }),
  },
});

export default defineSprites({ ...sparrow, ...pigeon });
