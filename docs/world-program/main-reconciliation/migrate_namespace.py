"""Prepared migration patch. Default is dry-run; --apply only in a clean serialized checkout.
Reads pinned git objects, never mutable owner branches. Does not stage or commit.
"""
import argparse, hashlib, json, os, re, subprocess
from pathlib import Path, PurePosixPath
p=argparse.ArgumentParser();p.add_argument('--apply',action='store_true');p.add_argument('--report',type=Path);a=p.parse_args()
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
def destination_for(path):
 if path in mapping:return mapping[path]
 for owner in manifest['heads']:
  prefix='docs/evidence/'+owner
  if path==prefix or path.startswith(prefix+'/'):return path.replace(prefix,'docs/evidence/world/'+owner,1)
 return path
archives={r['oldPath']:r for r in manifest.get('foundationArchives',[])}
prepared=[]
for r in manifest['files']:
 data=blob(r['sourceHead'],r['oldPath']);assert digest(data)==r['sha256'],r['oldPath']
 old=root/r['oldPath'];new=root/r['newPath']
 # Never erase a changed world file. Main-owned old paths will be restored exactly.
 main=blob(manifest['main'],r['oldPath']) if r['mainOwnsOldPath'] else None
 if old.exists() and old.read_bytes()!=data and (main is None or old.read_bytes()!=main):
  archive=archives.get(r['oldPath'])
  if not archive or digest(old.read_bytes())!=archive['sha256']:raise SystemExit('Changed old path; reconcile explicitly: '+r['oldPath'])
 result=data
 if not new.name.endswith('.source.ts') and new.suffix.lower() in {'.md','.py','.ts','.tsx','.js','.mjs','.cjs','.html'}:
  try:
   s=data.decode()
   if new.suffix=='.md':
    def link(m):
     target=m.group(1)
     if ':' in target or target.startswith(('#','/')):return m.group(0)
     path,sep,frag=target.partition('#')
     resolved=os.path.normpath(str(PurePosixPath(r['oldPath']).parent/path))
     destination=destination_for(resolved)
     relative=os.path.relpath(destination,str(PurePosixPath(r['newPath']).parent))
     return ']('+relative+(sep+frag if sep else '')+')'
    s=re.sub(r'\]\(([^\s)]+)\)',link,s)
   if new.suffix in {'.ts','.tsx','.js','.mjs','.cjs','.html'}:
    def relative_import(m):
     prefix,quote,target=m.groups()
     resolved=os.path.normpath(str(PurePosixPath(r['oldPath']).parent/target))
     relative=os.path.relpath(destination_for(resolved),str(PurePosixPath(r['newPath']).parent))
     if not relative.startswith('.'):relative='./'+relative
     return prefix+quote+relative+quote
    s=re.sub(r"((?:from\s+|import\s+|import\(\s*|require\(\s*|new URL\(\s*|src=|href=))([\"'`])(\.\.?/[^\"'`]+)\2",relative_import,s)
   for before,after in mapping.items():s=s.replace(before,after)
   for owner in manifest['heads']:s=re.sub(r'docs/evidence/'+owner+r'(?![0-9])', 'docs/evidence/world/'+owner, s)
   if r['oldPath']=='docs/evidence/0089/prepare-seat.mjs':s=s.replace('../../../../../src/content','../../../../../../src/content')
   result=s.encode()
  except UnicodeDecodeError:pass
 if new.exists() and new.read_bytes()!=result:raise SystemExit('Destination differs; never overwrite: '+r['newPath'])
 prepared.append((r,result,main))
if a.report:
 a.report.write_text(json.dumps({'main':manifest['main'],'applied':a.apply,'files':[dict(r,resultSha256=digest(data),byteIdentical=digest(data)==r['sha256']) for r,data,_ in prepared]},indent=2)+'\n')
print(json.dumps({'mode':'apply' if a.apply else 'dry-run','files':len(prepared),'sourceBytes':sum(r['bytes'] for r,_,_ in prepared),'main':manifest['main']}))
if a.apply:
 for archive in archives.values():
  raw=blob(archive['sourceHead'],archive['oldPath']);assert digest(raw)==archive['sha256']
  dest=root/archive['archivePath'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw)
 for r,data,main in prepared:
  old=root/r['oldPath'];new=root/r['newPath'];new.parent.mkdir(parents=True,exist_ok=True);new.write_bytes(data)
  if main is not None:old.parent.mkdir(parents=True,exist_ok=True);old.write_bytes(main)
  elif old.exists():old.unlink()
 # Materialize exact main docs so future semantic merge has no evidence ambiguity.
 for protected in manifest['protectedMainFiles']:
  f=root/protected['path'];raw=blob(manifest['main'],protected['path']);assert digest(raw)==protected['sha256']
  f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(raw)
 # Only relocated files are rewritten here. Live world-doc/script references get
 # a separately reviewed explicit-file patch; never global numeric replacement.
 print('Prepared working-tree patch; inspect links and source leases before committing. No git staging performed.')
