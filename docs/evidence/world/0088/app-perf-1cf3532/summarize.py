import json,statistics,collections
from pathlib import Path
root=Path(__file__).parent
out={}
for mode in ['production','instrumented','2a7-instrumented']:
 j=json.loads((root/f'{mode}-measurements.json').read_text());data={}
 for label in dict.fromkeys(r['scenario']for r in j['rows']):
  rows=[r for r in j['rows']if r['scenario']==label and 'metrics'in r]
  if not rows:continue
  def stats(v):return {'median':statistics.median(v),'min':min(v),'max':max(v)} if v else None
  names=sorted(set(c['name']for r in rows for c in r['metrics']['calls']))
  data[label]={'samples':len(rows),'wallMs':stats([r['wallMs']for r in rows if 'wallMs'in r]),'maxFrameGapMs':stats([max(r['metrics']['frames']or[0])for r in rows]),'medianFrameGapMs':stats([statistics.median(r['metrics']['frames']or[0])for r in rows]),'longTaskCount':sum(len(r['metrics']['tasks'])for r in rows),'maxLongTaskMs':max([t['duration']for r in rows for t in r['metrics']['tasks']]or[0]),'functions':{name:{'calls':stats([sum(c['name']==name for c in r['metrics']['calls'])for r in rows]),'totalMs':stats([sum(c['ms']for c in r['metrics']['calls']if c['name']==name)for r in rows]),'maxCallMs':stats([max([c['ms']for c in r['metrics']['calls']if c['name']==name]or[0])for r in rows])}for name in names}}
 out[mode]={'head':j['head'],'errors':j['errors'],'scenarios':data}
(root/'summary.json').write_text(json.dumps(out,indent=2))
for mode,values in out.items():
 print(mode)
 for name in ['ordinary-restaurant','journey-town','journey-apartment','restyle-colour','restyle-rug','journey-apartment-reload','journey-town-cold-reload']:
  s=values['scenarios'][name];print(name, 'maxframes',s['maxFrameGapMs'],'restore',s['functions'].get('restoreWorld'), 'component',s['functions'].get('exitComponent'))
