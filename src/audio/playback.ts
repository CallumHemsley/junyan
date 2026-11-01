type Media = Pick<HTMLAudioElement, "play" | "pause">;
export type PlaybackError = "policy" | "load" | null;

export function createPlayback(
  createAudio: (url: string) => Media,
  report: (error: PlaybackError) => void,
) {
  let current: Media | null = null;
  let request = 0;

  const stop = () => {
    request++;
    const previous = current;
    current = null;
    previous?.pause();
    report(null);
  };

  const play = (url: string) => {
    stop();
    const attempt = request;
    const audio = createAudio(url);
    current = audio;
    audio.play().then(
      () => {
        if (attempt === request) report(null);
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
