"""Stage six selected Grandpa clips against current checkout; never edit production."""
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
PIN = "f35faf19b0cc2160865af64ecf0f22f83d335135"


def elder_lines(content):
    lines = {}
    for step in content["opening"]["steps"]:
        if step.get("who") == "elder":
            for key in ("line", "wrong", "ok"):
                if key in step:
                    line = step[key]
                    if line["id"] in lines:
                        raise ValueError("Duplicate Grandpa line ID")
                    lines[line["id"]] = line
    return lines


def records(manifest):
    entries = manifest["clips"]
    result = {entry["filename"]: entry for entry in entries}
    if len(result) != len(entries):
        raise ValueError("Duplicate manifest filename")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Selected full six-line Mac bundle: content.json, voices.json, audio/")
    parser.add_argument("--voice-id", required=True, help="Selected hospital-only source voice ID")
    parser.add_argument("--direction", choices=("neutral", "conversational"), required=True)
    parser.add_argument("--output", type=Path, default=ROOT / "output/0060-staged-import")
    args = parser.parse_args()
    out, source = args.output.resolve(), args.source.resolve()
    if not out.is_relative_to(ROOT / "output") or out.exists() or out.is_relative_to(source):
        parser.error("Use a new output/ directory outside the source bundle")
    spec = importlib.util.spec_from_file_location("audio_pipeline", ROOT / "scripts/content-audio.py")
    audio = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(audio)
    read = lambda path: json.loads(path.read_text())
    paths = [ROOT / "src/content/content.json", ROOT / "src/content/voices.json", ROOT / "public/audio/manifest.json"]
    original = {path: path.read_bytes() for path in paths}
    content, voices, manifest = [json.loads(original[path]) for path in paths]
    incoming_content, incoming_voices = read(source / "content.json"), read(source / "voices.json")
    incoming_manifest = read(source / "audio/manifest.json")
    targets, incoming = elder_lines(content), elder_lines(incoming_content)
    if len(targets) != 6 or set(incoming) != set(targets):
        raise ValueError("Need exactly all six Grandpa lines; two-line auditions cannot be imported")
    PRODUCTION_VOICE = next(c for c in content["opening"]["cast"] if c["id"] == "elder")["voices"]["zh"]
    if any(c["voiceId"] == PRODUCTION_VOICE for c in content["characters"]) or any(PRODUCTION_VOICE in c["voices"].values() for c in content["opening"]["cast"] if c["id"] != "elder"):
        raise ValueError("Existing hospital preset has non-elder consumers")
    preset = incoming_voices["voices"][args.voice_id]
    if (preset["engine"] != "qwen" or "1.7B-CustomVoice" not in preset["model"] or preset["revision"] != PIN
            or preset["speaker"] != "Uncle_Fu" or preset["language"] != "Chinese" or preset["speed"] != 1
            or preset.get("loudness") != {"targetActiveRmsDbfs": -20, "peakCeilingDbfs": -1}):
        raise ValueError("Selected preset differs from the pinned hospital Uncle_Fu contract")
    if (args.direction == "neutral") != (preset["instructions"] is None):
        raise ValueError("Selected direction does not match source instructions")
    source_elder = next(c for c in incoming_content["opening"]["cast"] if c["id"] == "elder")
    if source_elder["voices"]["zh"] != args.voice_id:
        raise ValueError("Source elder is not routed to selected voice")
    voices["voices"][PRODUCTION_VOICE] = copy.deepcopy(preset)
    next(c for c in content["opening"]["cast"] if c["id"] == "elder")["voices"]["zh"] = PRODUCTION_VOICE
    for line_id, line in targets.items():
        other = incoming[line_id]
        if {k:v for k,v in line.items() if k != "audio"} != {k:v for k,v in other.items() if k != "audio"}:
            raise ValueError("Script, token or pinyin drift in " + line_id)
        line["audio"] = other["audio"]
    jobs = audio.collect_jobs(content, voices)
    selected = [job for job in jobs if PRODUCTION_VOICE in job["voice_ids"]]
    if len(selected) != 6 or any(job["kind"] != "line" or job["voice_ids"] != [PRODUCTION_VOICE] for job in selected):
        raise ValueError("Hospital voice must affect exactly six exclusive line jobs")
    incoming_records, current_records = records(incoming_manifest), records(manifest)
    for job in selected:
        if not audio.cache_valid(job, source / "audio", incoming_records):
            raise ValueError("Missing/corrupt/stale source clip: " + job["filename"])
        if any(target["audio"] != "/audio/" + job["filename"] for target in job["targets"]):
            raise ValueError("Source content has not been updated to generated clip identity")
        entry = incoming_records[job["filename"]]
        if job["filename"] in current_records and current_records[job["filename"]] != entry:
            raise ValueError("Conflicting current-main manifest provenance")
        current_records[job["filename"]] = entry
    for job in jobs:
        if PRODUCTION_VOICE not in job["voice_ids"] and not audio.cache_valid(job, ROOT / "public/audio", current_records):
            raise ValueError("Unrelated current-main clip is not cached: " + job["filename"])
    # Stage complete current-main files, adding only the selected six clip records.
    out.mkdir()
    shutil.copytree(ROOT / "public/audio", out / "audio")
    for job in selected:
        shutil.copyfile(source / "audio" / job["filename"], out / "audio" / job["filename"])
    manifest["clips"] = list(current_records.values())
    for path, value in ((out / "content.json", content), (out / "voices.json", voices), (out / "audio/manifest.json", manifest)):
        audio.write_json(path, value)
    if not all(audio.cache_valid(job, out / "audio", current_records) for job in jobs):
        raise ValueError("Staged plan incomplete")
    if any(path.read_bytes() != before for path, before in original.items()):
        raise ValueError("Production inputs changed during staging; rebuild against latest main")
    print(json.dumps({"output": str(out), "grandpa_clips": len(selected), "all_jobs_cached": len(jobs),
                      "direction": args.direction, "production_modified": False}, indent=2))


if __name__ == "__main__":
    main()
