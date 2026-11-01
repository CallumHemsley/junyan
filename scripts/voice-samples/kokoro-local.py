"""Render the authored comparison corpus locally; no API keys or voice cloning.

Setup (Python 3.12):
  python3.12 -m venv output/kokoro-venv
  output/kokoro-venv/bin/python -m pip install -r scripts/voice-samples/kokoro-local-requirements.txt
Run --self-check, then --limit 1 for a smoke clip, then without --limit for all 40.
Output defaults to this checkout's ignored output/voice-samples/kokoro directory.
Pass --output explicitly when delivering to a shared directory.
"""

import argparse
from datetime import datetime, timezone
import hashlib
from importlib.metadata import distributions
import json
import os
from pathlib import Path
import platform
import tempfile
import time

import numpy as np
import soundfile as sf


ROOT = Path(__file__).resolve().parents[2]
MODEL_ID = "hexgrad/Kokoro-82M"
REVISION = "f3ff3571791e39611d31c381e3a41a3af07b4987"
VOICES = ("zf_xiaobei", "zm_yunxi")
SAMPLE_RATE = 24000
SOURCES = [
    f"https://huggingface.co/{MODEL_ID}/blob/{REVISION}/README.md",
    f"https://huggingface.co/{MODEL_ID}/blob/{REVISION}/VOICES.md",
    "https://github.com/hexgrad/kokoro/blob/main/kokoro/model.py",
    "https://github.com/hexgrad/kokoro/blob/main/kokoro/pipeline.py",
    "https://github.com/hexgrad/misaki/blob/main/misaki/zh.py",
    "https://blaizzy.github.io/mlx-audio/models/tts/kokoro/",
]


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def sha256(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_audio(audio, sample_rate):
    if sample_rate != SAMPLE_RATE or audio.ndim != 1 or not audio.size:
        raise ValueError("Expected nonempty mono 24 kHz audio")
    if not np.isfinite(audio).all():
        raise ValueError("Nonfinite audio samples")
    duration = audio.size / sample_rate
    peak = float(np.max(np.abs(audio)))
    rms = float(np.sqrt(np.mean(audio.astype(np.float64) ** 2)))
    clipped = int(np.count_nonzero((audio >= 32767 / 32768) | (audio <= -1)))
    if not 0.2 <= duration <= 30 or rms <= 1e-5 or clipped:
        raise ValueError(f"Invalid duration, silence or clipping: {duration=}, {rms=}, {clipped=}")
    return {
        "sample_rate_hz": sample_rate,
        "channels": 1,
        "frames": int(audio.size),
        "duration_seconds": duration,
        "peak_absolute": peak,
        "rms": rms,
        "finite_samples": True,
        "clipped_samples": clipped,
    }


def self_check():
    waveform = (0.1 * np.sin(2 * np.pi * 440 * np.arange(SAMPLE_RATE) / SAMPLE_RATE)).astype(np.float32)
    assert validate_audio(waveform, SAMPLE_RATE)["duration_seconds"] == 1
    for invalid in (np.zeros(24000), np.full(24000, np.nan), np.full(24000, np.inf),
                    np.ones(24000), -np.ones(24000), waveform[:1], waveform[:, None]):
        try:
            validate_audio(invalid, SAMPLE_RATE)
        except ValueError:
            continue
        raise AssertionError("Invalid audio passed validation")
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "roundtrip.wav"
        sf.write(path, waveform, SAMPLE_RATE, subtype="PCM_16")
        decoded, rate = sf.read(path, dtype="float32")
        assert validate_audio(decoded, rate)["clipped_samples"] == 0
        assert sf.info(path).subtype == "PCM_16"
    print("Self-check passed: finite, duration, mono, silence, clipping and WAV round-trip", flush=True)


def write_manifest(path, manifest):
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "output/voice-samples/kokoro")
    parser.add_argument("--limit", type=int, help="Generate only this many clips for a smoke test")
    parser.add_argument("--self-check", action="store_true")
    args = parser.parse_args()
    if args.self_check:
        self_check()
        return
    if args.limit is not None and not 1 <= args.limit <= 40:
        parser.error("--limit must be between 1 and 40")

    os.environ["HF_HOME"] = str(ROOT / "output/kokoro-hf")
    os.environ["HF_HUB_DISABLE_IMPLICIT_TOKEN"] = "1"
    os.environ["HF_HUB_DISABLE_XET"] = "1"
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    temporary_directory = ROOT / "output/kokoro-tmp"
    temporary_directory.mkdir(parents=True, exist_ok=True)
    tempfile.tempdir = str(temporary_directory)
    import torch
    from huggingface_hub import hf_hub_download
    from kokoro import KModel, KPipeline

    torch.set_num_threads(2)
    torch.set_num_interop_threads(1)
    torch.manual_seed(42)
    corpus_path = ROOT / "scripts/voice-samples/lines.json"
    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    lines = corpus["lines"]
    if corpus["language"] != "zh-CN" or [line["id"] for line in lines] != [f"T{number:02}" for number in range(1, 21)]:
        raise ValueError("Expected the twenty authored Mandarin lines T01–T20")
    for line in lines:
        if not isinstance(line["text"], str) or not line["text"].strip():
            raise ValueError("Every line needs nonempty plain Chinese text")
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    started = time.perf_counter()
    files = ["config.json", "kokoro-v1_0.pth", *(f"voices/{voice}.pt" for voice in VOICES)]
    assets = {filename: hf_hub_download(MODEL_ID, filename, revision=REVISION, token=False) for filename in files}
    manifest = {
        "model_id": MODEL_ID,
        "model_revision": REVISION,
        "model_release": "v1.0 (82M)",
        "model_assets": {filename: {"sha256": sha256(path)} for filename, path in assets.items()},
        "backend": "official kokoro / PyTorch CPU",
        "settings": {"lang_code": "z", "speed": 1.0, "device": "cpu", "dtype": "float32",
                     "torch_threads": 2, "torch_interop_threads": 1, "seed_base": 42,
                     "seed_rule": "42 + zero-based clip index (line-major, female then male)",
                     "sample_rate_hz": SAMPLE_RATE, "wav_subtype": "PCM_16",
                     "normalization": "none", "pronunciation_overrides": "none",
                     "voice_cloning": False},
        "system": {"platform": platform.platform(), "machine": platform.machine(), "python": platform.python_version()},
        "packages": {package.metadata["Name"]: package.version for package in distributions()},
        "corpus_path": str(corpus_path),
        "corpus_sha256": sha256(corpus_path),
        "output_directory": str(output),
        "started_at_utc": utc_now(),
        "expected_clips": 40,
        "requested_clips": args.limit or 40,
        "complete": False,
        "sources": SOURCES,
        "limitations": [
            "Native Mandarin pronunciation and listening review pending; signal checks do not verify speech accuracy.",
            "Official v1.0 voice card grades both Mandarin presets D overall, C target quality, with limited training data.",
            "v1.0 uses Misaki legacy jieba/pypinyin G2P; polyphones, neutral tones and tone sandhi are not guaranteed.",
            "reviewPronunciation is reviewer guidance only, never model input; no pinyin or SSML overrides applied.",
            "Stock synthetic presets only; no person-specific reference audio or cloning.",
        ],
        "clips": [],
    }
    model = KModel(repo_id=MODEL_ID, config=assets["config.json"], model=assets["kokoro-v1_0.pth"]).to("cpu").eval()
    pipeline = KPipeline(lang_code="z", repo_id=MODEL_ID, model=model, device="cpu")
    jobs = [(line, voice) for line in lines for voice in VOICES][:args.limit]
    for index, (line, voice) in enumerate(jobs):
        torch.manual_seed(42 + index)
        clip_started_at = utc_now()
        clip_started = time.perf_counter()
        with torch.inference_mode():
            results = list(pipeline(line["text"], voice=assets[f"voices/{voice}.pt"], speed=1.0))
        if not results or any(result.audio is None for result in results):
            raise ValueError(f"No audio for {line['id']} / {voice}")
        audio = np.concatenate([result.audio.detach().cpu().numpy().reshape(-1) for result in results])
        inference_seconds = time.perf_counter() - clip_started
        raw_metrics = validate_audio(audio, SAMPLE_RATE)
        filename = f"{line['id']}-{voice}.wav"
        path = output / filename
        temporary = path.with_suffix(".tmp.wav")
        sf.write(temporary, audio, SAMPLE_RATE, subtype="PCM_16")
        decoded, rate = sf.read(temporary, dtype="float32")
        metrics = validate_audio(decoded, rate)
        temporary.replace(path)
        manifest["clips"].append({
            "line_id": line["id"], "character": line["character"], "text": line["text"],
            "review_pronunciation": line["reviewPronunciation"], "voice": voice,
            "filename": filename, "sha256": sha256(path), "seed": 42 + index,
            "generated_at_utc": clip_started_at, "inference_seconds": inference_seconds,
            "phonemes": [result.phonemes for result in results],
            "raw_audio_metrics": raw_metrics, "wav_metrics": metrics,
        })
        manifest["updated_at_utc"] = utc_now()
        manifest["elapsed_seconds"] = time.perf_counter() - started
        manifest["complete"] = len(manifest["clips"]) == 40
        write_manifest(output / "manifest.json", manifest)
        print(f"{len(manifest['clips']):02}/40 {filename}: {metrics['duration_seconds']:.2f}s audio, {inference_seconds:.2f}s inference", flush=True)
    print(f"Saved {len(jobs)} real inference clips and {output / 'manifest.json'}", flush=True)


if __name__ == "__main__":
    main()
