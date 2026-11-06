"""Independent exact comparison; run after merged namespace operation."""
import subprocess,json,hashlib
from pathlib import Path
main='266e9bcd922151160d2edff48fb8078c874be135'
root=Path(subprocess.check_output(['git','rev-parse','--show-toplevel'],text=True).strip())
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',main,'docs/tickets','docs/evidence'],text=True).splitlines()
missing=[];changed=[]
for path in paths:
 f=root/path
 if not f.is_file():missing.append(path);continue
 original=subprocess.check_output(['git','show',main+':'+path])
 if f.read_bytes()!=original:changed.append(path)
print(json.dumps({'main':main,'checked':len(paths),'missing':missing,'changed':changed,'pass':not missing and not changed},indent=2))
raise SystemExit(bool(missing or changed))
