"""Prepare an isolated same-cast punctuation hypothesis; no synthesis or production edits."""
import argparse
from copy import deepcopy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
out = args.output.resolve()
if out == ROOT or ROOT in out.parents and 'output' not in out.relative_to(ROOT).parts:
    parser.error('Use an external directory or an ignored output directory')
source = json.loads((ROOT / 'src/content/content.json').read_text())
fixture = deepcopy({key: source[key] for key in ('characters', 'orders')})
authored = json.loads((Path(__file__).with_name('punctuation.json')).read_text())
lines = [c[role] for c in fixture['characters'] for role in ('greeting', 'retry', 'thanks')]
lines += [o['line'] for o in fixture['orders']]
assert set(authored) == {line['id'] for line in lines}, 'Punctuation inventory differs from current restaurant'
for line in lines:
    text = authored[line['id']]
    visible = ''.join(token['hanzi'] for token in line['tokens'])
    assert ''.join(c for c in text if c not in '，。！？·') == visible, line['id']
    line['text'] = text
assert len(lines) == 24
out.mkdir(parents=True, exist_ok=True)
(out / 'content.json').write_text(json.dumps(fixture, ensure_ascii=False, indent=2) + '\n')
(out / 'voices.json').write_bytes((ROOT / 'src/content/voices.json').read_bytes())
print(f'Prepared {len(lines)} punctuation-only synthesis lines; tokens and voice presets unchanged: {out}')
