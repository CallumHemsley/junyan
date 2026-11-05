import { expect, it, vi } from "vitest";
import { createPlayback } from "./playback";

it("publishes speech ownership through current end/error/stop and ignores stale settlements", async () => {
  const clips: (EventTarget & { reject: (error: unknown) => void })[] = [];
  const speaking = vi.fn();
  const playback = createPlayback(() => {
    let reject!: (error: unknown) => void;
    const pending = new Promise<void>((_, no) => { reject = no; });
    const audio = Object.assign(new EventTarget(), { play: () => pending, pause: vi.fn(), reject });
    clips.push(audio);
    return audio;
  }, () => {}, speaking);
  playback.play("first");
  expect(speaking).toHaveBeenLastCalledWith(true);
  playback.play("second");
  speaking.mockClear();
  clips[0].dispatchEvent(new Event("ended"));
  clips[0].reject(new DOMException("stale", "AbortError"));
  await Promise.resolve();
  expect(speaking).not.toHaveBeenCalled();
  clips[1].dispatchEvent(new Event("ended"));
  expect(speaking).toHaveBeenLastCalledWith(false);
  playback.play("third");
  clips[2].dispatchEvent(new Event("error"));
  expect(speaking).toHaveBeenLastCalledWith(false);
  playback.play("fourth");
  clips[3].reject(new DOMException("failed", "NotSupportedError"));
  await Promise.resolve();
  expect(speaking).toHaveBeenLastCalledWith(false);
  playback.play("fifth");
  playback.stop();
  expect(speaking).toHaveBeenLastCalledWith(false);
});
