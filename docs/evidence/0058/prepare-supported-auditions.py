"""Prepare an explicit, audition-only 1.7B comparison. Never edits production."""
import copy
import json
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parents[3]
MODEL = 'mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit'
REVISION = 'f35faf19b0cc2160865af64ecf0f22f83d335135'
DIRECTION = (
    'Speak to one person beside you in an ordinary conversational voice. '
    'Use matter-of-fact phrasing, relaxed everyday pacing and light natural warmth.'
)
out = Path(sys.argv[1]).resolve()
out.mkdir(parents=True, exist_ok=False)
content = json.loads((ROOT / 'src/content/content.json').read_text())
voices = json.loads((ROOT / 'src/content/voices.json').read_text())
for name, instruction in [('larger-neutral', None), ('larger-conversation', DIRECTION)]:
    folder = out / name
    folder.mkdir()
    candidate = copy.deepcopy(voices)
    for language in ('en', 'zh'):
        preset = candidate['voices']['ryan-' + language]
        preset.update(model=MODEL, revision=REVISION, instructions=instruction)
    (folder / 'content.json').write_text(json.dumps(content, ensure_ascii=False, indent=2) + '\n')
    (folder / 'voices.json').write_text(json.dumps(candidate, ensure_ascii=False, indent=2) + '\n')
    shutil.copytree(ROOT / 'public/audio', folder / 'audio')
    print(folder)
