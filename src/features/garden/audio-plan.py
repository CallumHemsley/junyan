"""Audit pinned garden jobs without synthesizing or changing shared content."""
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location('garden_audio_pipeline', ROOT / 'scripts/content-audio.py')
pipeline = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pipeline)
content = json.loads((ROOT / 'src/features/garden/content.json').read_text())
voices = json.loads((ROOT / 'src/content/voices.json').read_text())
jobs = pipeline.collect_jobs(content, voices)
report = []
for job in jobs:
    paths = sorted({target['audio'] for target in job['targets']})
    for path in paths:
        if path.split('/')[-1] != job['filename']:
            raise ValueError(f'Authored asset differs from pinned pipeline identity: {path}')
    report.append({key: job[key] for key in ('filename', 'kind', 'text', 'voice', 'pronunciation', 'content_digest')})
    report[-1].update(paths=paths, present=all((ROOT / 'public' / path.lstrip('/')).is_file() for path in paths))
print(json.dumps({'voice': voices['wordVoice'], 'jobs': report, 'missing': sum(not job['present'] for job in report)}, ensure_ascii=False, indent=2))
