import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
content = json.loads((root / 'src/features/repairs/content.json').read_text())
paths = set()
def visit(value):
    if isinstance(value, dict):
        if 'audio' in value:
            paths.add(value['audio'])
        for child in value.values():
            visit(child)
    elif isinstance(value, list):
        for child in value:
            visit(child)
visit(content)
missing = sorted(path for path in paths if not (root / 'public' / path.lstrip('/')).is_file())
print(json.dumps({'referenced': len(paths), 'available': len(paths) - len(missing), 'missing': missing, 'shippable': not missing}, ensure_ascii=False, indent=2))
raise SystemExit(bool(missing))
