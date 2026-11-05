"""Report exact corpus references whose offline audio is unavailable. Does not synthesize."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[3]
content=json.loads((root/'src/features/apartment/content.json').read_text())
refs={word['audio'] for word in content['words']}|{line['audio'] for line in content['lines']}
missing=sorted(path for path in refs if not (root/'public'/path.lstrip('/')).is_file())
report={'references':len(refs),'present':len(refs)-len(missing),'missing':missing,'complete':not missing}
print(json.dumps(report,ensure_ascii=False,indent=2))
raise SystemExit(bool(missing))
