"""Verify support-only thanks probes and export manual A/B playback. Never promote audio."""
import argparse
from hashlib import sha256
import html
import json
from pathlib import Path
import subprocess
import wave
import io

ROOT = Path(__file__).resolve().parents[2]
REF = 'bf90baa2d266d59368829573c3d4f73c2c0fe05b'
PREFIX = 'docs/evidence/0062/local-probes/'
BASELINE_REF = '66ac123fa377f0cdbfb30f5c8bad07edf28790e4'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
out = args.output.resolve()
if out == ROOT or ROOT in out.parents and 'output' not in out.relative_to(ROOT).parts:
    parser.error('Use an external directory or an ignored output directory')

def support(path):
    return subprocess.check_output(['git', 'show', REF + ':' + PREFIX + path], cwd=ROOT)

inventory = json.loads(support('inventory.json'))
manifest = json.loads(support('candidate-manifest-entries.json'))
def baseline_file(path):
    return subprocess.check_output(['git', 'show', BASELINE_REF + ':' + path], cwd=ROOT)

content = json.loads(baseline_file('src/content/content.json'))
voices = json.loads(baseline_file('src/content/voices.json'))['voices']
records = {clip['filename']: clip for clip in manifest['clips']}
baseline_records = {clip['filename']: clip for clip in json.loads(baseline_file('public/audio/manifest.json'))['clips']}
characters = {character['id']: character for character in content['characters']}
if len(inventory) != 4 or {row['characterId'] for row in inventory} != set(characters):
    raise ValueError('Expected exactly one probe for each regular')
rows, sections, files = [], [], {}
for row in inventory:
    character = characters[row['characterId']]
    line = character['thanks']
    candidate = row['candidateAudio'].removeprefix('/audio/')
    if Path(candidate).name != candidate or candidate not in records:
        raise ValueError('Invalid candidate path')
    entry = records[candidate]
    if (row['lineId'] != line['id'] or row['baselineAudio'] != line['audio']
            or entry['voice'] != voices[character['voiceId']]
            or entry['text'] != row['text']
            or ''.join(c for c in row['text'] if c not in '，。！？·') != ''.join(t['hanzi'] for t in line['tokens'])
            or entry['pronunciation']['authored_pinyin'] != [t['pinyin'] for t in line['tokens']]):
        raise ValueError('Probe does not match shipped identity/tokens: ' + row['lineId'])
    baseline = (ROOT / 'public' / line['audio'].lstrip('/')).resolve()
    if not baseline.is_relative_to(ROOT / 'public/audio'):
        raise ValueError('Invalid baseline path')
    pair = [('before', baseline_file('public' + line['audio'])), ('after', support('audio/' + candidate))]
    review = {**row, 'supportCommit': REF, 'baselineCommit': BASELINE_REF, 'voiceId': character['voiceId'], 'listening': 'NOT REVIEWED'}
    sections.append('<section><h2>' + html.escape(row['name']) + '</h2><p>' + html.escape(row['text']) + '</p>')
    for label, data in pair:
        checksum = sha256(data).hexdigest()
        if label == 'after' and checksum not in (row['sha256'],):
            raise ValueError('Inventory checksum mismatch')
        if label == 'after' and checksum != entry['sha256']:
            raise ValueError('Candidate checksum mismatch')
        if label == 'before' and checksum != baseline_records[baseline.name]['sha256']:
            raise ValueError('Shipped baseline checksum mismatch')
        with wave.open(io.BytesIO(data)) as wav:
            if (wav.getnchannels(), wav.getsampwidth(), wav.getframerate()) != (1, 2, 24000):
                raise ValueError('Expected mono PCM16 24kHz WAV')
            duration = wav.getnframes() / wav.getframerate()
        filename = row['lineId'] + '-' + label + '.wav'
        files[filename] = data
        review[label] = dict(filename=filename, sha256=checksum, durationSeconds=duration)
        sections.append('<label>' + label + '<audio controls preload="none" src="' + filename + '"></audio></label>')
    sections.append('</section>')
    rows.append(review)
out.mkdir(parents=True, exist_ok=True)
for filename, data in files.items():
    (out / filename).write_bytes(data)
(out / 'review.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
(out / 'candidate-manifest-entries.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
(out / 'index.html').write_text('''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>0062 thanks comparison</title><link rel="icon" href="data:,"><style>body{font:18px system-ui;max-width:850px;margin:24px auto;padding:16px;background:#faf7f0;color:#302b2a}section{border-top:1px solid #ccc;padding:8px 0 24px}label{display:inline-flex;flex-direction:column;margin:8px}audio{max-width:100%}</style>
<h1>Four regulars: thanks comparison</h1><p>Manual playback only. Before: shipped take. After: new take with punctuation. Same voice presets and visible words. No listening approval recorded.</p>
<p>Compare ordinary conversational pacing, clause boundaries, exact Mandarin and retained identity. Record before/after preference per person and any excessive pause, missing/repeated word or unclear tone. A new take also changes its seed; this comparison does not isolate punctuation causally. No gain, trim or resampling applied.</p>''' + ''.join(sections) + '''<script>document.addEventListener('play', event => { for (const clip of document.querySelectorAll('audio')) if (clip !== event.target) clip.pause(); }, true);</script>''')
print(f'Verified 4 probe identities/checksums and exported 8 real WAVs to {out}; listening NOT REVIEWED')
