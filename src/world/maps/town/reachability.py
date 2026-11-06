import json,math
from collections import deque
from pathlib import Path
m=json.loads(Path(__file__).with_name('map.json').read_text())
radius=.3
step=.5

def inside(p,r):return r['x']<=p[0]<=r['x']+r['width'] and r['y']<=p[1]<=r['y']+r['height']
def stand(p):
 if any(not any(inside((p[0]+math.cos(a)*radius,p[1]+math.sin(a)*radius),r) for r in m['walkable']) for a in [i*math.pi/8 for i in range(16)]):return False
 for c in m['colliders']:
  r=c['rect'];nx=max(r['x'],min(p[0],r['x']+r['width']));ny=max(r['y'],min(p[1],r['y']+r['height']))
  if math.hypot(p[0]-nx,p[1]-ny)<radius:return False
 return True

def k(p):return round(p[0]/step),round(p[1]/step)
def pos(k):return k[0]*step,k[1]*step
start=k((m['defaultSpawn']['x'],m['defaultSpawn']['y']));distance={start:0};q=deque([start])
while q:
 p=q.popleft()
 for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]:
  nxt=p[0]+dx,p[1]+dy
  if nxt not in distance and stand(pos(nxt)):
   distance[nxt]=distance[p]+step;q.append(nxt)

def reach(p):
 assert stand(p),f'blocked approach {p}'
 near=[distance[k] for k in distance if math.dist(pos(k),p)<.76]
 assert near,f'unreachable {p}'
 return min(near)
proof={}
for item in m['entrances']+m['anchors']+m['landmarks']:
 p=(item['position']['x'],item['position']['y']);proof[item['id']]=reach(p)
for e in m['exits']:
 r=e['rect'];p=r['x']+r['width']/2,r['y']+r['height']/2;proof[e['id']]=reach(p)
for hook in m['npcHooks']:
 for a,b in zip(hook['route'],hook['route'][1:]):
  length=math.hypot(b['x']-a['x'],b['y']-a['y'])
  for i in range(math.ceil(length/step)+1):
   t=min(1,i*step/max(length,step));p=a['x']+(b['x']-a['x'])*t,a['y']+(b['y']-a['y'])*t
   assert stand(p),f"NPC route blocked {hook['id']} {p}"
for e in m['entrances']:
 assert not any(inside((e['position']['x'],e['position']['y']),x['rect']) for x in m['exits']),f"arrival bounce {e['id']}"
print(json.dumps(dict(sampleSpacing=step,playerRadius=radius,reachableSampledArea=len(distance)*step*step,distancesFromRestaurant=proof),indent=2))
