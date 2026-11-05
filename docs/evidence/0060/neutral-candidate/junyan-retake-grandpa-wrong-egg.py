from pathlib import Path
import importlib.util,json,shutil,argparse
root=Path('/tmp/junyan-feedback-0060-source')
spec=importlib.util.spec_from_file_location('pipeline',root/'scripts/content-audio.py');p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
out=root/'output/0060-full-neutral';content=json.loads((out/'content.json').read_text());voices=json.loads((out/'voices.json').read_text())
jobs=p.collect_jobs(content,voices);targets=[j for j in jobs if j['text'] in ['不对，我要鸡蛋。'] and j['voice']['speaker']=='Uncle_Fu' and '1.7B' in j['voice']['model']]
assert len(targets)==1
rejected=out/'rejected-second-wrong-egg';rejected.mkdir(exist_ok=False)
manifest=json.loads((out/'audio/manifest.json').read_text());names={j['filename'] for j in targets};records=[c for c in manifest['clips'] if c['filename'] in names];assert len(records)==1
(rejected/'manifest.json').write_text(json.dumps({'clips':records},ensure_ascii=False,indent=2)+'\n')
for name in names:shutil.move(out/'audio'/name,rejected/name)
shutil.copyfile(out/'asr-results.json',rejected/'asr-results.json');shutil.copyfile(out/'asr-beam5-results.json',rejected/'asr-beam5-results.json')
manifest['clips']=[c for c in manifest['clips'] if c['filename'] not in names];(out/'audio/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
engine=p.LocalEngines()
def checked(job,seed):
 first=int(job['content_digest'][:8],16)%(2**32)
 if job['filename'] in names and seed in (first,(first+1000)%(2**32)):raise ValueError('Previously synthesized take rejected for unresolved unprompted ASR word/omission concern; preserved under rejected-second-wrong-egg with SHA-bound results. No human listening claim.')
 return engine(job,seed)
args=argparse.Namespace(content=out/'content.json',voices=out/'voices.json',output=out/'audio',plan=False,engine='qwen',write_content=True,limit=None)
raise SystemExit(p.run(args,checked))
