# Playable neighbourhood audio demos

The capture tool runs the real local application and clicks its visible controls. Speech and ambience are the game's native HTMLMediaElement playback, routed to normal WebAudio output and a live MediaRecorder destination. No source audio is added during export. A zero-valued WebAudio source keeps the recorder clock advancing before the first sound.

## Reproduce

From a reviewed integrated checkout with its feature audio present:

```sh
pnpm dev --host 127.0.0.1 --port 5474 --strictPort
node scripts/record-neighbourhood-demo.mjs rehearsal
python3 scripts/record-neighbourhood-demo.py output/playwright/neighbourhood-rehearsal
node scripts/record-neighbourhood-demo.mjs tour
python3 scripts/record-neighbourhood-demo.py output/playwright/neighbourhood-tour
```

`JUNYAN_DEMO_URL` can select an existing loopback server. `JUNYAN_DEMO_OUTPUT` changes the ignored output directory. The scripts use the installed Playwright dependency and local ffmpeg/ffprobe. They make no network service or production changes.

The rehearsal skips the opening through the existing development hook. The full tour plays the normal opening, visits all four locations, arranges and rotates furniture, earns the cat cushion, repairs the lamp and toy, cares for the garden, finishes the restaurant day through its controls, then observes next-day growth. The development state hook only reads the current order and verifies the resulting day. No silent response fixtures, injected successes, or synthetic narration are used.

Each capture preserves source SHA, UI actions, actual play/playing/pause/ended events, screenshot timestamps and console/network errors in `capture.json`. Export writes H264/AAC MP4, per-chapter clips, `ffprobe.json` and `verification.json`. Verification requires nonzero audio and a normalized waveform match to at least one actually played source asset, with measured alignment against its real playback event. Played assets have SHA256 provenance.

The injected audio routing is observable instrumentation. The browser uses normal autoplay policy. Final timed screenshots supply 22.82 motion samples per second, encoded at 30FPS; encoding adds no motion detail. Independent Mandarin pronunciation review and physical speaker listening are separate checks. Large video/frame outputs remain in ignored `output/playwright/`.

Final recordings use the reviewed integrated build and ticket 0073's genuine feature voices.

## Verified rehearsal

`output/playwright/neighbourhood-rehearsal/walkthrough.mp4` is the 29.476-second real restaurant rehearsal. Its accepted order speech matches the source waveform at correlation 0.999523 and 16.5ms alignment difference. H264/AAC streams and signal RMS 0.02946 / peak 0.41884 passed. The visible speaking frame was inspected. The committed verification JSON records the exact game source and played asset hashes. No claim of physical-speaker audition or Mandarin pronunciation review is made.

## Final videos

Recorded from reviewed integrated game source `7b27ca44a7ed5c9a0eebb45a6a06145beb381287` at `http://127.0.0.1:5474/`. Actual browser playback was recorded for the normal opening, all four locations, four fully served restaurant customers, and day-two garden growth. No feature progress was prepared or injected. Source SHA, native playback events, actions, final state and actual played asset hashes are preserved in `final/`.

The ignored MP4 files are in `output/playwright/neighbourhood-tour/`:

- `walkthrough.mp4`: 296.433s, RMS 0.05630; source correlation 0.85853–0.99985; maximum absolute timing difference 16.5ms.
- `apartment.mp4`: 15.938s, RMS 0.04016; source correlation 0.90673–0.99977; maximum absolute timing difference 19.0ms.
- `cats.mp4`: 33.667s, RMS 0.04052; source correlation 0.85863–0.99985; maximum absolute timing difference 17.0ms.
- `repairs.mp4`: 48.678s, RMS 0.04901; source correlation 0.87744–0.94783; maximum absolute timing difference 19.0ms.
- `garden.mp4`: 32.433s, RMS 0.03767; source correlation 0.87710–0.99973; maximum absolute timing difference 17.5ms.
- `neighbourhood-combined.mp4`: 130.700s, RMS 0.04320; source correlation 0.85863–0.99977; maximum absolute timing difference 19.5ms.

All six exports contain H264 video and AAC audio and have per-file SHA256, ffprobe results, nonzero PCM signal checks and genuine source speech waveform matches. Both full and combined tours match one actual line from every feature and a late event. Each individual feature clip independently matches its feature line and a late event. All timing differences are below 20ms.

The combined cut is 2m11s. It retains the garden before/after and omits the opening and restaurant day; the full 4m56s walkthrough preserves that real gameplay. The garden clip joins its genuine day-one and day-two visits. No audio is added in editing. Encoded speaking frames from all four individual videos and the captured final growth screen were visually inspected. The source capture had 6770 frames over 296.647s, 22.82 measured visual samples/s, and zero browser/network errors.

These recordings demonstrate audible source playback and synchronization through numerical checks. Physical-speaker audition and an independent Mandarin pronunciation review were not performed by the capture agent.
