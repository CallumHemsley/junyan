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
import time
import unicodedata
import wave


ROOT = Path(__file__).resolve().parents[1]
VERSION = "content-audio-v1"
PRONUNCIATION = "unicode-nfc-native-frontend-no-sandhi-overrides-v1"
QWEN_SETTINGS = {"temperature": 0.9, "top_k": 50, "top_p": 1.0,
                 "repetition_penalty": 1.05, "stream": False, "verbose": False}
MAX_ATTEMPTS = 8
FRAME_SECONDS = 0.03
ACTIVE_WITHIN_DB = 35
UNPROCESSED = "PCM16 quantization only; no gain, normalization, trim or resampling"


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
        if "loudness" in preset:
            loudness = preset["loudness"]
            if (not isinstance(loudness, dict)
                    or loudness.keys() != {"targetActiveRmsDbfs", "peakCeilingDbfs"}
                    or any(isinstance(value, bool) or not isinstance(value, (int, float))
                           for value in loudness.values())
                    or not -40 <= loudness["targetActiveRmsDbfs"] <= -6
                    or not -12 <= loudness["peakCeilingDbfs"] < 0):
                raise ValueError(f"Invalid loudness: {voice_id}")


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
        if kind == "english":
            text, pinyin = target["en"], None
        elif kind == "line":
            text = (target["text"] if "text" in target
                    else "".join(token["hanzi"] for token in target["tokens"]))
            pinyin = [token.get("pinyin") for token in target["tokens"]]
        else:
            text, pinyin = target["hanzi"], [target.get("pinyin")]
        text = unicodedata.normalize("NFC", text)
        if not text.strip() or len(text) > 180:
            raise ValueError("Audio text must contain 1–180 characters")
        pronunciation = {"normalization": PRONUNCIATION, "authored_pinyin": pinyin}
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
        if key not in ("characters", "orders", "opening"):
            walk(value, word_voice)
    for character in characters:
        walk(character, character["voiceId"])
    for order in content.get("orders", []):
        if order["customer"] not in names:
            raise ValueError(f"No character matches order customer {order['customer']!r}")
        walk(order, names[order["customer"]]["voiceId"])
    if "opening" in content:
        cast = {member["id"]: member["voices"] for member in content["opening"]["cast"]}
        for member_voices in cast.values():
            for voice_id in member_voices.values():
                if voice_id not in voices:
                    raise ValueError(f"Unknown voiceId: {voice_id}")
        for step in content["opening"]["steps"]:
            if step["type"] == "end":
                walk(step, word_voice)
                continue
            if step["who"] not in cast:
                raise ValueError(f"No cast member matches who {step['who']!r}")
            speaker = cast[step["who"]]
            if step["type"] == "say-en":
                if "en" not in speaker:
                    raise ValueError(f"Cast member {step['who']!r} has no English voice")
                add(step, "english", speaker["en"])
            else:
                walk(step, speaker["zh"])
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


def speech_metrics(samples, sample_rate):
    size = int(FRAME_SECONDS * sample_rate)
    energies = [sum(sample * sample for sample in samples[start:start + size]) / size
                for start in range(0, len(samples) // size * size, size)]
    levels = [20 * math.log10(math.sqrt(energy) + 1e-9) for energy in energies]
    loudest = max(levels)
    active = [index for index, level in enumerate(levels) if level > loudest - ACTIVE_WITHIN_DB]
    active_energy = sum(energies[index] for index in active) / len(active)
    return {"active_rms_dbfs": 10 * math.log10(active_energy),
            "peak_dbfs": 20 * math.log10(max(abs(sample) for sample in samples)),
            "speech_seconds": (active[-1] - active[0] + 1) * FRAME_SECONDS}


def level(samples, sample_rate, preset):
    if "loudness" not in preset:
        return samples, None
    before = speech_metrics(samples, sample_rate)
    gain_db = min(preset["loudness"]["targetActiveRmsDbfs"] - before["active_rms_dbfs"],
                  preset["loudness"]["peakCeilingDbfs"] - before["peak_dbfs"])
    factor = 10 ** (gain_db / 20)
    levelled = [sample * factor for sample in samples]
    return levelled, {"gain_db": gain_db, "before": before,
                      "after": speech_metrics(levelled, sample_rate)}


def syllables(text):
    return sum(unicodedata.name(character, "").startswith("CJK UNIFIED IDEOGRAPH")
               for character in text)


def read_wav(path):
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
    return [sample / 32768 for sample in samples], sample_rate


def inspect_wav(path, text):
    return validate_samples(*read_wav(path), text)


def cache_valid(job, output, records):
    entry = records.get(job["filename"])
    path = output / job["filename"]
    try:
        if not entry or entry.get("content_digest") != job["content_digest"]:
            return False
        if any(entry.get(key) != job[key] for key in
               ("generator_version", "kind", "text", "voice", "pronunciation")):
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
        key = (preset["engine"], preset["model"], preset["revision"],
               preset["language"] if preset["engine"] == "kokoro" else None)
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
    started = time.perf_counter()
    for attempt in range(MAX_ATTEMPTS):
        seed = (int(job["content_digest"][:8], 16) + attempt * 1000) % (2 ** 32)
        temporary = None
        try:
            samples, sample_rate, details = generator(job, seed)
            raw_metrics = validate_samples(samples, sample_rate, job["text"])
            if job["kind"] == "word":
                span = speech_metrics(samples, sample_rate)["speech_seconds"]
                limit = 0.6 + 0.5 * syllables(job["text"])
                if span > limit:
                    raise ValueError(f"Word speech lasts {span:.2f}s, over {limit:.2f}s")
            samples, levelled = level(samples, sample_rate, job["voice"])
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
            entry = {key: value for key, value in job.items() if key != "targets"} | {
                "sha256": digest((output / job["filename"]).read_bytes()),
                "created_at": datetime.now(timezone.utc).isoformat(), "attempts": attempts,
                "generation_seconds": time.perf_counter() - started,
                "packages": package_versions(job["voice"]["engine"]), "python": sys.version,
                "raw_metrics": raw_metrics, "wav_metrics": metrics, "engine_details": details,
                "postprocessing": UNPROCESSED,
                "review_status": "Native Mandarin exact-text/pronunciation listening review pending"}
            if levelled:
                loudness = job["voice"]["loudness"]
                entry["level"] = levelled
                entry["postprocessing"] = (
                    f"Gain to {loudness['targetActiveRmsDbfs']} dBFS active speech RMS, capped at a "
                    f"{loudness['peakCeilingDbfs']} dBFS peak, then PCM16 quantization; no trim or resampling")
            return entry
        except (ImportError, ModuleNotFoundError):
            raise
        except Exception as error:
            attempts.append({"seed": seed, "accepted": False, "error": str(error)})
        finally:
            if temporary:
                Path(temporary).unlink(missing_ok=True)
    raise ValueError(f"{MAX_ATTEMPTS} rejected takes: {attempts}")


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
    original_voices = args.voices.read_bytes()
    jobs = collect_jobs(content, json.loads(original_voices))
    manifest_path = args.output / "manifest.json"

    def load_manifest():
        manifest = read_json(manifest_path) if manifest_path.exists() else {"clips": []}
        if not isinstance(manifest, dict) or not isinstance(manifest.get("clips"), list):
            raise ValueError("Manifest must be an object with a clips list; refusing to discard provenance")
        filenames = set()
        for entry in manifest["clips"]:
            if not isinstance(entry, dict) or not isinstance(entry.get("filename"), str) or not entry["filename"]:
                raise ValueError("Each manifest clip must have a filename; refusing to discard provenance")
            if entry["filename"] in filenames:
                raise ValueError(f"Duplicate manifest filename: {entry['filename']}; resolve provenance before retrying")
            filenames.add(entry["filename"])
        return manifest

    def records_for(manifest):
        return {entry["filename"]: entry for entry in manifest["clips"]}

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
            if args.voices.read_bytes() != original_voices:
                raise ValueError("Voices changed during generation; rerun to apply cached assets safely")
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
    import subprocess
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
    with_help = copy.deepcopy(content)
    help_word = {"id": "table", "hanzi": "桌子", "pinyin": "zhuōzi", "audio": "/old.wav"}
    with_help["help"] = {"steps": [{"id": "order", "line": {
        "id": "help-order", "tokens": [help_word], "audio": "/old-line.wav"}}]}
    help_jobs = collect_jobs(with_help, config)
    original_names = {job["filename"] for job in jobs}
    assert original_names <= {job["filename"] for job in help_jobs}
    added = [job for job in help_jobs if job["filename"] not in original_names]
    assert len(added) == 2 and {job["kind"] for job in added} == {"line", "word"}
    assert all(job["voice"] == config["voices"][config["wordVoice"]] for job in added)
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
    renamed = copy.deepcopy(config)
    renamed["voices"]["dictionary"] = renamed["voices"].pop("serena")
    renamed["wordVoice"] = "dictionary"
    assert [job["filename"] for job in collect_jobs(content, renamed)] == [job["filename"] for job in jobs]
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
    with tempfile.TemporaryDirectory() as temporary:
        directory = Path(temporary)
        source, voices, output = directory / "content.json", directory / "voices.json", directory / "audio"
        write_json(source, content)
        write_json(voices, config)
        args = argparse.Namespace(content=source, voices=voices, output=output, plan=False,
                                  engine="qwen", limit=1, write_content=True)
        calls.clear()
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            with output_lock(output):
                try:
                    run(args, fake)
                except BlockingIOError:
                    pass
                else:
                    raise AssertionError("Competing output writer accepted")
            assert not calls and read_json(source) == content
            assert run(args, fake) == 0 and len(calls) == 1
            assert len(list(output.glob("*.wav"))) == 1
            manifest_path = output / "manifest.json"
            original_manifest = read_json(manifest_path)
            snapshot = {path: path.read_bytes() for path in directory.rglob("*") if path.is_file()}
            command = [sys.executable, str(Path(__file__).resolve()), "--content", str(source),
                       "--voices", str(voices), "--output", str(output), "--plan", "--write-content",
                       "--engine", "kokoro", "--limit", "1"]
            result = subprocess.run(command, capture_output=True, text=True)
            rows = [json.loads(row) for row in result.stdout.splitlines()]
            assert result.returncode == 0 and not result.stderr
            assert len(rows) == 4 and sum(row["cached"] for row in rows) == 1
            assert {path: path.read_bytes() for path in directory.rglob("*") if path.is_file()} == snapshot
            for field, value in (("voice", preset | {"speaker": "Wrong"}), ("text", "二"),
                                 ("kind", "line"), ("generator_version", "wrong"),
                                 ("pronunciation", {})):
                altered = copy.deepcopy(original_manifest)
                altered["clips"][0][field] = value
                write_json(manifest_path, altered)
                result = subprocess.run(command, capture_output=True, text=True)
                assert result.returncode == 0 and not any(json.loads(row)["cached"] for row in result.stdout.splitlines())
            for entries in ([None], [{}], ["bad"], [{"filename": []}],
                            original_manifest["clips"] * 2):
                write_json(manifest_path, {"clips": entries})
                before = manifest_path.read_bytes()
                result = subprocess.run(command, capture_output=True, text=True)
                assert result.returncode == 1 and not result.stdout
                assert "ERROR:" in result.stderr and "Traceback" not in result.stderr
                assert manifest_path.read_bytes() == before
            write_json(manifest_path, original_manifest | {"editor_note": "preserve"})
            args.limit = None
            before = source.read_bytes()

            def edit_voices(job, seed):
                latest = copy.deepcopy(config)
                latest["voices"]["serena"]["speaker"] = "Changed"
                write_json(voices, latest)
                return fake(job, seed)

            try:
                run(args, edit_voices)
            except ValueError as error:
                assert "Voices changed" in str(error)
            else:
                raise AssertionError("Changed voice configuration updated content")
            assert source.read_bytes() == before
            write_json(voices, config)
            replace = os.replace

            def fail_content_replace(temporary, destination):
                if destination == source:
                    raise OSError("Fixture interruption before content replace")
                return replace(temporary, destination)

            with patch.object(os, "replace", fail_content_replace):
                try:
                    run(args, fake)
                except OSError:
                    pass
                else:
                    raise AssertionError("Interrupted content write succeeded")
            assert source.read_bytes() == before
            assert not list(directory.glob(".content.json.*"))
            calls_before_retry = len(calls)
            assert run(args, fake) == 0 and len(calls) == calls_before_retry
            assert read_json(source)["foods"][0]["word"]["audio"] == "/audio/" + original_manifest["clips"][0]["filename"]
            assert read_json(manifest_path)["editor_note"] == "preserve"
    assert [job["filename"] for job in jobs] == [
        "word-7e74569e111d5796e0021ddea68de2acc254d5665fdadbaf48c303adfe769b4f.wav",
        "line-fb40307898f32a24f17172d272f87caa1492ba38c8f4a8a2b4118976cc763f52.wav",
        "line-6c1df98a97304591afc3dffd7986eea0cb2c32cdb7336331bca604a43170253e.wav",
        "line-23bbd166dd9017ceb97db29825f9749bccc2490a197587e5b47c3fabc12b3c9a.wav"]

    opening = read_json(ROOT / "scripts/fixtures/opening-audio.json")
    shipped = read_json(ROOT / "src/content/voices.json")
    opening_jobs = collect_jobs(opening, shipped)
    by_text = {job["text"]: job for job in opening_jobs}
    english = [job for job in opening_jobs if job["kind"] == "english"]
    assert len(english) == 1 and english[0]["voice_ids"] == ["ryan-en"]
    assert english[0]["text"] == "Ah, you're awake. Don't try to sit up yet."
    assert english[0]["filename"].startswith("english-")
    assert english[0]["pronunciation"] == {"normalization": PRONUNCIATION, "authored_pinyin": None}
    for text, voice_id in (("人醒了。", "ryan-zh"), ("好的，王医生。", "vivian"),
                           ("我要豆浆。", "uncle-fu-levelled"), ("不对，我要豆浆。", "uncle-fu-levelled"),
                           ("谢谢你！", "uncle-fu-levelled"), ("太好了！明天见。", "serena-levelled"),
                           ("第一天·早安小馆", shipped["wordVoice"])):
        assert by_text[text]["kind"] == "line" and by_text[text]["voice_ids"] == [voice_id]
    words = [job for job in opening_jobs if job["kind"] == "word"]
    assert len(words) == 19 and len(opening_jobs) == 27 and "好" in by_text
    assert all(job["voice_ids"] == [shipped["wordVoice"]] for job in words)
    for edit, message in ((lambda cast: cast[0]["voices"].pop("en"), "no English voice"),
                          (lambda cast: cast.pop(1), "No cast member"),
                          (lambda cast: cast[2]["voices"].update(zh="missing"), "Unknown voiceId")):
        broken_opening = copy.deepcopy(opening)
        edit(broken_opening["opening"]["cast"])
        try:
            collect_jobs(broken_opening, shipped)
        except ValueError as error:
            assert message in str(error), error
        else:
            raise AssertionError(f"Opening accepted without raising {message}")

    def tone(seconds, rms_dbfs, lead=0.0, spikes=False):
        amplitude = 10 ** (rms_dbfs / 20) * math.sqrt(2)
        samples = [0.0] * int(lead * 24000) + [
            amplitude * math.sin(2 * math.pi * 220 * index / 24000) for index in range(int(seconds * 24000))]
        if spikes:
            for index in range(len(samples) // 2, len(samples), 2400):
                samples[index] = 0.5
        return samples

    levelled_preset = preset | {"loudness": {"targetActiveRmsDbfs": -20, "peakCeilingDbfs": -1}}
    for loudness in ({"targetActiveRmsDbfs": 0, "peakCeilingDbfs": -1},
                     {"targetActiveRmsDbfs": -20, "peakCeilingDbfs": 0},
                     {"targetActiveRmsDbfs": -20}, {"targetActiveRmsDbfs": True, "peakCeilingDbfs": -1}):
        try:
            validate_presets({"wordVoice": "v", "voices": {"v": preset | {"loudness": loudness}}})
        except ValueError:
            pass
        else:
            raise AssertionError(f"Invalid loudness accepted: {loudness}")
    level_config = {"wordVoice": "serena", "voices": {"serena": preset, "levelled": levelled_preset}}
    level_content = {"characters": [{"id": "fu", "name": "阿福", "voiceId": "levelled", "greeting": line}]}
    levelled_job, plain_job = sorted(collect_jobs(level_content, level_config),
                                     key=lambda job: job["kind"] == "word")
    with tempfile.TemporaryDirectory() as temporary:
        output = Path(temporary)
        entry = generate_clip(levelled_job, output, lambda job, seed: (tone(1, -30), 24000, {}))
        measured = speech_metrics(read_wav(output / levelled_job["filename"])[0], 24000)
        assert abs(measured["active_rms_dbfs"] + 20) < 0.2, measured
        assert abs(entry["level"]["gain_db"] - 10) < 0.2 and "-20 dBFS" in entry["postprocessing"]
        assert entry["generation_seconds"] >= 0
        generate_clip(levelled_job, output, lambda job, seed: (tone(1, -30, spikes=True), 24000, {}))
        measured = speech_metrics(read_wav(output / levelled_job["filename"])[0], 24000)
        assert abs(measured["peak_dbfs"] + 1) < 0.05 and measured["active_rms_dbfs"] < -21, measured
        plain = tone(0.5, -30)
        entry = generate_clip(plain_job, output, lambda job, seed: (plain, 24000, {}))
        assert read_wav(output / plain_job["filename"])[0] == [round(sample * 32768) / 32768 for sample in plain]
        assert "level" not in entry and entry["postprocessing"] == UNPROCESSED
        seeds = []

        def babble_then_speak(job, seed):
            seeds.append(seed)
            return tone(2.5 if len(seeds) <= 4 else 0.4, -30), 24000, {}

        entry = generate_clip(plain_job, output, babble_then_speak)
        assert [attempt["accepted"] for attempt in entry["attempts"]] == [False] * 4 + [True]
        assert "Word speech lasts" in entry["attempts"][0]["error"]
        assert seeds[1] - seeds[0] == 1000
        entry = generate_clip(plain_job, output, lambda job, seed: (tone(0.5, -30, lead=1), 24000, {}))
        assert len(entry["attempts"]) == 1
        source, voices, audio = output / "content.json", output / "voices.json", output / "audio"
        write_json(source, {"foods": [{"word": word}]})
        write_json(voices, config)
        before = source.read_bytes()
        args = argparse.Namespace(content=source, voices=voices, output=audio, plan=False,
                                  engine="qwen", limit=None, write_content=True)
        errors = io.StringIO()
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(errors):
            assert run(args, lambda job, seed: (tone(2.5, -30), 24000, {})) == 1
        assert f"{MAX_ATTEMPTS} rejected takes" in errors.getvalue() and source.read_bytes() == before
        args.plan = True
        plan = io.StringIO()
        with contextlib.redirect_stdout(plan):
            assert run(args) == 0
        assert [json.loads(row)["cached"] for row in plan.getvalue().splitlines()] == [False]
    assert not any(name in sys.modules for name in ("numpy", "torch", "mlx", "kokoro", "mlx_audio"))
    print("Self-check passed: routing, deduplication, invalidation, plan CLI, mixed-engine cache, missing/corrupt assets, provenance, locking, limits, interrupted writes, input edit guards, signal guards, english routing, cast presets, loudness, syllable duration, eight seeds")


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
