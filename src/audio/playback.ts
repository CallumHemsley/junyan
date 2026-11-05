type Media = Pick<HTMLAudioElement, "play" | "pause" | "addEventListener" | "removeEventListener">;
export type PlaybackError = "policy" | "load" | null;

export function createPlayback(
  createAudio: (url: string) => Media,
  report: (error: PlaybackError) => void,
  speaking: (active: boolean) => void = () => {},
) {
  let current: { audio: Media; onError: () => void } | null = null;
  let request = 0;

  const stop = () => {
    request++;
    const previous = current;
    current = null;
    if (previous) {
      previous.audio.removeEventListener("error", previous.onError);
      previous.audio.pause();
    }
    speaking(false);
    report(null);
  };

  const play = (url: string, onEnded?: () => void) => {
    stop();
    const attempt = request;
    const audio = createAudio(url);
    let failed = false;
    const onError = () => {
      if (attempt !== request) return;
      failed = true;
      speaking(false);
      report("load");
    };
    current = { audio, onError };
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", () => {
      if (attempt !== request) return;
      speaking(false);
      onEnded?.();
    });
    speaking(true);
    audio.play().then(
      () => {
        if (attempt === request && !failed) report(null);
      },
      (error: unknown) => {
        if (attempt !== request) return;
        speaking(false);
        report(
          error instanceof Error && error.name === "NotAllowedError"
            ? "policy"
            : "load",
        );
      },
    );
  };

  return { play, stop };
}
