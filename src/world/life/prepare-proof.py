"""Capture published owner inputs for repeatable, read-only cross-map life proof."""
import io
import json
from pathlib import Path
import subprocess
import tarfile

root = Path(__file__).resolve().parents[3]
out = root / 'output/verification/world/0087'
out.mkdir(parents=True, exist_ok=True)
refs = {
    'town': ('0079-town-street', 'town/map.json'),
    'courtyard': ('0080-courtyard', 'courtyard/map.json'),
    'workshop': ('0082-workshop', 'workshop/map.json'),
    'rooftop': ('0083-rooftop', 'rooftop/map.json'),
    'park': ('0084-landscape', 'landscape/park.json'),
    'riverbank': ('0084-landscape', 'landscape/riverbank.json'),
}
inputs = []
for map_id, (branch, path) in refs.items():
    ref = f'origin/codex/{branch}'
    sha = subprocess.check_output(['git', 'rev-parse', ref], cwd=root, text=True).strip()
    data = subprocess.check_output(['git', 'show', f'{sha}:src/world/maps/{path}'], cwd=root)
    inputs.append({'sha': sha, 'path': f'src/world/maps/{path}', 'map': json.loads(data)})
(out / 'maps.json').write_text(json.dumps(inputs, ensure_ascii=False, indent=2))
ref = 'origin/codex/0085-characters'
sha = subprocess.check_output(['git', 'rev-parse', ref], cwd=root, text=True).strip()
archive = subprocess.check_output(['git', 'archive', sha, 'src/world/characters', 'src/content/content.json'], cwd=root)
with tarfile.open(fileobj=io.BytesIO(archive)) as source:
    source.extractall(out / 'characters', filter='data')
(out / 'characters/source.json').write_text(json.dumps({'sha': sha, 'ref': ref}))
print(json.dumps({'maps': len(inputs), 'directory': str(out), 'characters': sha}))
