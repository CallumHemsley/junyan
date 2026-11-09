import { describe, expect, it } from "vitest";
import { chooseZoom, createCamera, followPoint, toScreen, toWorld, viewSize } from "./camera.ts";

describe("camera zoom", () => {
  it("shows about 18–22 tiles across on desktops", () => {
    for (const [w, h, dpr] of [[1440, 900, 2], [1920, 1080, 1], [1280, 800, 2], [2560, 1440, 1], [1366, 768, 1]]) {
      const zoom = chooseZoom(w, h, dpr);
      expect(Number.isInteger(zoom)).toBe(true);
      const tiles = (w * dpr) / zoom / 16;
      expect(tiles, `${w}x${h}@${dpr}`).toBeGreaterThanOrEqual(18);
      expect(tiles, `${w}x${h}@${dpr}`).toBeLessThanOrEqual(22.5);
    }
  });

  it("shows about 10–12 tiles across on portrait phones", () => {
    for (const [w, h, dpr] of [[390, 844, 3], [375, 812, 3], [412, 915, 2.625], [360, 740, 2]]) {
      const tiles = (w * dpr) / chooseZoom(w, h, dpr) / 16;
      expect(tiles, `${w}x${h}@${dpr}`).toBeGreaterThanOrEqual(9.5);
      expect(tiles, `${w}x${h}@${dpr}`).toBeLessThanOrEqual(12.5);
    }
  });

  it("never goes below 1×", () => {
    expect(chooseZoom(100, 80, 1)).toBe(1);
  });

  it("covers the CSS box with whole art pixels", () => {
    expect(viewSize(390, 844, 3, 7)).toEqual([168, 362]);
  });
});

describe("camera follow", () => {
  it("centres on the focus, snapped to whole pixels", () => {
    expect(followPoint(100, 60, 400, 300, [200.4, 150.6])).toEqual([150, 121]);
  });

  it("clamps at the scene edges", () => {
    expect(followPoint(100, 60, 400, 300, [10, 10])).toEqual([0, 0]);
    expect(followPoint(100, 60, 400, 300, [395, 299])).toEqual([300, 240]);
  });

  it("centres a scene smaller than the view", () => {
    expect(followPoint(300, 200, 192, 144, [0, 0])).toEqual([-54, -28]);
  });
});

describe("screen ↔ world", () => {
  it("round-trips through CSS pixels", () => {
    const camera = createCamera({ cssWidth: 1440, cssHeight: 900, dpr: 2, sceneSize: [40, 30], focus: [12.3, 9.7] });
    for (const point of [[12.3, 9.7], [0, 0], [39.9, 29.1], [5.25, 20.5]] as const) {
      const [sx, sy] = toScreen(camera, point);
      const [wx, wy] = toWorld(camera, sx, sy);
      expect(wx).toBeCloseTo(point[0], 9);
      expect(wy).toBeCloseTo(point[1], 9);
    }
  });

  it("maps one art pixel to zoom / dpr CSS pixels", () => {
    const camera = { x: 16, y: 32, w: 100, h: 100, zoom: 6, dpr: 2 };
    expect(toScreen(camera, [1, 2])).toEqual([0, 0]);
    expect(toScreen(camera, [2, 2])).toEqual([48, 0]);
  });
});
