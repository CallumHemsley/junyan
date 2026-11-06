"""Rebuild the authored landscape payloads. No runtime randomness."""
import json, math
from pathlib import Path
ROOT = Path(__file__).parent
PALETTE = dict(cream=[245,232,202],jade=[111,154,134],ink=[48,43,42],wood=[115,86,58],brass=[190,157,97],grass=[134,157,98],moss=[86,123,96],water=[99,154,163],sand=[211,195,151],stone=[137,151,143],leaf=[88,132,102],flower=[229,204,135])
def rect(x,y,w,h): return dict(x=x,y=y,width=w,height=h)
def point(x,y): return dict(x=x,y=y)
def base(id,w,h):
 return dict(version=1,id=id,bounds=dict(width=w,height=h),defaultSpawn=dict(x=7,y=h-7,facing='north'),walkable=[rect(1,1,w-2,h-2)],colliders=[],occluders=[],entrances=[],exits=[],anchors=[],terrain=[],props=[],palette=PALETTE,npcHooks=[],landmarks=[])
def terrain(m,id,r,material,variant=0):
 x=max(0,r['x']);y=max(0,r['y']);right=min(m['bounds']['width'],r['x']+r['width']);bottom=min(m['bounds']['height'],r['y']+r['height'])
 m['terrain'].append(dict(id=m['id']+'.'+id,rect=rect(x,y,right-x,bottom-y),material=material,variant=variant))
def prop(m,id,kind,x,y,w=1,h=1,variant=0,solid=False):
 id=m['id']+'.'+id
 m['props'].append(dict(id=id,kind=kind,position=point(x,y),width=w,height=h,layer='object',variant=variant))
 if solid:
  trunk=.8 if kind=='mature-tree' else .55 if kind in ['tree','willow'] else 1 if kind=='bamboo' else None
  m['colliders'].append(dict(id=id,rect=rect(x-trunk/2,y-trunk/2,trunk,trunk) if trunk else rect(x-w*.24,y-h*.24,w*.48,h*.48)))
 if kind in ['tree','willow','bamboo','mature-tree']: m['occluders'].append(dict(id=id,rect=rect(x-w*.5,y-h*.5,w,h),height=7.2 if kind=='mature-tree' else 4.5 if kind=='bamboo' else 3.5,fadeWhenPlayerBehind=True))
def path(m,id,points,width=3,material='path'):
 for k,(a,b) in enumerate(zip(points,points[1:])):
  assert a[0]==b[0] or a[1]==b[1]
  terrain(m,f'{id}-{k}',rect(min(a[0],b[0])-width/2,min(a[1],b[1])-width/2,abs(a[0]-b[0])+width,abs(a[1]-b[1])+width),material)
def edge(m,target,x,y,ex,ey,w,h,facing):
 m['entrances'].append(dict(id='from-'+target,position=point(x,y),facing=facing))
 m['exits'].append(dict(id='to-'+target,rect=rect(ex,ey,w,h),targetMapId=target,targetEntranceId='from-'+m['id'],kind='path'))
def landmark(m,id,x,y,kind):
 m['landmarks'].append(dict(id=m['id']+'.'+id,position=point(x,y),kind=kind))
 m['anchors'].append(dict(id=m['id']+'.'+id,position=point(x,y),radius=1.4,featureId='exploration',interactionId='landscape.'+id))
def carve(m,cut):
 result=[]
 for c in m['colliders']:
  r=c['rect']; x=max(r['x'],cut['x']); y=max(r['y'],cut['y']); right=min(r['x']+r['width'],cut['x']+cut['width']); bottom=min(r['y']+r['height'],cut['y']+cut['height'])
  if x>=right or y>=bottom: result.append(c); continue
  for k,piece in enumerate([rect(r['x'],r['y'],r['width'],y-r['y']),rect(r['x'],bottom,r['width'],r['y']+r['height']-bottom),rect(r['x'],y,x-r['x'],bottom-y),rect(right,y,r['x']+r['width']-right,bottom-y)]):
   if piece['width']>0 and piece['height']>0: result.append(dict(id=c['id']+f'-cut-{k}',rect=piece))
 m['colliders']=result

def carve_water(m,cut):
 water={'colliders':[dict(id=t['id'],rect=t['rect']) for t in m['terrain'] if t['material']=='water']}
 carve(water,cut)
 m['terrain']=[t for t in m['terrain'] if t['material']!='water']+[dict(id=t['id'],rect=t['rect'],material='water',variant=0) for t in water['colliders']]

def inside(p,r,margin=0): return r['x']-margin<=p[0]<=r['x']+r['width']+margin and r['y']-margin<=p[1]<=r['y']+r['height']+margin

park=base('park',84,68)
terrain(park,'meadow',rect(0,0,84,68),'grass')
# A stepped pond silhouette leaves real dry approaches, not a giant water rectangle.
for step in range(34):
 y=24+step*.5
 half=11.5*math.sqrt(max(0,1-((y+.25-32.5)/8.5)**2))
 left=round((51.5-half)*4)/4;right=round((51.5+half)*4)/4
 r=rect(left,y,max(.5,right-left),.5)
 terrain(park,f'pond-shore-{step}',rect(left-.7,y,r['width']+1.4,.5),'sand')
 terrain(park,f'pond-{step}',r,'water')
 park['colliders'].append(dict(id=f'park.pond-{step}',rect=r))
path(park,'town-walk',[(7,67),(7,56),(25,56),(25,44),(34,44),(34,18),(54,18),(54,10),(82,10)],2.6)
path(park,'courtyard-walk',[(1,29),(18,29),(18,18),(34,18)],2.2,'stone-path')
path(park,'pond-loop',[(34,44),(65,44),(65,18),(54,18)],2.5)
path(park,'orchard-loop',[(7,56),(7,41),(18,41),(18,29)],2.2)
path(park,'picking-spur',[(16,56),(16,52)],1.6)
path(park,'bamboo-walk',[(18,18),(18,8),(40,8),(40,18)],2)
path(park,'ridge-climb',[(65,18),(74,18),(74,29),(80,29)],2.2,'stone-path')
path(park,'pond-deck',[(65,33),(61,33)],2.4,'boardwalk')
path(park,'reading-nook',[(34,28),(31,28)],2.5,'stone-path')
edge(park,'town',7,63,5,66,4,1,'north')
edge(park,'courtyard',5,29,1,27,1,4,'east')
edge(park,'riverbank',78,10,82,8,1,4,'west')
for args in [('orchard-basket',16,52,'fruit-basket'),('bamboo-court',29,8,'bamboo-court'),('old-reading-stone',31,28,'reading-stone'),('pond-deck',61,33,'pond-deck'),('ridge-view',79,29,'ridge-view'),('tea-pavilion',54,18,'tea-pavilion'),('lily-cove',47,43,'lily-cove')]: landmark(park,*args)
prop(park,'tea-pavilion','pavilion',53,14,7,5,solid=True)
prop(park,'reading-bench','bench',29,26,3,1,solid=True)
prop(park,'reading-stone','rock',31,26,2.2,1.5,3,True)
prop(park,'planting-bed','seedling-bed',24.5,57.2,3,2,solid=True)
prop(park,'empty-picking-crates','crates',9,63,2,1.5,solid=True)
prop(park,'arrival-cultivated-soil','harvest-floor',10,61,5,4)
park['props'][-1]['layer']='ground'
prop(park,'orchard-soil','harvest-floor',16,52,13,10)
park['props'][-1]['layer']='ground'
prop(park,'orchard-cart','cart',16,50,2,2,solid=True)
prop(park,'ridge-rock','rock',78,25,4,3,2,True)
prop(park,'ridge-steps','steps',74,24,3,4)
prop(park,'pond-bench','bench',62,30,3,1,solid=True)
for x,y in [(43,28),(57,38),(41,35),(54,25),(60,30)]: prop(park,f'reeds-{x}-{y}','reeds',x,y,2,1)
for x,y in [(48,30),(54,33),(47,36),(58,29)]: prop(park,f'lily-{x}-{y}','lilies',x,y,1,1)

river=base('riverbank',96,80)
terrain(river,'river-meadow',rect(0,0,96,80),'grass')
# Authored one-tile water strips keep the banks irregular and align visual/collision edges.
for step in range(160):
 y=step/2 if step%2 else step//2
 x=43+round((4*math.sin(y*.1)+2*math.sin(y*.24))*4)/4
 terrain(river,f'river-shore-{y}',rect(x-.75,y,10.5,.5),'sand')
 terrain(river,f'river-{y}',rect(x,y,9,.5),'water')
 river['colliders'].append(dict(id=f'riverbank.water-{y}',rect=rect(x,y,9,.5)))
path(river,'west-bank',[(6,79),(6,69),(31,69),(31,39),(35,39),(35,19),(20,19),(20,10),(1,10)],2.6)
path(river,'east-bank',[(35,19),(72,19),(72,43),(80,43),(80,57),(31,57)],2.5)
path(river,'shore-walk',[(61,19),(61,28),(56,28),(56,43),(62,43),(62,57)],2)
path(river,'bird-hide',[(56,43),(51,43)],1.8)
path(river,'high-loop',[(72,19),(72,7),(88,7),(88,30),(72,30)],2.2)
path(river,'low-loop',[(80,57),(80,71),(62,71),(62,57)],2.2)
path(river,'fishing-jetty',[(35,39),(40,39)],2.4,'boardwalk')
path(river,'reed-hide',[(31,57),(22,57),(22,48)],2,'boardwalk')
path(river,'laundry',[(31,69),(31,74),(40,74)],2.2,'stone-path')
# Bridges overlay the water, with shore-to-shore walkable widths and matching clearance.
terrain(river,'moon-bridge',rect(34,17.6,27,2.8),'bridge')
terrain(river,'low-footbridge',rect(30,55.6,31,2.8),'bridge')
river['defaultSpawn']=dict(x=40,y=75,facing='north')
path(river,'town-arrival',[(40,79),(40,74),(31,74)],2.2,'stone-path')
path(river,'park-arrival',[(42,10),(35,10),(35,19)],2.2)
edge(river,'town',40,75,38.5,78,3,1,'north')
edge(river,'park',42,10,40.5,6.5,3,1,'south')
path(river,'park-return',[(42,6.5),(42,10)],2.2)
for args in [('moon-bridge',48,19,'moon-bridge'),('reed-hide',22,48,'reed-hide'),('fishing-jetty',40,39,'fishing-jetty'),('washing-stones',40,74,'washing-stones'),('old-ferry',62,57,'old-ferry'),('hill-shrine',88,7,'hill-shrine'),('heron-shallows',51,43,'river-view'),('lower-crossing',45,57,'footbridge')]: landmark(river,*args)
prop(river,'hill-shrine','shrine',87,4,4,3,solid=True)
prop(river,'ferry-boat','boat',57.8,60.7,5,2,1,True)
prop(river,'ferry-post','mooring',60.5,60.5,1,1,solid=True)
path(river,'ferry-landing',[(62,57),(62,61.5)],2,'stone-path')
prop(river,'ferry-rope','tied-rope',59.5,60.6,2,1)
prop(river,'ferry-worn-stones','worn-stones',63.3,59.7,2,2)
prop(river,'arrival-reed-pocket','reeds',43.8,72,2,2)
prop(river,'arrival-willow','willow',35.5,77,5.5,5.5,1,True)
prop(river,'fisher-stool','stool',38,37,1,1,solid=True)
prop(river,'washing-rack','laundry',35,71,5,1,solid=True)
prop(river,'reed-screen','reeds',19,48,3,3,solid=True)
prop(river,'picnic','picnic',84,47,4,3,solid=True)
prop(river,'shore-watch-bench','bench',51,45.6,3,1,solid=True)
prop(river,'shore-watch-reeds','reeds',49.2,42,2,2)
for y in [5,13,27,34,45,64,71]:
 x=43+round(4*math.sin(y*.1)+2*math.sin(y*.24))
 prop(river,f'bank-reeds-{y}','reeds',x-1.5,y,2,2)
 prop(river,f'bank-rock-{y}','rock',x+10.5,y,2,2,y%4,True)
park['npcHooks']=[
 dict(id='park.resident-reader',position=point(29,26.9),route=[point(29,26.9),point(54,18.5)],characterId='resident-reader'),
 dict(id='park.resident-groundskeeper',position=point(16,52),route=[point(16,52),point(23,56.4)],characterId='resident-groundskeeper'),
]
river['npcHooks']=[dict(id='riverbank.resident-river-walker',position=point(23.6,48.6),route=[point(23.6,48.6),point(38.5,39.4)],characterId='resident-river-walker')]
carve(park,rect(59.8,31.8,6.4,2.4))
carve(river,rect(33.8,37.8,7.4,2.4))
carve(river,rect(34,17.6,27,2.8))
carve(river,rect(30,55.6,31,2.8))
# Water effects use visible water surfaces; decks mask the water beneath them.
carve_water(park,rect(59.8,31.8,6.4,2.4))
carve_water(river,rect(33.8,37.8,7.4,2.4))
carve_water(river,rect(34,17.6,27,2.8))
carve_water(river,rect(30,55.6,31,2.8))
def protected(m,x,y):
 return any(inside((x,y),t['rect'],.65) for t in m['terrain'] if t['material'] in ['path','stone-path','boardwalk','bridge','water']) or any(math.hypot(x-a['position']['x'],y-a['position']['y'])<2.2 for a in m['landmarks']+m['entrances'])

def grove(m,name,cx,cy,variant=0):
 # Each grove has a mature centre, asymmetrical younger understorey and a rooted floor.
 prop(m,name+'-floor','woodland-floor',cx,cy,11,9,variant)
 m['props'][-1]['layer']='ground'
 for i,(dx,dy,size) in enumerate([(0,0,7),(-2.9,.8,4.1),(1.7,-2.3,4.5),(3.1,1.8,3.7),(-1.3,3.4,3.9)]):
  x=cx+dx;y=cy+dy
  if protected(m,x,y) or any(inside((x,y),c['rect'],.6) for c in m['colliders']):continue
  prop(m,name+f'-tree-{i}','mature-tree' if i==0 else 'tree',x,y,size,size,(variant+i)%4,True)
 for i,(dx,dy) in enumerate([(-3.5,-1.7),(2.2,3.9),(-.8,2.1),(4,-.7)]):
  if not protected(m,cx+dx,cy+dy):prop(m,name+f'-fern-{i}','fern',cx+dx,cy+dy,1.5,1.5,i%3)

for name,x,y,v in [('bamboo-gate',8,13,3),('north-canopy',28,4,0),('old-camphor',43,5,0),('ridge-copse',69,6,3),('reading-grove',28,23,2),('pond-west',36,34,0),('pond-east',70,34,1),('south-woods',43,57,0),('south-east',69,57,1),('ridge-edge',79,19,3),('pavilion-oak',47,22,0),('pond-reveal',61,25,1)]:grove(park,name,x,y,v)
# A working fruit grove: irregular old trunks around an open harvest/rest pocket.
for i,(x,y,size) in enumerate([(9,60,3.7),(11,48,5.4),(13.5,43.7,6.5),(22.5,48,5.8),(24,52.5,4.6),(19.8,61.7,6.1),(13,63.5,4.4)]):
 prop(park,f'working-fruit-{i}','tree',x,y,size,size,2,True)
for i,(x,y) in enumerate([(10.5,49.5),(12,61.5),(22,50),(21,62.5)]):prop(park,f'fruit-understory-{i}','fern',x,y,1.5,1.5,i%3)
for name,x,y,v in [('bridge-west',35,13,0),('wetland-grove',23,30,0),('reed-woods',21,43,3),('wash-grove',23,63,2),('town-grove',10,71,1),('river-north',65,9,0),('ridge-north',85,16,3),('river-east',64,34,0),('high-woods',87,31,1),('ferry-copse',69,65,2),('south-copse',88,70,0),('heron-copse',87,49,3),('bridge-reveal',58,25,0)]:grove(river,name,x,y,v)
for m,centres in [(park,[(8,7),(12,20),(27,12)]),(river,[(21,52),(60,28)])]:
 for cluster,(cx,cy) in enumerate(centres):
  for i,(dx,dy) in enumerate([(0,0),(.8,.3),(-.6,.8),(1.4,1.1)]):
   if not protected(m,cx+dx,cy+dy):prop(m,f'bamboo-clump-{cluster}-{i}','bamboo',cx+dx,cy+dy,2,2,i,True)
for m,centres in [(park,[(39,28),(66,38),(58,23)]),(river,[(37,32),(59,24),(28,61)])]:
 for i,(x,y) in enumerate(centres):
  if not protected(m,x,y):prop(m,f'bank-willow-{i}','willow',x,y,5.5,5.5,i,True)
for m,centres in [(park,[(26,43),(30,11),(56,15),(66,24),(52,45),(12,54)]),(river,[(28,21),(65,22),(77,46),(60,70),(23,46)])]:
 for cluster,(cx,cy) in enumerate(centres):
  for i,(dx,dy) in enumerate([(0,0),(.6,.3),(-.5,.8),(1.3,.5),(-1,-.4),(.1,1.5)]):
   if not protected(m,cx+dx,cy+dy):prop(m,f'flower-clump-{cluster}-{i}','flowers',cx+dx,cy+dy,1,1,i%3)
for m in [park,river]:
 m['terrain'].sort(key=lambda t: 1 if t['material']=='sand' else 2 if t['material']=='water' else 3 if t['material'] in ['path','stone-path','bridge','boardwalk'] else 0)
 ROOT.joinpath(m['id']+'.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
