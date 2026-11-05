export type AmbienceState = {
  restaurant: boolean;
  visible: boolean;
  unlocked: boolean;
  muted: boolean;
  level: number;
  speaking: boolean;
};
export type AmbienceError = "policy" | "load" | null;
type Media = Pick<HTMLAudioElement,
  "play" | "pause" | "volume" | "loop" | "preload" | "addEventListener" | "removeEventListener">;

export const ambienceAsset = "audio/ambience/breakfast.mp3";
export const initialAmbience: AmbienceState = {
  restaurant: false, visible: true, unlocked: false,
  muted: false, level: 0.35, speaking: false,
};

export function ambienceVolume(state: AmbienceState) {
  if (state.muted || !Number.isFinite(state.level)) return 0;
  return Math.max(0, Math.min(1, state.level)) * (state.speaking ? 0.12 : 0.45);
}

/** One owner per mounted application. Call gesture synchronously from a user action. */
export function createAmbience(
  createAudio: () => Media,
  report: (error: AmbienceError) => void = () => {},
) {
  let state = { ...initialAmbience };
  let media: Media | null = null;
  let requested = false;
  let blocked = false;
  let disposed = false;
  let generation = 0;

  const halt = () => {
    generation++;
    const wasRequested = requested;
    requested = false;
    if (wasRequested) media?.pause();
  };
  const fail = (error: unknown) => {
    blocked = true;
    halt();
    report(error instanceof Error && error.name === "NotAllowedError" ? "policy" : "load");
  };
  const onError = () => { if (requested && !disposed) fail(null); };
  const sync = () => {
    if (disposed) return;
    const volume = ambienceVolume(state);
    if (media) media.volume = volume;
    if (!state.restaurant || !state.visible || !state.unlocked || volume === 0) {
      halt();
      return;
    }
    if (requested || blocked) return;
    if (!media) {
      media = createAudio();
      media.loop = true;
      media.preload = "none";
      media.addEventListener("error", onError);
    }
    media.volume = volume;
    requested = true;
    const attempt = ++generation;
    try {
      media.play().then(() => {
        if (attempt === generation && !disposed) report(null);
      }, error => {
        if (attempt === generation && !disposed) fail(error);
      });
    } catch (error) {
      if (attempt === generation) fail(error);
    }
  };
  return {
    update(patch: Partial<Omit<AmbienceState, "unlocked">>) {
      state = { ...state, ...patch };
      sync();
    },
    gesture() {
      state.unlocked = true;
      blocked = false;
      sync();
    },
    dispose() {
      disposed = true;
      halt();
      media?.removeEventListener("error", onError);
    },
  };
}
