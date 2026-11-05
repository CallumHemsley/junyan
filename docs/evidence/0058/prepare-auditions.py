"""Prepare isolated doctor auditions; no synthesis and no production writes."""
import copy
import json
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parents[3]
out = Path(sys.argv[1]).resolve()
# Refuse reuse so an audition cannot accidentally inherit another candidate's output.
out.mkdir(parents=True, exist_ok=False)
content = json.loads((ROOT / 'src/content/content.json').read_text())
voices = json.loads((ROOT / 'src/content/voices.json').read_text())
doctor_steps = [s for s in content['opening']['steps'] if s.get('who') == 'doctor']
assert len(doctor_steps) == 5
assert sum(s['type'] == 'say-en' for s in doctor_steps) == 4

# Same model/revision, script, speed and level. These are hypotheses, not approved voices.
for name, speaker, instruction in (
    ('baseline', 'Ryan', None),
    ('ryan-calm', 'Ryan', 'Speak naturally as a calm, reassuring doctor at a patient\'s bedside. Use a warm conversational tone, clear speech and steady pacing.'),
    ('aiden', 'Aiden', None),
):
    folder = out / name
    folder.mkdir()
    candidate = copy.deepcopy(content)
    presets = copy.deepcopy(voices)
    if name != 'baseline':
        for language in ('en', 'zh'):
            presets['voices']['ryan-' + language]['speaker'] = speaker
            presets['voices']['ryan-' + language]['instructions'] = instruction
    (folder / 'content.json').write_text(json.dumps(candidate, ensure_ascii=False, indent=2) + '\n')
    (folder / 'voices.json').write_text(json.dumps(presets, ensure_ascii=False, indent=2) + '\n')
    shutil.copytree(ROOT / 'public/audio', folder / 'audio')
    print(folder)
