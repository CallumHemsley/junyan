"""Prepare two isolated Grandpa takes; stdlib only, never synthesize or edit production."""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
REVISION = "f35faf19b0cc2160865af64ecf0f22f83d335135"
VOICE = "hospital-elder-1b7-conversational-audition"
INSTRUCTION = (
    "用普通日常交谈的语气轻声说话，语调平缓，语速从容，停顿自然，吐字清楚。"
    "像在病床上休息的人一样，不要兴奋，不要表演，不要耳语，不要颤抖或喘息。"
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-id", required=True, help="Exact parent-verified 1.7B CustomVoice repository ID")
    parser.add_argument("--output", type=Path, default=ROOT / "output/0060-1b7-audition")
    args = parser.parse_args()
    if "1.7B-CustomVoice" not in args.model_id:
        parser.error("Use the verified 1.7B CustomVoice model, not 0.6B/Base/VoiceDesign")
    out = args.output.resolve()
    if not out.is_relative_to(ROOT / "output"):
        parser.error("Audition output must stay under this checkout's ignored output/")
    out.mkdir(parents=True, exist_ok=False)
    content_path, voices_path = ROOT / "src/content/content.json", ROOT / "src/content/voices.json"
    before = {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in (content_path, voices_path)}
    content, voices = json.loads(content_path.read_text()), json.loads(voices_path.read_text())
    original = copy.deepcopy(content)
    elder = next(c for c in content["opening"]["cast"] if c["id"] == "elder")
    preset = copy.deepcopy(voices["voices"][elder["voices"]["zh"]])
    assert preset["speaker"] == "Uncle_Fu" and preset["speed"] == 1
    assert preset["loudness"] == {"targetActiveRmsDbfs": -20, "peakCeilingDbfs": -1}
    preset.update(model=args.model_id, revision=REVISION, instructions=INSTRUCTION)
    voices["voices"][VOICE] = preset
    elder["voices"]["zh"] = VOICE
    requests = [s for s in original["opening"]["steps"] if s.get("who") == "elder"]
    selected = [requests[0]["line"], requests[1]["ok"]]
    assert [line["id"] for line in selected] == ["elder-milk", "elder-egg-thanks"]
    # This offline audio fixture is deliberately not a playable opening/script replacement.
    content["opening"]["steps"] = [s for s in content["opening"]["steps"] if s.get("who") != "elder"]
    content["opening"]["steps"] += [{"type": "say", "who": "elder", "line": copy.deepcopy(line)} for line in selected]
    shutil.copytree(ROOT / "public/audio", out / "audio")
    (out / "old").mkdir()
    for line in selected:
        shutil.copyfile(ROOT / "public" / line["audio"].lstrip("/"), out / "old" / (line["id"] + ".wav"))
    for name, data in (("baseline-content", original), ("content", content), ("voices", voices)):
        (out / (name + ".json")).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    command = [sys.executable, str(ROOT / "scripts/content-audio.py"), "--content", str(out / "content.json"),
               "--voices", str(out / "voices.json"), "--output", str(out / "audio"), "--plan"]
    result = subprocess.run(command, check=True, text=True, capture_output=True)
    (out / "plan.jsonl").write_text(result.stdout)
    rows = [json.loads(row) for row in result.stdout.splitlines()]
    pending = [row for row in rows if not row["cached"]]
    assert len(pending) == 2 and all(row["voice_ids"] == [VOICE] for row in pending), pending
    assert {row["text"] for row in pending} == {line["text"] for line in selected}
    assert all(before[p] == hashlib.sha256(p.read_bytes()).hexdigest() for p in before)
    comparisons = [{"id": line["id"], "text": line["text"], "authored_pinyin": [t["pinyin"] for t in line["tokens"]],
                    "old": "old/" + line["id"] + ".wav",
                    "candidate": "audio/" + next(row["filename"] for row in pending if row["text"] == line["text"])}
                   for line in selected]
    (out / "comparison.json").write_text(json.dumps({"preset": preset, "comparisons": comparisons,
        "status": "prepared only; no synthesis or listening", "production_inputs_sha256": {str(p.relative_to(ROOT)): h for p, h in before.items()}}, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"output": str(out), "pending": len(pending), "cached": len(rows) - len(pending), "comparisons": comparisons}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
