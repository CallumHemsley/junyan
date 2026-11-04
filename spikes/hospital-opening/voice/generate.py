"""Voice the hospital-opening spike with the repo's own Qwen pipeline.

Reuses scripts/content-audio.py (LocalEngines, generate_clip, inspect_wav) so takes,
seeds, validation and PCM16 output match production. Run in a Qwen venv:

  /tmp/junyan-hospital-qwen-venv/bin/python spikes/hospital-opening/voice/generate.py
  .../python spikes/hospital-opening/voice/generate.py --audition doctor Ryan Aiden Uncle_Fu Dylan
"""

import argparse
import importlib.util
import json
import subprocess
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPIKE = HERE.parent
ROOT = SPIKE.parents[1]
spec = importlib.util.spec_from_file_location("content_audio", ROOT / "scripts" / "content-audio.py")
ca = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ca)

MODEL = "mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-4bit"
REVISION = "08c72cad5e2fd0f41730c8bd1f28149585e46361"
CAST = {"doctor": "Ryan", "nurse": "Vivian", "grandpa": "Uncle_Fu", "aunt": "Serena", "word": "Serena"}
LANGUAGE = {"en": "English", "zh": "Chinese"}
TARGET_ACTIVE_RMS_DBFS = -20.0
PEAK_CEILING_DBFS = -1.0


def preset(speaker, lang):
    return {"engine": "qwen", "model": MODEL, "revision": REVISION, "speaker": speaker,
            "language": LANGUAGE[lang], "speed": 1, "instructions": None}


def job(line, speaker, filename):
    identity = {"generator_version": ca.VERSION, "kind": "spike-hospital", "text": line["text"],
                "voice": preset(speaker, line["lang"]), "pronunciation": ca.PRONUNCIATION}
    return {**identity, "content_digest": ca.digest(ca.canonical(identity)), "filename": filename,
            "key": line["key"], "who": line["who"]}


def synth(jobs, output, engines):
    output.mkdir(parents=True, exist_ok=True)
    records = []
    for j in jobs:
        started = time.perf_counter()
        try:
            record = ca.generate_clip(j, output, engines)
        except ValueError as error:
            if j["who"] != "word":
                raise
            print(f"SKIP word {j['text']}: {error}", flush=True)
            continue
        record["generation_seconds"] = round(time.perf_counter() - started, 2)
        records.append(record)
        m = record["wav_metrics"]
        print(f"{j['filename']:<22} {record['generation_seconds']:>6.2f}s gen  {m['duration_seconds']:5.2f}s  "
              f"peak {m['peak_absolute']:.3f} rms {m['rms']:.4f}  {j['text']}", flush=True)
    return records


def word_too_long(record, stats):
    # A content-audio take may be up to 4s; a single word that long is the model babbling.
    speech = stats["duration_s"] - stats["lead_s"] - stats["tail_s"]
    return speech > 0.6 + 0.5 * len(record["text"])


def level(records, output):
    """Spike-only post step: drop babbling word takes, then gain every clip to one loudness."""
    import numpy as np
    import soundfile as sf
    from analyze import analyze

    kept = []
    for r in records:
        path = output / r["filename"]
        before = analyze(path)
        if r["who"] == "word" and word_too_long(r, before):
            path.unlink()
            print(f"DROP word {r['text']}: {before['duration_s']}s for {len(r['text'])} hanzi", flush=True)
            continue
        audio, sr = sf.read(path, dtype="float32")
        gain = min(TARGET_ACTIVE_RMS_DBFS - before["active_rms_dbfs"], PEAK_CEILING_DBFS - before["peak_dbfs"])
        sf.write(path, np.clip(audio * 10 ** (gain / 20), -0.999, 0.999), sr, subtype="PCM_16")
        r["level"] = {"gain_db": round(float(gain), 1), "before": before, "after": analyze(path)}
        kept.append(r)
    return kept


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audition", nargs="+", metavar=("WHO", "SPEAKER"),
                        help="Voice one cast member's lines with each speaker into voice/auditions/")
    parser.add_argument("--words", action="store_true", help="Also voice every word with CAST['word']")
    args = parser.parse_args()
    data = json.loads(subprocess.run(["node", str(HERE / "lines.mjs"), "A"], check=True,
                                     capture_output=True, text=True).stdout)
    engines = ca.LocalEngines()
    load = time.perf_counter()

    if args.audition:
        who, speakers = args.audition[0], args.audition[1:]
        lines = [l for l in data["lines"] if l["who"] == who]
        out = HERE / "auditions"
        jobs = [job(l, s, f"{who}-{s}-{i:02d}.wav") for s in speakers for i, l in enumerate(lines)]
        synth(jobs, out, engines)
        return

    lines = data["lines"]
    jobs = [job(l, CAST[l["who"]], f"{i:02d}-{l['who']}-{l['lang']}.wav") for i, l in enumerate(lines)]
    if args.words:
        jobs += [job(w, CAST["word"], f"w{i:02d}.wav") for i, w in enumerate(data["words"])]
    out = SPIKE / "audio"
    records = level(synth(jobs, out, engines), out)
    print(f"total wall {time.perf_counter() - load:.1f}s", flush=True)

    clips = {r["key"]: "audio/" + r["filename"] for r in records if r["who"] != "word"}
    words = {r["key"]: "audio/" + r["filename"] for r in records if r["who"] == "word"}
    (out / "manifest.js").write_text(
        "// Generated by voice/generate.py. Keys are exact content.js strings.\n"
        f"window.AUDIO = {json.dumps(clips, ensure_ascii=False, indent=2)};\n"
        f"window.AUDIO_WORDS = {json.dumps(words, ensure_ascii=False, indent=2)};\n")
    provenance = [{k: r[k] for k in ("filename", "key", "who", "text", "voice", "attempts", "generation_seconds",
                                      "wav_metrics", "level", "engine_details", "packages", "created_at")} for r in records]
    (HERE / "provenance.json").write_text(json.dumps({"cast": CAST, "clips": provenance},
                                                     ensure_ascii=False, indent=2, default=float))


if __name__ == "__main__":
    main()
