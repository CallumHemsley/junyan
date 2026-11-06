import subprocess,json,re,hashlib,sys
from pathlib import Path

def git(*args):
 return subprocess.check_output(['git',*args],text=True,stderr=subprocess.DEVNULL).strip()
base=git('rev-parse',sys.argv[1] if len(sys.argv)>1 else '23be251')
scopes=[('town','0079-town-street','src/world/art/town'),('courtyard','0080-courtyard','src/world/art/courtyard'),('residential','0081-residential','src/world/art/residential'),('workshop','0082-workshop','src/world/art/workshop'),('rooftop','0083-rooftop','src/world/art/rooftop'),('landscape','0084-landscape','src/world/art/landscape'),('characters','0085-characters','src/world/characters'),('atmosphere','0086-atmosphere','src/world/atmosphere'),('life','0087-world-life','src/world/life'),('restaurant','0089-restaurant-world-art','src/world/art/restaurant'),('ui','0090-contextual-world-ui','src/world/ui')]
def files(ref,path):
 result={}
 for line in git('ls-tree','-r',ref,'--',path).splitlines():
  if not line:continue
  meta,name=line.split('\t');sha=meta.split()[2];result[name]=sha
 return result
rows=[]
for name,branch,path in scopes:
 ref='origin/codex/'+branch;head=git('rev-parse',ref);owned=files(head,path);used=files(base,path)
 exports={}
 for label,rev,listing in [('owner',head,owned),('consumed',base,used)]:
  ix=next((p for p in listing if p in (path+'/index.ts',path+'/index.tsx')),None)
  exports[label]=[] if not ix else [s.strip() for s in git('show',rev+':'+ix).splitlines() if re.match(r'export\s',s)]
 rows.append({'owner':name,'publishedHead':head,'consumedFoundation':base,'path':path,'ownerTree':git('rev-parse',head+':'+path) if owned else None,'consumedTree':git('rev-parse',base+':'+path) if used else None,'status':'absent' if not used else 'identical' if owned==used else 'different','exports':exports,'files':[{'path':p,'ownerBlob':owned.get(p),'consumedBlob':used.get(p),'same':owned.get(p)==used.get(p)} for p in sorted(owned.keys()|used.keys())]})
root=Path(__file__).parent
(root/'snapshot.json').write_text(json.dumps({'foundation':base,'method':'Git blob/tree identities and syntactic export declarations; differing bytes do not alone prove incompatibility. Owner refs must be fetched before collection. No guessed cherry-pick ancestry.', 'modules':rows},indent=2)+'\n')
lines=['# Integrated art provenance','',f'Consumed foundation: `{base}`. Latest fetched owner references at collection.','', '| Owner | Published head | Consumed tree | Owner tree | Status |','| --- | --- | --- | --- | --- |']
for r in rows:lines.append(f"| {r['owner']} | `{r['publishedHead'][:12]}` | `{(r['consumedTree'] or 'absent')[:12]}` | `{(r['ownerTree'] or 'absent')[:12]}` | {r['status']} |")
lines+=['','Full exact file blob hashes and declared exports are in snapshot.json. Each consumed module is pinned to the foundation head; a cherry-pick is not presumed to retain its original owner commit. Tree differences require review, not blind overwrite. Foundation owns integration and shared files.','', 'This report is provenance, not whole-game acceptance. Recollect against the complete-art checkpoint after integration; run production dispatch/coverage tests and actual landmark captures.']
(root/'README.md').write_text('\n'.join(lines)+'\n')
print('\n'.join(lines))
