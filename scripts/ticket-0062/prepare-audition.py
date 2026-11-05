"""Export all restaurant performances for manual review; never synthesize or edit production."""
import argparse
import hashlib
import html
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
out = args.output.resolve()
if out == ROOT or ROOT in out.parents and 'output' not in out.relative_to(ROOT).parts:
    parser.error('Use an external directory or an ignored output directory')
out.mkdir(parents=True, exist_ok=True)
content = json.loads((ROOT / 'src/content/content.json').read_text())
voices = json.loads((ROOT / 'src/content/voices.json').read_text())
rows = []
sections = []
for character in content['characters']:
    lines = [(role, character[role]) for role in ('greeting', 'retry', 'thanks')]
    lines += [('order', order['line']) for order in content['orders'] if order['customer'] == character['name']]
    sections.append('<h2>' + html.escape(character['name']) + '</h2>')
    for role, line in lines:
        source = (ROOT / 'public' / line['audio'].lstrip('/')).resolve()
        if not source.is_relative_to(ROOT / 'public/audio') or not source.is_file():
            raise ValueError(f'Invalid or absent baseline: {source}')
        filename = source.name
        shutil.copyfile(source, out / filename)
        text = line.get('text', ''.join(token['hanzi'] for token in line['tokens']))
        rows.append(dict(character=character['name'], voiceId=character['voiceId'], role=role,
                         lineId=line['id'], text=text, audio=filename,
                         sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                         listening='NOT REVIEWED'))
        sections.append('<p>' + html.escape(role + ' / ' + line['id'] + ' / ' + text)
                        + '</p><audio controls preload="none" src="' + html.escape(filename, quote=True) + '"></audio>')
(out / 'baseline.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
(out / 'index.html').write_text('<!doctype html><meta charset="utf-8"><title>0062 baseline review</title>'
    '<h1>Four regulars: shipped baseline</h1><p>Manual playback only. No listening approval recorded.</p>' + ''.join(sections))
fixture = {'characters': content['characters'], 'orders': content['orders']}
(out / 'content.json').write_text(json.dumps(fixture, ensure_ascii=False, indent=2) + '\n')
(out / 'voices.json').write_text(json.dumps(voices, ensure_ascii=False, indent=2) + '\n')
print(f'Exported {len(rows)} line references across {len(content["characters"])} customers to {out}')
