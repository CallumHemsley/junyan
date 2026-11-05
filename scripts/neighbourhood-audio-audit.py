"""Audit neighbourhood speech against exact authored text, approved presets and byte provenance."""
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True

spec = importlib.util.spec_from_file_location('neighbourhood_audio', Path(__file__).with_name('neighbourhood-audio.py'))
local = importlib.util.module_from_spec(spec)
spec.loader.exec_module(local)
audio = local.audio
root = local.ROOT
output = root / 'public/audio'
config = audio.read_json(root / 'src/content/voices.json')
records = local.records_from(output / 'manifest.json')
for feature in local.FEATURES:
    records.update(local.records_from(output / feature / 'manifest.json', feature + '/'))
report = {}
for feature in local.FEATURES:
    jobs = local.jobs_for(feature, config)
    missing, invalid = [], []
    for job in jobs:
        if not (output / job['filename']).is_file():
            missing.append('/audio/' + job['filename'])
        elif not local.cache_valid(job, output, records):
            invalid.append('/audio/' + job['filename'])
    report[feature] = {'references': len(jobs), 'missing': missing, 'invalid': invalid}
missing = sum(len(value['missing']) for value in report.values())
invalid = sum(len(value['invalid']) for value in report.values())
print(json.dumps({'status': 'FAIL' if missing or invalid else 'PROVENANCE_AND_SIGNAL_PASS_NOT_LISTENING_APPROVAL',
                  'missing': missing, 'invalid': invalid, 'features': report}, ensure_ascii=False, indent=2))
sys.exit(1 if missing or invalid else 0)
