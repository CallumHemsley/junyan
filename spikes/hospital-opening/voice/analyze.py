"""Listen proxies for WAV clips: duration, peak/RMS dBFS, speech ratio, longest pause, median F0.

  /tmp/junyan-hospital-qwen-venv/bin/python spikes/hospital-opening/voice/analyze.py DIR [--json OUT]
"""

import argparse
import json
from pathlib import Path

import numpy as np
import soundfile as sf

FRAME = 0.03


def f0(frame, sr):
    frame = frame - frame.mean()
    corr = np.correlate(frame, frame, "full")[len(frame) - 1:]
    lo, hi = int(sr / 400), int(sr / 60)
    if corr[0] <= 0 or hi >= len(corr):
        return None
    lag = lo + int(np.argmax(corr[lo:hi]))
    return sr / lag if corr[lag] / corr[0] > 0.45 else None


def analyze(path):
    audio, sr = sf.read(path, dtype="float32")
    n = int(FRAME * sr)
    frames = audio[: len(audio) // n * n].reshape(-1, n)
    db = 20 * np.log10(np.sqrt((frames ** 2).mean(axis=1)) + 1e-9)
    active = db > db.max() - 35
    idx = np.flatnonzero(active)
    inner = active[idx[0]: idx[-1] + 1] if len(idx) else active
    pause = longest = 0
    for a in inner:
        pause = 0 if a else pause + 1
        longest = max(longest, pause)
    pitches = [p for fr, a in zip(frames, active) if a and (p := f0(fr, sr))]
    return {
        "file": path.name,
        "duration_s": round(len(audio) / sr, 2),
        "speech_s": round(float(len(inner) * FRAME), 2),
        "peak_dbfs": round(20 * np.log10(np.abs(audio).max()), 1),
        "rms_dbfs": round(20 * np.log10(np.sqrt((audio ** 2).mean())), 1),
        "active_rms_dbfs": round(20 * np.log10(np.sqrt((frames[active] ** 2).mean())), 1),
        "lead_s": round(idx[0] * FRAME, 2) if len(idx) else None,
        "tail_s": round((len(active) - 1 - idx[-1]) * FRAME, 2) if len(idx) else None,
        "speech_ratio": round(float(inner.mean()), 2),
        "longest_pause_s": round(longest * FRAME, 2),
        "median_f0_hz": round(float(np.median(pitches)), 0) if pitches else None,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dir", type=Path)
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()
    rows = [analyze(p) for p in sorted(args.dir.glob("*.wav"))]
    cols = list(rows[0])
    print("  ".join(f"{c:>15}" if c != "file" else f"{c:<24}" for c in cols))
    for r in rows:
        print("  ".join(f"{str(r[c]):>15}" if c != "file" else f"{r[c]:<24}" for c in cols))
    if args.json:
        args.json.write_text(json.dumps(rows, indent=2, default=float))


if __name__ == "__main__":
    main()
