from pathlib import Path
from collections import deque
import json
W,H=48,36
static=[('stairhead',3,25,8,8),('tank',5,5,5,5),('tool-bay',4,13,5,5),('trellis-bed',14,5,14,3),('herb-bed',15,14,7,3),('flower-border',36,5,7,5),('orchard',36,16,6,5),('compost',4,20,4,3),('pergola',29,25,13,3),('bench',31,30,8,1)]
sites=[(15,22),(24,22),(32,19),(15,29),(24,29),(31,12)]
landmarks={'landing':(12,29),'water':(11,8),'tools':(10,15),'trellis':(21,9),'herbs':(18,18),'lookout':(43,12),'orchard':(39,22),'bench':(35,29)}
reports={}
for variant,extra in {'loop':[(19,23,8,4)],'cross':[]}.items():
 blocked={(x,y) for x in range(W) for y in range(H) if x<2 or y<2 or x>=W-2 or y>=H-2}
 blocks=static+[(f'extra{i}',*b) for i,b in enumerate(extra)]
 for _,x,y,w,h in blocks: blocked.update((a,b) for a in range(x,x+w) for b in range(y,y+h))
 for x,y in sites: blocked.update((a,b) for a in range(x-1,x+2) for b in range(y-1,y+2))
 start=landmarks['landing']; seen={start}; q=deque([start]); distances={start:0}
 while q:
  x,y=q.popleft()
  for nxt in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
   a,b=nxt
   if 0<=a<W and 0<=b<H and nxt not in blocked and nxt not in seen:
    seen.add(nxt); distances[nxt]=distances[(x,y)]+1; q.append(nxt)
 reports[variant]={'reachable':{name:point in seen for name,point in landmarks.items()},'distance':{name:distances.get(point) for name,point in landmarks.items()},'walkable_cells':len(seen),'note':'Sketch only; not product traversal proof. All six sites blocked is stricter than three actual pots.'}
 svg=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 480 360"><rect width="480" height="360" fill="#9eafbc"/>','<rect x="15" y="15" width="450" height="330" fill="#c5c2ad" stroke="#575343" stroke-width="5"/>']
 for y in range(2,H-2):
  for x in range(2,W-2):
   if (x,y) not in blocked: svg.append(f'<rect x="{x*10}" y="{y*10}" width="10" height="10" fill="{["#c7c4ae","#cecab4","#d1ccb7"][(x*13+y*7)%3]}" stroke="#bbb9a5" stroke-width=".3"/>')
 for name,x,y,w,h in blocks:
  color='#6f9a86' if any(a in name for a in ['bed','orchard','border']) else '#8a8574'
  svg.append(f'<rect x="{x*10}" y="{y*10}" width="{w*10}" height="{h*10}" rx="2" fill="{color}" stroke="#5c5b4c"/><text x="{x*10+3}" y="{y*10+10}" font-size="6" fill="#241d16">{name}</text>')
 for i,(x,y) in enumerate(sites): svg.append(f'<rect x="{x*10-10}" y="{y*10-10}" width="30" height="30" rx="5" fill="#b29a76" stroke="#75694f"/><circle cx="{x*10+5}" cy="{y*10+5}" r="9" fill="#6f9a86"/><text x="{x*10+3}" y="{y*10+7}" font-size="7">{i}</text>')
 for name,(x,y) in landmarks.items(): svg.append(f'<circle cx="{x*10+5}" cy="{y*10+5}" r="3" fill="#fbf7ef"/><text x="{x*10+9}" y="{y*10+7}" font-size="6" fill="#241d16">{name}</text>')
 svg.append('</svg>'); Path(f'{variant}.svg').write_text(''.join(svg))
Path('circulation.json').write_text(json.dumps(reports,indent=2))
assert all(all(v['reachable'].values()) for v in reports.values())
print(json.dumps(reports,indent=2))
