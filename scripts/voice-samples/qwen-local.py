"""Local CustomVoice audition. Run with output/qwen-venv/bin/python; no API keys."""

import argparse
import hashlib
import importlib.metadata
import json
import platform
import time
from datetime import datetime, timezone
from pathlib import Path

import mlx.core as mx
import numpy as np
import soundfile as sf
from huggingface_hub import snapshot_download
from mlx_audio.tts.utils import load_model


MODEL = "mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-4bit"
REVISION = "08c72cad5e2fd0f41730c8bd1f28149585e46361"
OUTPUT = Path("/Users/callumhemsley/Personal/junyan/output/voice-samples/qwen")
SETTINGS = {
    "language": "Chinese",
    "instruct": None,
    "temperature": 0.9,
    "max_tokens": 96,
    "top_k": 50,
    "top_p": 1.0,
    "repetition_penalty": 1.05,
    "stream": False,
    "verbose": False,
}


def audio_metrics(audio, sample_rate):
    if audio.ndim != 1 or audio.size == 0 or sample_rate <= 0:
        raise ValueError("Expected nonempty mono audio with a positive sample rate")
    if not np.isfinite(audio).all():
        raise ValueError("Audio contains nonfinite samples")
    peak = float(np.abs(audio).max())
    if peak == 0 or peak >= 1:
        raise ValueError(f"Silent or clipping audio: peak={peak}")
    return {
        "sample_rate": sample_rate,
        "samples": int(audio.size),
        "duration_seconds": audio.size / sample_rate,
        "peak_absolute": peak,
        "rms": float(np.sqrt(np.mean(audio.astype(np.float64) ** 2))),
        "clipped_samples": int(np.count_nonzero(np.abs(audio) >= 1)),
        "finite": True,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--limit", type=int, help="Generate only this many new clips")
    args = parser.parse_args()
    if args.limit is not None and args.limit < 1:
        parser.error("--limit must be positive")
    source = Path(__file__).with_name("lines.json")
    corpus = json.loads(source.read_text())
    lines = corpus["lines"]
    assert len(lines) == 20 and len({line["id"] for line in lines}) == 20
    assert all(line["text"] and not any(char.isascii() and char.isalpha() for char in line["text"]) for line in lines)
    source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
    args.output.mkdir(parents=True, exist_ok=True)
    manifest_path = args.output / "manifest.json"
    identity = {"model_id": MODEL, "model_revision": REVISION, "settings": SETTINGS}
    manifest = {
        **identity,
        "source_model_id": "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
        "lines_sha256": source_hash,
        "python": platform.python_version(),
        "platform": platform.platform(),
        "packages": {name: importlib.metadata.version(name) for name in ("mlx-audio", "mlx", "numpy", "soundfile", "transformers", "huggingface-hub")},
        "memory_limit_bytes": 5_000_000_000,
        "postprocessing": "None; unnormalized mono float32 WAV, native sample rate, natural model pace",
        "review_status": "Technical validation only; native Mandarin listening review pending",
        "clips": [],
    }
    if manifest_path.exists():
        existing = json.loads(manifest_path.read_text())
        if any(existing[key] != manifest[key] for key in (*identity, "lines_sha256", "packages", "python")):
            raise ValueError("Output manifest differs from this run; use a fresh output directory")
        manifest = existing
    completed = {clip["filename"]: clip for clip in manifest["clips"]}
    mx.set_memory_limit(manifest["memory_limit_bytes"])
    mx.set_cache_limit(256_000_000)
    started = time.perf_counter()
    model_path = snapshot_download(MODEL, revision=REVISION, token=False)
    model = load_model(Path(model_path))
    manifest["last_model_load_seconds"] = time.perf_counter() - started
    generated = 0
    for line in lines:
        for voice in ("Serena", "Uncle_Fu"):
            filename = f"{line['id']}-{voice}.wav"
            destination = args.output / filename
            if filename in completed:
                clip = completed[filename]
                if clip["text"] != line["text"] or clip["voice"] != voice or hashlib.sha256(destination.read_bytes()).hexdigest() != clip["sha256"]:
                    raise ValueError(f"Existing clip does not match provenance: {destination}")
                audio, sample_rate = sf.read(destination, dtype="float32")
                audio_metrics(audio, sample_rate)
                continue
            if destination.exists():
                raise FileExistsError(f"Refusing to overwrite an untracked clip: {destination}")
            seed = 42 + int(line["id"][1:]) * 2 + (voice == "Uncle_Fu")
            attempts = []
            for attempt in range(3):
                attempt_seed = seed + attempt * 1000
                mx.random.seed(attempt_seed)
                mx.reset_peak_memory()
                started = time.perf_counter()
                results = list(model.generate_custom_voice(text=line["text"], speaker=voice, **SETTINGS))
                if len(results) != 1:
                    raise ValueError(f"Expected one generation result: {filename}")
                result = results[0]
                audio = np.asarray(result.audio, dtype=np.float32)
                elapsed = time.perf_counter() - started
                metrics = audio_metrics(audio, result.sample_rate)
                accepted = result.token_count < SETTINGS["max_tokens"] and metrics["duration_seconds"] <= 6
                attempts.append({"seed": attempt_seed, "elapsed_seconds": elapsed, "token_count": result.token_count, "duration_seconds": metrics["duration_seconds"], "accepted": accepted})
                if accepted:
                    break
                print(f"Retaking {filename}: token cap or duration over six seconds", flush=True)
                del audio, result, results
                mx.clear_cache()
            else:
                raise ValueError(f"No uncapped, short audition take after three attempts: {filename}")
            temporary = destination.with_suffix(".tmp.wav")
            sf.write(temporary, audio, result.sample_rate, subtype="FLOAT")
            saved_audio, saved_rate = sf.read(temporary, dtype="float32")
            assert np.array_equal(saved_audio, audio) and saved_rate == result.sample_rate
            temporary.replace(destination)
            clip = {
                **identity,
                "id": line["id"], "character": line["character"],
                "filename": filename, "text": line["text"], "voice": voice,
                "seed": attempt_seed, "elapsed_seconds": elapsed,
                "attempts": attempts,
                "total_elapsed_seconds": sum(item["elapsed_seconds"] for item in attempts),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "token_count": result.token_count,
                "peak_mlx_memory_bytes": mx.get_peak_memory(),
                "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
                **metrics,
            }
            manifest["clips"].append(clip)
            manifest["complete"] = len(manifest["clips"]) == len(lines) * 2
            temporary_manifest = manifest_path.with_suffix(".tmp.json")
            temporary_manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
            temporary_manifest.replace(manifest_path)
            print(f"{filename}: {metrics['duration_seconds']:.2f}s audio in {elapsed:.2f}s; peak={metrics['peak_absolute']:.4f}", flush=True)
            del audio, saved_audio, result, results
            mx.clear_cache()
            generated += 1
            if args.limit is not None and generated >= args.limit:
                return


if __name__ == "__main__":
    main()
