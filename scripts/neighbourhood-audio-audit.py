"""Audit real neighbourhood voice files. Missing or invalid assets fail the audit."""
import json
from pathlib import Path
import sys
import wave

root = Path(__file__).resolve().parents[1]
report = {}
for feature in ["apartment", "cats", "repairs", "garden"]:
    content = json.loads((root / f"src/features/{feature}/content.json").read_text())
    lines = [line for character in content["characters"] for line in character["lines"]] if feature == "repairs" else content["lines"]
    paths = sorted({entry["audio"] for entry in content["words"] + lines})
    missing, invalid = [], []
    for url in paths:
        path = root / "public" / url.removeprefix("/")
        if not path.is_file():
            missing.append(url)
            continue
        try:
            with wave.open(str(path), "rb") as source:
                if source.getnchannels() != 1 or source.getsampwidth() != 2 or source.getframerate() != 24000:
                    raise ValueError("Expected mono PCM16 24kHz")
                frames = source.readframes(source.getnframes())
                if not frames or not any(frames):
                    raise ValueError("Empty or silent PCM")
        except (wave.Error, ValueError, EOFError) as error:
            invalid.append({"path": url, "error": str(error)})
    report[feature] = {"references": len(paths), "missing": missing, "invalid": invalid}
missing = sum(len(feature["missing"]) for feature in report.values())
invalid = sum(len(feature["invalid"]) for feature in report.values())
print(json.dumps({"status": "FAIL" if missing or invalid else "FILES_PRESENT_NOT_LISTENING_APPROVAL", "missing": missing, "invalid": invalid, "features": report}, ensure_ascii=False, indent=2))
sys.exit(1 if missing or invalid else 0)
