/**
 * Bakes sprite frames off the main thread for `prebake.ts` (ticket 0200). The same sprite code as the
 * page, so the same bytes; each frame's buffer is transferred, not copied.
 */
import { sprites } from "../../pixel/registry.ts";
import { bakeFrame } from "../../pixel/engine/prebake.ts";

type BakeJob = { map: string; sprites: { id: string; frames: number[] }[] };

self.onmessage = (event: MessageEvent<BakeJob>) => {
  const { map, sprites: jobs } = event.data;
  for (const { id, frames } of jobs) {
    const def = sprites[id];
    if (!def) continue;
    for (const index of frames) {
      const data = bakeFrame(def, index);
      (self as unknown as Worker).postMessage({ id, index, data }, [data.buffer]);
    }
  }
  (self as unknown as Worker).postMessage({ map, done: true });
};
