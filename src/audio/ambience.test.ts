import { describe, expect, it, vi } from "vitest";
import { ambienceVolume, createAmbience, initialAmbience } from "./ambience";

function setup() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const media = Object.assign(new EventTarget(), {
    volume: 1, loop: false, preload: "auto" as const,
    play: vi.fn(() => new Promise<void>((yes, no) => { resolve = yes; reject = no; })),
    pause: vi.fn(), load: vi.fn(),
  });
  const factory = vi.fn(() => media);
  const report = vi.fn();
  const control = createAmbience(factory, report);
  return { media, factory, report, control, resolve: () => resolve(), reject: (error: unknown) => reject(error) };
}

describe("restaurant ambience ownership", () => {
  it("creates no media until restaurant presence and an explicit gesture", () => {
    const s = setup();
    s.control.update({ restaurant: true });
    expect(s.factory).not.toHaveBeenCalled();
    s.control.gesture();
    expect(s.media.play).toHaveBeenCalledOnce();
    expect(s.media.loop).toBe(true);
    s.control.gesture();
    s.control.update({ speaking: true });
    expect(s.media.play).toHaveBeenCalledOnce();
    expect(s.media.volume).toBeCloseTo(.042);
    s.control.update({ speaking: false });
    expect(s.media.volume).toBeCloseTo(.1575);
  });

  it("pauses hidden/leaving/muted/zero-level and reuses one element on return", () => {
    const s = setup();
    s.control.gesture();
    s.control.update({ restaurant: true });
    for (const [off, on] of [
      [{ visible: false }, { visible: true }],
      [{ restaurant: false }, { restaurant: true }],
      [{ muted: true }, { muted: false }],
      [{ level: 0 }, { level: .35 }],
    ]) {
      const pauses = s.media.pause.mock.calls.length;
      const plays = s.media.play.mock.calls.length;
      s.control.update(off);
      s.control.update(off);
      expect(s.media.pause).toHaveBeenCalledTimes(pauses + 1);
      s.control.update(on);
      s.control.update(on);
      expect(s.media.play).toHaveBeenCalledTimes(plays + 1);
    }
    expect(s.factory).toHaveBeenCalledOnce();
  });

  it("blocks policy failures until a fresh synchronous gesture", async () => {
    const s = setup();
    s.control.update({ restaurant: true });
    s.control.gesture();
    s.reject(new DOMException("gesture", "NotAllowedError"));
    await Promise.resolve();
    expect(s.report).toHaveBeenLastCalledWith("policy");
    s.control.update({ visible: true });
    expect(s.media.play).toHaveBeenCalledOnce();
    s.control.gesture();
    expect(s.media.load).not.toHaveBeenCalled();
    expect(s.media.play).toHaveBeenCalledTimes(2);
    s.resolve();
    await Promise.resolve();
    expect(s.report).toHaveBeenLastCalledWith(null);
  });

  it("invalidates stale promise settlements when hidden then resumed", async () => {
    const s = setup();
    s.control.update({ restaurant: true });
    s.control.gesture();
    const firstReject = s.reject;
    // Capture the first play promise directly, before a subsequent call replaces it.
    const first = s.media.play.mock.results[0].value;
    s.control.update({ visible: false });
    firstReject(new DOMException("interrupted", "AbortError"));
    s.control.update({ visible: true });
    s.resolve();
    await first.catch(() => {});
    await Promise.resolve();
    expect(s.report).not.toHaveBeenCalledWith("load");
    expect(s.report).toHaveBeenLastCalledWith(null);
  });

  it("handles runtime errors and disposal without restart or foreground changes", async () => {
    const s = setup();
    s.control.update({ restaurant: true });
    s.control.gesture();
    s.media.dispatchEvent(new Event("error"));
    expect(s.report).toHaveBeenLastCalledWith("load");
    s.resolve();
    await Promise.resolve();
    expect(s.report).toHaveBeenLastCalledWith("load");
    s.control.gesture();
    expect(s.media.load).toHaveBeenCalledOnce();
    s.control.dispose();
    s.control.dispose();
    s.control.gesture();
    s.control.update({ restaurant: true });
    s.media.dispatchEvent(new Event("error"));
    expect(s.media.play).toHaveBeenCalledTimes(2);
    expect(s.media.pause).toHaveBeenCalledTimes(2);
  });

  it("clamps levels and rejects nonfinite levels", () => {
    expect(ambienceVolume({ ...initialAmbience, level: 99 })).toBe(.45);
    for (const level of [-1, NaN, Infinity])
      expect(ambienceVolume({ ...initialAmbience, level })).toBe(0);
  });
});
