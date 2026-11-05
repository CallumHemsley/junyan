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

The injected audio routing is observable instrumentation. The browser uses normal autoplay policy. Timed screenshots currently supply approximately twelve motion samples per second, encoded at 30FPS; encoding adds no motion detail. Independent Mandarin pronunciation review and physical speaker listening are separate checks. Large video/frame outputs remain in ignored `output/playwright/`.

Final feature recordings wait for ticket 0073's actual feature voices and the parent's consolidated reviewed application build.

## Verified rehearsal

`output/playwright/neighbourhood-rehearsal/walkthrough.mp4` is the 29.476-second real restaurant rehearsal. Its accepted order speech matches the source waveform at correlation 0.999523 and 16.5ms alignment difference. H264/AAC streams and signal RMS 0.02946 / peak 0.41884 passed. The visible speaking frame was inspected. The committed verification JSON records the exact game source and played asset hashes. No claim of physical-speaker audition or Mandarin pronunciation review is made.
