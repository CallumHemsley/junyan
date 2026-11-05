"""Stage a targeted 23-line import against this checkout. Never write production files."""
import argparse
from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path
import runpy
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
REF = '64edaa7fe7d83264bbaac14b445d7ad1d9b94f13'
PREFIX = 'docs/evidence/0062/selected-punctuation/'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
out = args.output.resolve()
if out.exists():
    parser.error('Use a fresh staging directory')
if out == ROOT or ROOT in out.parents and 'output' not in out.relative_to(ROOT).parts:
    parser.error('Use an external directory or an ignored output directory')

def support(path):
    return subprocess.check_output(['git', 'show', REF + ':' + PREFIX + path], cwd=ROOT)

def restaurant(content):
    return [c[role] for c in content['characters'] for role in ('greeting', 'retry', 'thanks')] + [o['line'] for o in content['orders']]

original = json.loads((ROOT / 'src/content/content.json').read_text())
content = deepcopy(original)
voices = json.loads((ROOT / 'src/content/voices.json').read_text())
manifest = json.loads((ROOT / 'public/audio/manifest.json').read_text())
records = {entry['filename']: entry for entry in manifest['clips']}
if len(records) != len(manifest['clips']):
    raise ValueError('Duplicate production manifest filenames')
rejected = 'line-71cc826bfe95375cd38207f20368356df6c5fefc9fb79f99b309065b8fb382d9.wav'
rows = [row for row in json.loads(support('inventory.json')) if row['lineId'] != 'zhang-retry']
entries = [entry for entry in json.loads(support('manifest-entries.json'))['clips'] if entry['filename'] != rejected]
selected = {entry['filename']: entry for entry in entries}
lines = {line['id']: line for line in restaurant(content)}
if len(rows) != 23 or len(selected) != 23 or len(lines) != 24 or {r['lineId'] for r in rows} != set(lines) - {'zhang-retry'}:
    raise ValueError('Expected 23 distinct target lines; original zhang-retry must be retained')
for row in rows:
    line = lines[row['lineId']]
    if ''.join(c for c in row['text'] if c not in '，。！？·') != ''.join(t['hanzi'] for t in line['tokens']):
        raise ValueError('Candidate changes visible meaning: ' + line['id'])
    line.update(text=row['text'], audio=row['audio'])
# Prove the sole content mutations are those 48 fields; new unrelated data survives.
restored = deepcopy(content)
for before, after in zip(restaurant(original), restaurant(restored)):
    after['audio'] = before['audio']
    if 'text' in before:
        after['text'] = before['text']
    else:
        after.pop('text', None)
if restored != original:
    raise ValueError('Non-target content mutation')
pipeline = runpy.run_path(str(ROOT / 'scripts/content-audio.py'))
jobs = {job['filename']: job for job in pipeline['collect_jobs'](content, voices)}
files = {}
for row in rows:
    name = row['audio'].removeprefix('/audio/')
    if Path(name).name != name or name not in selected or name not in jobs:
        raise ValueError('Invalid candidate filename')
    entry, job = selected[name], jobs[name]
    for key in ('generator_version', 'kind', 'text', 'voice', 'pronunciation', 'content_digest'):
        if entry[key] != job[key]:
            raise ValueError('Primary pipeline identity mismatch: ' + name + '/' + key)
    data = support(name)
    if sha256(data).hexdigest() != row['sha256'] or row['sha256'] != entry['sha256']:
        raise ValueError('Candidate bytes mismatch')
    if name in records and records[name] != entry:
        raise ValueError('Conflicting current manifest record: ' + name)
    files[name] = data
# Four explicitly accepted takes must remain byte-identical.
accepted = json.loads(subprocess.check_output(['git', 'show', 'bf90baa2d266d59368829573c3d4f73c2c0fe05b:docs/evidence/0062/local-probes/inventory.json'], cwd=ROOT))
for row in accepted:
    if sha256(files[Path(row['candidateAudio']).name]).hexdigest() != row['sha256']:
        raise ValueError('Accepted thanks take changed')
if lines['zhang-retry'] != next(line for line in restaurant(original) if line['id'] == 'zhang-retry'):
    raise ValueError('Original teacher retry was modified')
new_entries = [entry for entry in entries if entry['filename'] not in records]
manifest['clips'].extend(new_entries)
out.mkdir(parents=True)
shutil.copytree(ROOT / 'public/audio', out / 'audio')
for name, data in files.items():
    (out / 'audio' / name).write_bytes(data)
    if not pipeline['cache_valid'](jobs[name], out / 'audio', selected):
        raise ValueError('Primary cache/signal validation failed: ' + name)
(out / 'content.json').write_text(json.dumps(content, ensure_ascii=False, indent=2) + '\n')
(out / 'voices.json').write_bytes((ROOT / 'src/content/voices.json').read_bytes())
(out / 'audio/manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
report = dict(supportCommit=REF, checkoutHead=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
              targetedLines=23, acceptedThanksUnchanged=4, addedManifestRecords=len(new_entries),
              retiredFiles=0, productionWritten=False, approvalStatus="ROOT_SELECTED_23_PENDING_LEASE_AND_FINAL_REVIEW",
              retainedOriginalLineIds=["zhang-retry"], rejectedCandidate=rejected,
              inputHashes={str(p):sha256((ROOT/p).read_bytes()).hexdigest() for p in ('src/content/content.json','src/content/voices.json','public/audio/manifest.json')})
(out / 'import-report.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
