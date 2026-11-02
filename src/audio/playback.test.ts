import { describe, expect, it, vi } from "vitest";
import { createPlayback } from "./playback";

function setup() {
  const attempts: (EventTarget & {
    resolve: () => void;
    reject: (error: unknown) => void;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
  })[] = [];
  const report = vi.fn();
  const playback = createPlayback(() => {
    let resolve!: () => void;
    let reject!: (error: unknown) => void;
    const pending = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
    const media = Object.assign(new EventTarget(), { resolve, reject, play: vi.fn(() => pending), pause: vi.fn() });
    attempts.push(media);
    return media;
  }, report);
  return { playback, attempts, report };
}

describe("playback ownership", () => {
  it("reports a media failure after playback starts and recovers on retry", async () => {
    const { playback, attempts, report } = setup();
    playback.play("first.wav");
    attempts[0].resolve();
    await Promise.resolve();
    attempts[0].dispatchEvent(new Event("error"));
    expect(report).toHaveBeenLastCalledWith("load");
    playback.play("first.wav");
    attempts[1].resolve();
    await Promise.resolve();
    expect(report).toHaveBeenLastCalledWith(null);
  });

  it("does not let a late play success erase a current media failure", async () => {
    const { playback, attempts, report } = setup();
    playback.play("first.wav");
    attempts[0].dispatchEvent(new Event("error"));
    attempts[0].resolve();
    await Promise.resolve();
    expect(report).toHaveBeenLastCalledWith("load");
  });

  it("ignores errors from stopped media after a replacement starts", async () => {
    const { playback, attempts, report } = setup();
    playback.play("first.wav");
    playback.stop();
    attempts[0].dispatchEvent(new Event("error"));
    attempts[0].resolve();
    await Promise.resolve();
    expect(report).not.toHaveBeenCalledWith("load");
    playback.play("second.wav");
    attempts[1].resolve();
    await Promise.resolve();
    attempts[0].dispatchEvent(new Event("error"));
    expect(report).toHaveBeenLastCalledWith(null);
  });

  it("ignores an error event emitted synchronously while pausing", () => {
    const { playback, attempts, report } = setup();
    playback.play("first.wav");
    attempts[0].pause.mockImplementation(() => attempts[0].dispatchEvent(new Event("error")));
    playback.stop();
    expect(report).not.toHaveBeenCalledWith("load");
    expect(report).toHaveBeenLastCalledWith(null);
  });

  it("starts native playback synchronously, without a gesture-delaying await", () => {
    const { playback, attempts } = setup();
    playback.play("first.wav");
    expect(attempts[0].play).toHaveBeenCalledOnce();
  });

  it("ignores a superseded rejection after replacement succeeds", async () => {
    const { playback, attempts, report } = setup();
    playback.play("first.wav");
    playback.play("second.wav");
    attempts[1].resolve();
    await Promise.resolve();
    attempts[0].reject(new DOMException("Interrupted", "AbortError"));
    await Promise.resolve();
    expect(attempts[0].pause).toHaveBeenCalledOnce();
    expect(report).not.toHaveBeenCalledWith("load");
    expect(report).toHaveBeenLastCalledWith(null);
  });

  it("does not let stale success erase a current load failure", async () => {
    const { playback, attempts, report } = setup();
    playback.play("first.wav");
    playback.play("missing.wav");
    attempts[1].reject(new DOMException("Missing", "NotSupportedError"));
    await Promise.resolve();
    attempts[0].resolve();
    await Promise.resolve();
    expect(report).toHaveBeenLastCalledWith("load");
  });

  it.each(["NotSupportedError", "AbortError", "Error"])("reports current %s rather than blanket hiding it", async name => {
    const { playback, attempts, report } = setup();
    playback.play("broken.wav");
    attempts[0].reject(new DOMException("Failed", name));
    await Promise.resolve();
    expect(report).toHaveBeenLastCalledWith("load");
  });

  it("distinguishes policy rejection and allows direct-gesture retry", async () => {
    const { playback, attempts, report } = setup();
    playback.play("first.wav");
    attempts[0].reject(new DOMException("Gesture required", "NotAllowedError"));
    await Promise.resolve();
    expect(report).toHaveBeenLastCalledWith("policy");
    playback.play("first.wav");
    attempts[1].resolve();
    await Promise.resolve();
    expect(report).toHaveBeenLastCalledWith(null);
  });

  it("invalidates pending audio on stop, including synchronous pause rejection", async () => {
    const { playback, attempts, report } = setup();
    playback.play("first.wav");
    attempts[0].pause.mockImplementation(() => attempts[0].reject(new DOMException("Closed", "AbortError")));
    playback.stop();
    await Promise.resolve();
    expect(report).toHaveBeenLastCalledWith(null);
    expect(report).not.toHaveBeenCalledWith("load");
    playback.stop();
    expect(attempts[0].pause).toHaveBeenCalledOnce();
  });
});
