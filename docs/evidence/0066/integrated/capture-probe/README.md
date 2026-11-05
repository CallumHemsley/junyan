# Cloud technical capture probe

This is a capture pipeline proof, not any of the four feature demos or combined tour. It uses one existing accepted game word, 包子. No missing feature voice has been generated, substituted, or represented as available.

## Artifact and evidence

- `technical-capture-probe.mp4`: 5.998 seconds; H.264 1280x720, AAC stereo 48 kHz. Screenshots sampled at about 10 FPS and encoded at 30 FPS (encoding does not create additional motion detail).
- `browser-audio.webm`: browser MediaRecorder's actual live output.
- `captured-audio.wav`: audio decoded from final MP4 for numerical verification.
- `capture.json`: source provenance, exact asset hash, click/play/ended timestamps, screenshot timing.
- `verification.json`: numerical source-to-recorded comparison and explicit limitations.
- `ffprobe.json`, `audio-astats.txt`: media streams and signal evidence.
- `frame-015.png`: visually inspected while playback was active; clear TECHNICAL CAPTURE PROBE label.

Recorded audio is nonzero: PCM RMS 0.02391498, peak 0.37084961. Normalized waveform correlation to the accepted source is 0.99835231. Source begins at 1.0885 seconds in final audio; logged playback request was at 1.077 seconds relative to first frame. Manifest text and waveform correlation identify this existing asset; no independent auditory or Mandarin pronunciation review was performed.

The accepted source is read from `/workspace/junyan-foundation/public/audio/word-38b900b7043b65d129f2d1de05b197b44939210515737e76d52e8b18bf008f21.wav`. Its SHA-256 matches the manifest: `f0b200f56e9158845e751dc993599e6ce8df0b4a0be91876e95cd0158ff2f8f0`.

## Reproduce

Run serially, with no other process using strict loopback port 5480:

```sh
/workspace/.junyan-tools/node_modules/node/bin/node /workspace/junyan-capture-probe/probe.cjs
python3 /workspace/junyan-capture-probe/verify.py
ffprobe -v error -show_streams -show_format /workspace/junyan-capture-probe/technical-capture-probe.mp4
```

No product edits, package installs, external network calls, server on 5466, gh, AWS, or local-device resources are needed. The standalone probe server closes after capture. Chromium's subprocess and output writes require the task's authorized cloud execution permissions.

## Method reusable for actual demos

`browser-capture-init.cjs` exports a Playwright init function. Register with `await page.addInitScript(require('/workspace/junyan-capture-probe/browser-capture-init.cjs'))` before navigation. It observes the game's native HTMLMediaElement playback, routes each actual element through WebAudio both to its normal output and to a recording destination, and logs playback source and timestamps. It creates no speech and makes no replacement WAV. The current game uses `new Audio(url)` for speech and ambience, which is covered. Dynamically inserted `<audio>`/`<video>` elements are tapped on play; sources introduced after recording begins need separate timing validation. Cross-origin media needs CORS permission or yields silence; current game assets are same-origin.

Tap `new Audio()` elements before recording begins: the constructor Proxy in the supplied init establishes the MediaStream graph early. The first trial with only a play-time hook lost leading recorder time; the corrected constructor hook is what produced the verified artifact. Do not remove it without re-verifying alignment.

Call `window.captureProbe.start()` in the page, retain its start epoch, then perform genuine UI actions while sampling browser screenshots. Call `window.captureProbe.stop()` and save the returned base64 audio. Retain screenshot wall-clock timestamps and use concat durations as in `probe.cjs`. Trim only the measured first-frame offset from the recorded browser audio before muxing. The final audio comes from MediaRecorder, never a separately selected source WAV; the source WAV is used only for offline verification.

For final feature recordings, navigate the actual reviewed feature build and replace the standalone probe UI/button action with real game interactions. Verify expected asset URLs for each action, missing/error state absence, audio RMS, timing, source waveform correspondence, and screenshot quality. The four requested feature demos and combined tour remain blocked by genuine missing feature assets. Ten FPS is enough for this technical proof; final motion quality requires appropriate capture cadence and independent review.

## Access and limits

The managed environment reports shared-desktop capability, but no callable desktop/browser-control or cloud-port-forwarding tools were exposed to this task. No supported browser preview URL was established. Files listed here are cloud artifacts, not hosted links. This method proves browser rendering and audio graph recording; it does not prove playback on a physical speaker or independently certify Mandarin quality. It does not capture WebAudio sources created independently by future product code; audit those paths if the game changes.

Instrumentation preserves native `play()` invocation and its return promise and connects the media source to the normal AudioContext output as well as the recorder. However, it changes the runtime audio routing and wraps the global constructor/prototype; this is observable instrumentation, not a guarantee of identical browser behavior. The probe validates constructor-created HTMLAudioElement playback only. Actual game navigation, overlapping speech/ambience, cancellation, mute/volume, page transitions, context suspension, long-duration drift, audio policy/error handling, and DOM-created media still require a short real-game capture check before relying on this for final demos. The probe launches with `--autoplay-policy=no-user-gesture-required`; final user-facing behavior should separately be checked under the normal browser audio policy. Do not report that policy-bypassed capture as an autoplay usability test.
