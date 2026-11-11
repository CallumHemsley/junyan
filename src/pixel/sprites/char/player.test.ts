import { describe, expect, it } from "vitest";
import { Px } from "../../kit/index.ts";
import carried from "../food/carried.ts";
import { HERO_ACTIONS, HIP_Y, SHOULDER_SIDE, WALK_BOB, WALK_DOWN, WALK_RIGHT, WALK_UP, carryBob, lag, type Arm, type HeroFrame, type V } from "./_hero-poses.ts";
import patient from "./patient.ts";
import player from "./player.ts";

const drawn = (id: string, frame = 0) => {
  const def = player[id], p = new Px(def.w, def.h);
  def.draw(p, frame);
  return p;
};
const extent = (p: Px, y0: number, y1: number, pick: (c: string) => boolean) => {
  let a = Infinity, b = -Infinity;
  for (let y = y0; y <= y1; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c && pick(c)) { a = Math.min(a, x); b = Math.max(b, x); } }
  return b - a + 1;
};
const isHair = (c: string) => c.startsWith("hair") || c === "stone2";
const legKey = (f: HeroFrame) => JSON.stringify([f.legN, f.legF]);
/** How far the elbow sits off the straight line from shoulder to hand, in pixels. */
const bend = (s: V, a: Arm) => {
  const [sx, sy] = s, [hx, hy] = a.hand, [ex, ey] = a.elbow;
  return Math.abs((hx - sx) * (sy - ey) - (sx - ex) * (hy - sy)) / Math.hypot(hx - sx, hy - sy);
};

describe("char/player", () => {
  it("has every action the game asks for, in all four facings", () => {
    for (const action of ["idle", "walk", "carry-idle", "carry-walk"]) {
      for (const dir of ["down", "up", "left", "right"]) expect(player[`char/player/${action}-${dir}`], `${action}-${dir}`).toBeDefined();
    }
    expect(player["char/player/walk-down"]).toMatchObject({ w: 32, h: 64, anchor: [16, 62], frames: 8, fps: 10 });
    expect(player["char/player/idle-down"]).toMatchObject({ frames: 8, fps: 5 });
  });

  it("walks on eight distinct poses with the bob, the head a frame late and the hair two", () => {
    for (const walk of [WALK_RIGHT, WALK_DOWN, WALK_UP]) {
      expect(new Set(walk.map(legKey)).size).toBe(8);
      walk.forEach((f, i) => {
        expect(f.bob).toBe(WALK_BOB[i]);
        expect(f.bob + f.nod + f.tip).toBe(lag(WALK_BOB, i, 2));
      });
    }
  });

  it("strikes with the heel, toe up, swings bent arms and keeps the soles on the ground", () => {
    const contact = WALK_RIGHT[0];
    expect(contact.legN.toe[1]).toBeLessThan(contact.legN.heel[1] - 1);
    for (const f of WALK_RIGHT) expect(bend(SHOULDER_SIDE, f.armF)).toBeGreaterThan(0.25);
    for (const f of WALK_RIGHT) expect(Math.max(f.legN.heel[1], f.legN.toe[1], f.legF.heel[1], f.legF.toe[1])).toBeGreaterThan(59.5);
  });

  it("matches the cast: a head about 22–24 wide, a body about 20–24 wide, short legs and neck", () => {
    const front = drawn("char/player/idle-down");
    const hairW = extent(front, 6, 21, isHair);
    expect(hairW).toBeGreaterThanOrEqual(22);
    expect(hairW).toBeLessThanOrEqual(24);
    const bodyW = extent(front, 36, 44, (c) => c !== "ink");
    expect(bodyW).toBeGreaterThanOrEqual(20);
    expect(bodyW).toBeLessThanOrEqual(24);
    expect(61 - HIP_Y).toBeLessThanOrEqual(15);
    let neck = 0;
    for (let y = 28; y < 40; y++) if (front.get(16, y) === "skin2") neck++;
    expect(neck).toBeLessThanOrEqual(2);
  });

  it("holds the tray where the dishes are placed, riding the same bob", () => {
    for (const action of ["carry-idle", "carry-walk"] as const) {
      const bob = carryBob(action);
      bob.forEach((b, i) => {
        // Facing down the board's far rim is row 40 and its top face rows 41–44 when level
        // (`TRAY_SLOTS` in world/pixel/cafe.ts puts the dishes there).
        const p = drawn(`char/player/${action}-down`, i);
        expect(p.get(16, 40 + b)?.startsWith("wood"), `${action} frame ${i}`).toBe(true);
        expect(p.get(16, 39 + b)?.startsWith("wood"), `${action} frame ${i}`).toBe(false);
      });
      expect(carried[`food/tray-bun/${action}-down`]).toMatchObject({ frames: bob.length, fps: HERO_ACTIONS[action].fps });
    }
  });

  it("never opens a gap in the hair when the tips lag behind the head", () => {
    for (const [id, def] of Object.entries(player)) {
      if (id.includes("-left") || id.includes("-right")) continue;
      for (let i = 0; i < (def.frames ?? 1); i++) {
        const p = drawn(id, i);
        for (const x of [8, 23]) {
          const rows = [...Array(40).keys()].filter((y) => y >= 6 && y <= 18 && isHair(p.get(x, y) ?? ""));
          if (rows.length) expect(rows.at(-1)! - rows[0] + 1, `${id} frame ${i} column ${x}`).toBe(rows.length);
        }
      }
    }
  });

  it("draws every player and patient frame deterministically; standing frames touch the ground", () => {
    for (const [id, def] of Object.entries({ ...player, ...patient })) {
      for (let i = 0; i < (def.frames ?? 1); i++) {
        const a = new Px(def.w, def.h), b = new Px(def.w, def.h);
        def.draw(a, i);
        def.draw(b, i);
        expect(Buffer.from(a.ink).equals(Buffer.from(b.ink)), id).toBe(true);
        if (/\/(lie|lie-awake|sit-bed)-/.test(id)) continue;
        expect([...Array(def.w).keys()].some((x) => a.solid(x, def.anchor![1] - 1)), `${id} frame ${i}`).toBe(true);
      }
    }
  }, 30_000);
});
