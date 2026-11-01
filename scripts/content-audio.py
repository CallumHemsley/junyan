"""Content-addressed local Mandarin audio. --plan and --self-check need only Python."""

import argparse
from array import array
from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import importlib.metadata
import json
import math
import os
from pathlib import Path
import re
import sys
import tempfile
import unicodedata
import wave


ROOT = Path(__file__).resolve().parents[1]
VERSION = "content-audio-v1"
PRONUNCIATION = "unicode-nfc-native-frontend-no-sandhi-overrides-v1"
QWEN_SETTINGS = {"temperature": 0.9, "top_k": 50, "top_p": 1.0,
                 "repetition_penalty": 1.05, "stream": False, "verbose": False}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def atomic_write(path, data):
    descriptor, temporary = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        Path(temporary).unlink(missing_ok=True)


def write_json(path, value):
    atomic_write(path, (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode())


def validate_presets(config):
    voices = config["voices"]
    if config["wordVoice"] not in voices:
        raise ValueError("wordVoice must name a voice preset")
    for voice_id, preset in voices.items():
        required = {"engine", "model", "revision", "speaker", "language", "speed", "instructions"}
        if not isinstance(preset, dict) or not required <= preset.keys():
            raise ValueError(f"Incomplete voice preset: {voice_id}")
        if preset["engine"] not in ("qwen", "kokoro"):
            raise ValueError(f"Unsupported engine: {voice_id}")
        if not re.fullmatch(r"[0-9a-f]{40}", preset["revision"]):
            raise ValueError(f"Pin a full model commit revision: {voice_id}")
        if any(not isinstance(preset[key], str) or not preset[key].strip()
               for key in ("model", "speaker", "language")):
            raise ValueError(f"Nonempty model, speaker and language required: {voice_id}")
        speed = preset["speed"]
        if isinstance(speed, bool) or not isinstance(speed, (int, float)) or not 0.5 <= speed <= 2:
            raise ValueError(f"Invalid speed: {voice_id}")
        if preset["engine"] == "qwen" and speed != 1:
            raise ValueError("Qwen CustomVoice does not support changing speed")
        if preset["instructions"] is not None and not isinstance(preset["instructions"], str):
            raise ValueError(f"Invalid instructions: {voice_id}")
        if preset["engine"] == "kokoro" and preset["instructions"] is not None:
            raise ValueError("Kokoro does not support instructions")


def collect_jobs(content, config):
    validate_presets(config)
    voices = config["voices"]
    word_voice = config["wordVoice"]
    characters = content.get("characters", [])
    names = {character["name"]: character for character in characters}
    if len(names) != len(characters):
        raise ValueError("Character display names must be unique")
    jobs = {}

    def add(target, kind, voice_id):
        if voice_id not in voices:
            raise ValueError(f"Unknown voiceId: {voice_id}")
        text = ("".join(token["hanzi"] for token in target["tokens"])
                if kind == "line" else target["hanzi"])
        text = unicodedata.normalize("NFC", text)
        if not text.strip() or len(text) > 180:
            raise ValueError("Audio text must contain 1–180 characters")
        pronunciation = {"normalization": PRONUNCIATION,
                         "authored_pinyin": ([token.get("pinyin") for token in target["tokens"]]
                                             if kind == "line" else [target.get("pinyin")])}
        identity = {"generator_version": VERSION, "kind": kind, "text": text,
                    "voice": voices[voice_id], "pronunciation": pronunciation}
        content_digest = digest(canonical(identity))
        filename = f"{kind}-{content_digest}.wav"
        job = jobs.setdefault(filename, {**identity, "content_digest": content_digest,
                                       "filename": filename, "voice_ids": [], "targets": []})
        if voice_id not in job["voice_ids"]:
            job["voice_ids"].append(voice_id)
        job["targets"].append(target)

    def walk(value, voice_id):
        if isinstance(value, list):
            for item in value:
                walk(item, voice_id)
        elif isinstance(value, dict):
            if "tokens" in value:
                add(value, "line", voice_id)
            elif {"id", "hanzi", "audio"} <= value.keys():
                add(value, "word", word_voice)
            for item in value.values():
                if isinstance(item, (dict, list)):
                    walk(item, voice_id)

    for key, value in content.items():
        if key not in ("characters", "orders"):
            walk(value, word_voice)
    for character in characters:
        walk(character, character["voiceId"])
    for order in content.get("orders", []):
        if order["customer"] not in names:
            raise ValueError(f"No character matches order customer {order['customer']!r}")
        walk(order, names[order["customer"]]["voiceId"])
    return list(jobs.values())


def validate_samples(samples, sample_rate, text):
    if sample_rate != 24000 or not len(samples):
        raise ValueError("Expected nonempty mono audio at 24 kHz")
    if any(not math.isfinite(sample) for sample in samples):
        raise ValueError("Audio contains NaN or infinity")
    peak = max(abs(sample) for sample in samples)
    rms = math.sqrt(sum(sample * sample for sample in samples) / len(samples))
    duration = len(samples) / sample_rate
    if peak >= 1 or rms < 0.00001:
        raise ValueError(f"Silent or clipping audio: peak={peak}, rms={rms}")
    if not 0.12 <= duration <= min(120, max(4, len(text) * 0.65 + 2)):
        raise ValueError(f"Abnormal audio duration: {duration:.2f}s")
    return {"sample_rate": sample_rate, "samples": len(samples), "duration_seconds": duration,
            "peak_absolute": peak, "rms": rms}


def inspect_wav(path, text):
    with wave.open(str(path), "rb") as audio:
        if audio.getnchannels() != 1 or audio.getsampwidth() != 2 or audio.getcomptype() != "NONE":
            raise ValueError("Expected mono PCM16 WAV")
        sample_rate = audio.getframerate()
        frames = audio.getnframes()
        if frames > sample_rate * 120:
            raise ValueError("WAV exceeds duration limit")
        raw = audio.readframes(frames)
        if len(raw) != frames * 2:
            raise ValueError("Truncated WAV")
    samples = array("h", raw)
    if sys.byteorder != "little":
        samples.byteswap()
    if any(sample in (-32768, 32767) for sample in samples):
        raise ValueError("PCM16 audio reaches clipping boundary")
    return validate_samples([sample / 32768 for sample in samples], sample_rate, text)


def cache_valid(job, output, records):
    entry = records.get(job["filename"])
    path = output / job["filename"]
    try:
        if not entry or entry.get("content_digest") != job["content_digest"]:
            return False
        if entry.get("sha256") != digest(path.read_bytes()):
            return False
        inspect_wav(path, job["text"])
        return True
    except (OSError, ValueError, EOFError, wave.Error):
        return False


class LocalEngines:
    def __init__(self):
        self.models = {}

    def __call__(self, job, seed):
        preset = job["voice"]
        key = (preset["engine"], preset["model"], preset["revision"], preset["language"])
        os.environ["HF_HUB_DISABLE_IMPLICIT_TOKEN"] = "1"
        if preset["engine"] == "qwen":
            import mlx.core as mx
            import numpy as np
            from huggingface_hub import snapshot_download
            from mlx_audio.tts.utils import load_model

            mx.set_memory_limit(5_000_000_000)
            mx.set_cache_limit(256_000_000)
            if key not in self.models:
                self.models[key] = load_model(Path(snapshot_download(
                    preset["model"], revision=preset["revision"], token=False)))
            mx.random.seed(seed)
            max_tokens = min(2048, max(128, len(job["text"]) * 16 + 64))
            results = list(self.models[key].generate_custom_voice(
                text=job["text"], speaker=preset["speaker"], language=preset["language"],
                instruct=preset["instructions"], max_tokens=max_tokens, **QWEN_SETTINGS))
            if len(results) != 1 or results[0].token_count >= max_tokens:
                raise ValueError("Qwen returned multiple chunks or reached token cap")
            result = results[0]
            samples = np.asarray(result.audio, dtype=np.float32)
            if samples.ndim != 1:
                raise ValueError("Qwen returned non-mono audio")
            return samples.tolist(), int(result.sample_rate), {"token_count": result.token_count,
                    "max_tokens": max_tokens, "settings": QWEN_SETTINGS}
        import torch
        import numpy as np
        from huggingface_hub import hf_hub_download
        from kokoro import KModel, KPipeline

        def asset(filename):
            return hf_hub_download(preset["model"], filename, revision=preset["revision"], token=False)

        if key not in self.models:
            torch.set_num_threads(2)
            model = KModel(repo_id=preset["model"], config=asset("config.json"),
                           model=asset("kokoro-v1_0.pth")).to("cpu").eval()
            self.models[key] = KPipeline(lang_code=preset["language"], repo_id=preset["model"],
                                        model=model, device="cpu")
        torch.manual_seed(seed)
        with torch.inference_mode():
            results = list(self.models[key](job["text"], voice=asset(f"voices/{preset['speaker']}.pt"),
                                           speed=preset["speed"]))
        if not results or any(result.audio is None for result in results):
            raise ValueError("Kokoro returned no audio")
        samples = np.concatenate([result.audio.detach().cpu().numpy().reshape(-1) for result in results])
        return samples.tolist(), 24000, {"phonemes": [result.phonemes for result in results]}


def package_versions(engine):
    names = (("mlx-audio", "mlx", "numpy", "soundfile", "transformers", "huggingface-hub")
             if engine == "qwen" else ("kokoro", "misaki", "pypinyin", "torch", "numpy",
                                       "transformers", "huggingface-hub"))
    versions = {}
    for name in names:
        try:
            versions[name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            pass
    return versions


def generate_clip(job, output, generator):
    attempts = []
    for attempt in range(3):
        seed = (int(job["content_digest"][:8], 16) + attempt * 1000) % (2 ** 32)
        temporary = None
        try:
            samples, sample_rate, details = generator(job, seed)
            raw_metrics = validate_samples(samples, sample_rate, job["text"])
            pcm = array("h", (round(sample * 32768) for sample in samples))
            if sys.byteorder != "little":
                pcm.byteswap()
            descriptor, temporary = tempfile.mkstemp(suffix=".wav", prefix=".clip-", dir=output)
            os.close(descriptor)
            with wave.open(temporary, "wb") as audio:
                audio.setnchannels(1)
                audio.setsampwidth(2)
                audio.setframerate(sample_rate)
                audio.writeframes(pcm.tobytes())
            metrics = inspect_wav(temporary, job["text"])
            os.replace(temporary, output / job["filename"])
            attempts.append({"seed": seed, "accepted": True})
            return {key: value for key, value in job.items() if key != "targets"} | {
                "sha256": digest((output / job["filename"]).read_bytes()),
                "created_at": datetime.now(timezone.utc).isoformat(), "attempts": attempts,
                "packages": package_versions(job["voice"]["engine"]), "python": sys.version,
                "raw_metrics": raw_metrics, "wav_metrics": metrics, "engine_details": details,
                "postprocessing": "PCM16 quantization only; no gain, normalization, trim or resampling",
                "review_status": "Native Mandarin exact-text/pronunciation listening review pending"}
        except (ImportError, ModuleNotFoundError):
            raise
        except Exception as error:
            attempts.append({"seed": seed, "accepted": False, "error": str(error)})
        finally:
            if temporary:
                Path(temporary).unlink(missing_ok=True)
    raise ValueError(f"Three rejected takes: {attempts}")


@contextmanager
def output_lock(output):
    import fcntl

    output.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(output / ".content-audio.lock", os.O_CREAT | os.O_RDWR, 0o600)
    try:
        fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
        yield
    finally:
        os.close(descriptor)


def run(args, generator=None):
    original = args.content.read_bytes()
    content = json.loads(original)
    jobs = collect_jobs(content, read_json(args.voices))
    manifest_path = args.output / "manifest.json"

    def load_manifest():
        manifest = read_json(manifest_path) if manifest_path.exists() else {"clips": []}
        if not isinstance(manifest, dict) or not isinstance(manifest.get("clips"), list):
            raise ValueError("Manifest must be an object with a clips list; refusing to discard provenance")
        return manifest

    def records_for(manifest):
        return {entry["filename"]: entry for entry in manifest["clips"] if "filename" in entry}

    if args.plan:
        records = records_for(load_manifest())
        for job in jobs:
            print(json.dumps({"filename": job["filename"], "text": job["text"],
                              "engine": job["voice"]["engine"], "voice_ids": job["voice_ids"],
                              "references": len(job["targets"]), "cached": cache_valid(job, args.output, records)},
                             ensure_ascii=False))
        return 0
    if not args.engine:
        raise ValueError("Generation requires --engine qwen or --engine kokoro (separate environments)")
    with output_lock(args.output):
        manifest = load_manifest()
        records = records_for(manifest)
        generated = 0
        failures = 0
        available = []
        generator = generator or LocalEngines()
        for job in jobs:
            if cache_valid(job, args.output, records):
                available.append(job)
                continue
            if job["voice"]["engine"] != args.engine or (args.limit and generated >= args.limit):
                continue
            generated += 1
            try:
                entry = generate_clip(job, args.output, generator)
                manifest["clips"] = [existing for existing in manifest["clips"]
                                     if existing.get("filename") != job["filename"]] + [entry]
                write_json(manifest_path, manifest)
                records[job["filename"]] = entry
                available.append(job)
                print(f"Generated /audio/{job['filename']} {job['text']}", flush=True)
            except Exception as error:
                failures += 1
                print(f"FAILED {job['filename']}: {error}", file=sys.stderr, flush=True)
        if args.write_content:
            if args.content.read_bytes() != original:
                raise ValueError("Content changed during generation; rerun to apply cached assets safely")
            for job in available:
                for target in job["targets"]:
                    target["audio"] = f"/audio/{job['filename']}"
            if available:
                write_json(args.content, content)
        pending = sum(not cache_valid(job, args.output, records) for job in jobs)
        print(f"{generated} attempted, {failures} failed, {len(available)} available, {pending} pending")
        return int(bool(failures))


def self_check():
    import contextlib
    import copy
    import io
    from unittest.mock import patch

    preset = {"engine": "qwen", "model": "test/model", "revision": "a" * 40,
              "speaker": "Serena", "language": "Chinese", "speed": 1, "instructions": None}
    config = {"wordVoice": "serena", "voices": {"serena": preset, "fu": preset | {"speaker": "Uncle_Fu"},
              "yunxi": preset | {"engine": "kokoro", "language": "z", "speaker": "zm_yunxi"}}}
    word = {"id": "one", "hanzi": "一", "pinyin": "yī", "audio": "/old.wav"}
    line = {"id": "line", "tokens": [word], "audio": "/old-line.wav"}
    content = {"unrelated": {"keep": True}, "foods": [{"word": word}], "thanks": line,
               "characters": [{"id": "fu", "name": "阿福", "voiceId": "fu", "greeting": line,
                               "thanks": line, "retry": line},
                              {"id": "yun", "name": "小云", "voiceId": "yunxi", "greeting": line}],
               "orders": [{"customer": "阿福", "line": line}]}
    content = json.loads(json.dumps(content))
    jobs = collect_jobs(content, config)
    assert len(jobs) == 4
    assert all(job["voice"]["speaker"] == "Serena" for job in jobs if job["kind"] == "word")
    assert len(next(job for job in jobs if job["voice"]["speaker"] == "Uncle_Fu")["targets"]) == 4
    for field, value in (("speaker", "Other"), ("revision", "b" * 40), ("instructions", "Warm"),
                         ("model", "test/other"), ("language", "auto"), ("extra", "future-setting")):
        changed = copy.deepcopy(config)
        changed["voices"]["serena"][field] = value
        assert collect_jobs(content, changed)[0]["filename"] != jobs[0]["filename"]
    changed = copy.deepcopy(content)
    changed["foods"][0]["word"]["pinyin"] = "yí"
    assert collect_jobs(changed, config)[0]["filename"] != jobs[0]["filename"]
    changed["foods"][0]["word"]["hanzi"] = "二"
    assert collect_jobs(changed, config)[0]["filename"] != jobs[0]["filename"]
    for setting in ("VERSION", "PRONUNCIATION"):
        with patch.dict(globals(), {setting: "changed"}):
            assert collect_jobs(content, config)[0]["filename"] != jobs[0]["filename"]
    calls = []

    def fake(job, seed):
        assert job["text"] == "一"
        calls.append(job["filename"])
        return [0.1, -0.1] * 2400, 24000, {"mock": True}

    with tempfile.TemporaryDirectory() as temporary:
        directory = Path(temporary)
        source, voices, output = directory / "content.json", directory / "voices.json", directory / "audio"
        write_json(source, content)
        write_json(voices, config)
        args = argparse.Namespace(content=source, voices=voices, output=output, plan=True,
                                  engine="qwen", limit=None, write_content=True)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            assert run(args, fake) == 0 and not output.exists() and not calls
            args.plan = False
            assert run(args, fake) == 0 and len(calls) == 3
            saved = read_json(source)
            assert saved["unrelated"] == content["unrelated"]
            assert saved["characters"][1]["greeting"]["audio"] == "/old-line.wav"
            assert run(args, fake) == 0 and len(calls) == 3
            args.engine = "kokoro"
            assert run(args, fake) == 0 and len(calls) == 4
            manifest = read_json(output / "manifest.json")
            assert len(manifest["clips"]) == 4
            destination = output / jobs[0]["filename"]
            destination.unlink()
            args.engine = "qwen"
            assert run(args, fake) == 0 and len(calls) == 5
            destination.write_bytes(b"corrupt")
            assert run(args, fake) == 0 and len(calls) == 6
            destination.write_bytes(b"corrupt with matching byte digest")
            manifest = read_json(output / "manifest.json")
            next(entry for entry in manifest["clips"] if entry["filename"] == jobs[0]["filename"])["sha256"] = digest(destination.read_bytes())
            write_json(output / "manifest.json", manifest)
            assert run(args, fake) == 0 and len(calls) == 7
            manifest = read_json(output / "manifest.json")
            next(entry for entry in manifest["clips"] if entry["filename"] == jobs[0]["filename"])["content_digest"] = "wrong"
            write_json(output / "manifest.json", manifest)
            assert run(args, fake) == 0 and len(calls) == 8
            destination.unlink()
            before = source.read_bytes()

            def broken(job, seed):
                return [float("nan")] * 4800, 24000, {}

            assert run(args, broken) == 1 and source.read_bytes() == before
            args.limit = 1
            assert run(args, fake) == 0
            destination.unlink()

            def concurrent_edit(job, seed):
                latest = read_json(source)
                latest["unrelated"]["parent_edit"] = True
                write_json(source, latest)
                return fake(job, seed)

            try:
                run(args, concurrent_edit)
            except ValueError as error:
                assert "Content changed" in str(error)
            else:
                raise AssertionError("Concurrent content edit was overwritten")
            assert read_json(source)["unrelated"]["parent_edit"] is True
            assert run(args, fake) == 0
        for samples, rate in (([0.1] * 4800, 22050), ([0.0] * 4800, 24000), ([1.0] * 4800, 24000),
                              ([float("nan")] * 4800, 24000), ([0.1] * 10, 24000),
                              ([0.1] * 120000, 24000)):
            try:
                validate_samples(samples, rate, "一")
            except ValueError:
                pass
            else:
                raise AssertionError("Invalid signal accepted")
    assert not any(name in sys.modules for name in ("numpy", "torch", "mlx", "kokoro", "mlx_audio"))
    print("Self-check passed: routing, deduplication, invalidation, plan, mixed-engine cache, missing/corrupt assets, failure safety, signal guards")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--content", type=Path, default=ROOT / "src/content/content.json")
    parser.add_argument("--voices", type=Path, default=ROOT / "src/content/voices.json")
    parser.add_argument("--output", type=Path, default=ROOT / "public/audio")
    parser.add_argument("--plan", action="store_true")
    parser.add_argument("--engine", choices=("qwen", "kokoro"))
    parser.add_argument("--write-content", action="store_true")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--self-check", action="store_true")
    args = parser.parse_args()
    if args.limit is not None and args.limit < 1:
        parser.error("--limit must be positive")
    if args.self_check:
        self_check()
        return 0
    try:
        return run(args)
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
