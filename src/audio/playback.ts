type Media = Pick<HTMLAudioElement, "play" | "pause" | "addEventListener" | "removeEventListener">;
export type PlaybackError = "policy" | "load" | null;

export function createPlayback(
  createAudio: (url: string) => Media,
  report: (error: PlaybackError) => void,
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
      report("load");
    };
    current = { audio, onError };
    audio.addEventListener("error", onError);
    if (onEnded)
      audio.addEventListener("ended", () => {
        if (attempt === request) onEnded();
      });
    audio.play().then(
      () => {
        if (attempt === request && !failed) report(null);
      },
      (error: unknown) => {
        if (attempt !== request) return;
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
