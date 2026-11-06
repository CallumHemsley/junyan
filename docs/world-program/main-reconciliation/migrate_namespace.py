"""Prepared migration patch. Default is dry-run; --apply only in a clean serialized checkout.
Reads pinned git objects, never mutable owner branches. Does not stage or commit.
"""
import argparse, hashlib, json, os, re, subprocess
from pathlib import Path, PurePosixPath
p=argparse.ArgumentParser();p.add_argument('--apply',action='store_true');a=p.parse_args()
root=Path(subprocess.check_output(['git','rev-parse','--show-toplevel'],text=True).strip())
manifest=json.loads((Path(__file__).parent/'namespace-manifest.json').read_text())
def blob(head,path):return subprocess.check_output(['git','show',head+':'+path])
def digest(data):return hashlib.sha256(data).hexdigest()
if a.apply and subprocess.check_output(['git','status','--porcelain'],text=True).strip():raise SystemExit('Apply requires clean checkout and exclusive documentation writer')
for protected in manifest['protectedMainFiles']:
 f=root/protected['path']
 if f.exists() and digest(f.read_bytes())!=protected['sha256']:
  raise SystemExit('Main-owned document differs; preserve separately before migration: '+protected['path'])
mapping={r['oldPath']:r['newPath'] for r in manifest['files']}
prepared=[]
for r in manifest['files']:
 data=blob(r['sourceHead'],r['oldPath']);assert digest(data)==r['sha256'],r['oldPath']
 old=root/r['oldPath'];new=root/r['newPath']
 # Never erase a changed world file. Main-owned old paths will be restored exactly.
 main=blob(manifest['main'],r['oldPath']) if r['mainOwnsOldPath'] else None
 if old.exists() and old.read_bytes()!=data and (main is None or old.read_bytes()!=main):raise SystemExit('Changed old path; reconcile explicitly: '+r['oldPath'])
 result=data
 if new.suffix.lower() in {'.md','.py','.ts','.tsx','.js','.mjs','.cjs','.json','.html'}:
  try:
   s=data.decode()
   if new.suffix=='.md':
    def link(m):
     target=m.group(1)
     if ':' in target or target.startswith(('#','/')):return m.group(0)
     path,sep,frag=target.partition('#')
     resolved=os.path.normpath(str(PurePosixPath(r['oldPath']).parent/path))
     destination=mapping.get(resolved,resolved)
     relative=os.path.relpath(destination,str(PurePosixPath(r['newPath']).parent))
     return ']('+relative+(sep+frag if sep else '')+')'
    s=re.sub(r'\]\(([^\s)]+)\)',link,s)
   for before,after in mapping.items():s=s.replace(before,after)
   result=s.encode()
  except UnicodeDecodeError:pass
 if new.exists() and new.read_bytes()!=result:raise SystemExit('Destination differs; never overwrite: '+r['newPath'])
 prepared.append((r,result,main))
print(json.dumps({'mode':'apply' if a.apply else 'dry-run','files':len(prepared),'sourceBytes':sum(r['bytes'] for r,_,_ in prepared),'main':manifest['main']}))
if a.apply:
 for r,data,main in prepared:
  old=root/r['oldPath'];new=root/r['newPath'];new.parent.mkdir(parents=True,exist_ok=True);new.write_bytes(data)
  if main is not None:old.parent.mkdir(parents=True,exist_ok=True);old.write_bytes(main)
  elif old.exists():old.unlink()
 # Update full repository-path references in live text files, excluding main's exact evidence/tickets.
 main_docs=set(subprocess.check_output(['git','ls-tree','-r','--name-only',manifest['main'],'docs/evidence','docs/tickets'],text=True).splitlines())
 for name in subprocess.check_output(['git','ls-files'],text=True).splitlines():
  f=root/name
  if not name.startswith('docs/') or name in main_docs or name in mapping or name.startswith('docs/world-program/main-reconciliation/') or not f.is_file():continue
  if f.suffix not in {'.md','.py','.ts','.tsx','.js','.mjs','.cjs','.json','.html'}:continue
  try:s=f.read_text()
  except UnicodeDecodeError:continue
  before=s
  for old,new in mapping.items():s=s.replace(old,new)
  if s!=before:f.write_text(s)
 print('Prepared working-tree patch; inspect links and source leases before committing. No git staging performed.')
