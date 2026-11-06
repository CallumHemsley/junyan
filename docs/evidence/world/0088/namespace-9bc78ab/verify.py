import subprocess,json,hashlib,pathlib
head='9bc78ab03d01f9dbf30fd2ccd7a37924ab4f9772';base='1cf3532e9b40cbdd99d51ee860562e8f292a1d4e';main='266e9bcd922151160d2edff48fb8078c874be135'
def show(p):return subprocess.check_output(['git','show',head+':'+p])
root='docs/world-program/main-reconciliation/'
manifest=json.loads(show(root+'materialized-result.json'));p=subprocess.Popen(['git','cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE)
errors=[];total=0
for f in manifest['files']:
 p.stdin.write((head+':'+f['newPath']+'\n').encode());p.stdin.flush();header=p.stdout.readline().decode().split()
 if len(header)!=3: errors.append({'path':f['newPath'],'header':header});continue
 size=int(header[2]);remaining=size;h=hashlib.sha256()
 while remaining:
  b=p.stdout.read(min(1048576,remaining));assert b;h.update(b);remaining-=len(b)
 assert p.stdout.read(1)==b'\n';total+=size
 if h.hexdigest()!=f['resultSha256']:errors.append({'path':f['newPath'],'actual':h.hexdigest(),'expected':f['resultSha256']})
p.stdin.close();p.wait()
def tree(ref,paths):
 out=subprocess.check_output(['git','ls-tree','-r','-z',ref,'--',*paths]);return {v.split(b'\t',1)[1].decode():v.split(b'\t',1)[0].decode() for v in out.split(b'\0') if v}
a=tree(main,['docs/tickets','docs/evidence']);b=tree(head,['docs/tickets','docs/evidence']);changed=[f for f,v in a.items() if b.get(f)!=v]
prod=['src','public','package.json','pnpm-lock.yaml'];x=tree(base,prod);y=tree(head,prod)
other=[f for f in subprocess.check_output(['git','diff','--name-only',base,head],text=True).splitlines() if not f.startswith('docs/')]
result={'head':head,'base':base,'main':main,'method':'independent git cat-file streamed SHA256 of every result plus exact Git tree/blob/mode comparison, no generator execution','resultFilesChecked':len(manifest['files']),'bytesHashed':total,'resultHashErrors':errors,'mainDocPaths':len(a),'mainMissingOrChanged':changed,'productionPaths':len(x),'productionTreeIdentical':x==y,'nonDocsChanges':other}
pathlib.Path('docs/evidence/world/0088/namespace-9bc78ab/results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));assert not errors and not changed and x==y and not other
