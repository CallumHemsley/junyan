"""Rebuild the authored landscape payloads. No runtime randomness."""
import json, math
from pathlib import Path
ROOT = Path(__file__).parent
PALETTE = dict(cream=[245,232,202],jade=[111,154,134],ink=[48,43,42],wood=[115,86,58],brass=[190,157,97],grass=[134,157,98],moss=[86,123,96],water=[99,154,163],sand=[211,195,151],stone=[137,151,143],leaf=[88,132,102],flower=[229,204,135])
def rect(x,y,w,h): return dict(x=x,y=y,width=w,height=h)
def point(x,y): return dict(x=x,y=y)
def base(id,w,h):
 return dict(version=1,id=id,bounds=dict(width=w,height=h),defaultSpawn=dict(x=7,y=h-7,facing='north'),walkable=[rect(1,1,w-2,h-2)],colliders=[],occluders=[],entrances=[],exits=[],anchors=[],terrain=[],props=[],palette=PALETTE,npcHooks=[],landmarks=[])
def terrain(m,id,r,material,variant=0): m['terrain'].append(dict(id=m['id']+'.'+id,rect=r,material=material,variant=variant))
def prop(m,id,kind,x,y,w=1,h=1,variant=0,solid=False):
 id=m['id']+'.'+id
 m['props'].append(dict(id=id,kind=kind,position=point(x,y),width=w,height=h,layer='object',variant=variant))
 if solid: m['colliders'].append(dict(id=id,rect=rect(x-w*.24,y-h*.24,w*.48,h*.48)))
 if kind in ['tree','willow','bamboo']: m['occluders'].append(dict(id=id,rect=rect(x-w*.5,y-h*.5,w,h),height=3.5 if kind!='bamboo' else 4.5,fadeWhenPlayerBehind=True))
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
def inside(p,r,margin=0): return r['x']-margin<=p[0]<=r['x']+r['width']+margin and r['y']-margin<=p[1]<=r['y']+r['height']+margin

def scatter(m,kind,areas,step,w,h):
 # Small authored groves, with deterministic offset and gaps along routes.
 for cluster,(x0,y0,x1,y1) in enumerate(areas):
  for y in range(y0,y1,step):
   for x in range(x0,x1,step):
    n=(x*37+y*71+cluster*17)%97
    p=(x+(n%5)*.27,y+((n//5)%5)*.25)
    if any(inside(p,t['rect'],2.2) for t in m['terrain'] if t['material'] in ['path','stone-path','bridge','water','boardwalk']): continue
    if any(inside(p,c['rect'],1) for c in m['colliders']): continue
    prop(m,f'{kind}-{cluster}-{x}-{y}',kind,*p,w,h,n%4,True)

park=base('park',84,68)
terrain(park,'meadow',rect(0,0,84,68),'grass')
terrain(park,'woodland',rect(4,3,33,24),'moss')
terrain(park,'orchard',rect(4,39,31,25),'orchard-floor')
terrain(park,'ridge',rect(59,4,23,23),'ridge')
# A stepped pond silhouette leaves real dry approaches, not a giant water rectangle.
for i,r in enumerate([rect(45,24,12,2),rect(42,26,18,3),rect(40,29,23,7),rect(42,36,19,3),rect(46,39,12,2)]):
 terrain(park,f'pond-shore-{i}',rect(r['x']-1,r['y']-1,r['width']+2,r['height']+2),'sand')
 terrain(park,f'pond-{i}',r,'water')
 park['colliders'].append(dict(id=f'park.pond-{i}',rect=r))
path(park,'town-walk',[(7,67),(7,56),(25,56),(25,44),(34,44),(34,18),(54,18),(54,10),(82,10)],3.6)
path(park,'courtyard-walk',[(1,29),(18,29),(18,18),(34,18)],3.4,'stone-path')
path(park,'pond-loop',[(34,44),(65,44),(65,18),(54,18)],3.5)
path(park,'orchard-loop',[(7,56),(7,41),(18,41),(18,29)],3)
path(park,'bamboo-walk',[(18,18),(18,8),(40,8),(40,18)],2.8)
path(park,'ridge-climb',[(65,18),(74,18),(74,29),(80,29)],3,'stone-path')
path(park,'pond-deck',[(65,33),(61,33)],3,'boardwalk')
path(park,'reading-nook',[(34,28),(31,28)],2.5,'stone-path')
edge(park,'town',7,63,5,66,4,1,'north')
edge(park,'courtyard',5,29,1,27,1,4,'east')
edge(park,'riverbank',78,10,82,8,1,4,'west')
for args in [('orchard-basket',16,52,'fruit-basket'),('bamboo-court',29,8,'bamboo-court'),('old-reading-stone',31,28,'reading-stone'),('pond-deck',61,33,'pond-deck'),('ridge-view',79,29,'ridge-view'),('tea-pavilion',54,18,'tea-pavilion'),('lily-cove',47,43,'lily-cove')]: landmark(park,*args)
prop(park,'tea-pavilion','pavilion',53,14,7,5,solid=True)
prop(park,'reading-bench','bench',29,26,3,1,solid=True)
prop(park,'orchard-cart','cart',16,50,2,2,solid=True)
prop(park,'ridge-rock','rock',78,25,4,3,2,True)
prop(park,'ridge-steps','steps',74,24,3,4)
prop(park,'pond-bench','bench',62,30,3,1,solid=True)
for x,y in [(43,28),(57,38),(41,35),(54,25),(60,30)]: prop(park,f'reeds-{x}-{y}','reeds',x,y,2,1)
for x,y in [(48,30),(54,33),(47,36),(58,29)]: prop(park,f'lily-{x}-{y}','lilies',x,y,1,1)
scatter(park,'tree',[(4,4,15,23),(22,3,36,14),(3,37,31,64),(35,48,78,64)],5,3.5,3.5)
scatter(park,'bamboo',[(21,9,31,17),(4,7,13,21)],3,2,2)
scatter(park,'willow',[(38,22,42,39),(66,23,72,41)],5,4,4)
scatter(park,'rock',[(60,3,82,14),(76,18,82,34)],4,2.3,2)
scatter(park,'flowers',[(22,31,34,40),(39,47,65,59),(8,45,23,60)],4,1,1)

river=base('riverbank',96,80)
terrain(river,'river-meadow',rect(0,0,96,80),'grass')
terrain(river,'west-wetland',rect(17,27,20,46),'moss')
terrain(river,'east-wood',rect(61,4,32,35),'moss')
# Authored one-tile water strips keep the banks irregular and align visual/collision edges.
for y in range(80):
 x=43+round(4*math.sin(y*.1)+2*math.sin(y*.24))
 terrain(river,f'river-shore-{y}',rect(x-1,y,11,1),'sand')
 terrain(river,f'river-{y}',rect(x,y,9,1),'water')
 if not (17<=y<22 or 55<=y<60): river['colliders'].append(dict(id=f'riverbank.water-{y}',rect=rect(x,y,9,1)))
path(river,'west-bank',[(6,79),(6,69),(31,69),(31,39),(35,39),(35,19),(20,19),(20,10),(1,10)],3.7)
path(river,'east-bank',[(35,19),(72,19),(72,43),(80,43),(80,57),(31,57)],3.5)
path(river,'high-loop',[(72,19),(72,7),(88,7),(88,30),(72,30)],3)
path(river,'low-loop',[(80,57),(80,71),(62,71),(62,57)],3)
path(river,'fishing-jetty',[(35,39),(40,39)],3,'boardwalk')
path(river,'reed-hide',[(31,57),(22,57),(22,48)],2.8,'boardwalk')
path(river,'laundry',[(31,69),(31,74),(40,74)],3,'stone-path')
# Bridges overlay the water, with shore-to-shore walkable widths and matching clearance.
terrain(river,'moon-bridge',rect(34,17,27,5),'bridge')
terrain(river,'low-footbridge',rect(30,55,31,5),'bridge')
edge(river,'town',6,75,4,78,4,1,'north')
edge(river,'park',5,10,1,8,1,4,'east')
for args in [('moon-bridge',48,19,'moon-bridge'),('reed-hide',22,48,'reed-hide'),('fishing-jetty',40,39,'fishing-jetty'),('washing-stones',40,74,'washing-stones'),('old-ferry',62,57,'old-ferry'),('hill-shrine',88,7,'hill-shrine'),('heron-shallows',80,43,'heron-shallows'),('lower-crossing',45,57,'footbridge')]: landmark(river,*args)
prop(river,'hill-shrine','shrine',87,4,4,3,solid=True)
prop(river,'ferry-boat','boat',57,64,5,2,1,True)
prop(river,'ferry-post','mooring',62,61,1,1,solid=True)
prop(river,'fisher-stool','stool',38,37,1,1,solid=True)
prop(river,'washing-rack','laundry',37,77,5,1,solid=True)
prop(river,'reed-screen','reeds',19,48,3,3,solid=True)
prop(river,'picnic','picnic',84,47,4,3,solid=True)
for y in [5,13,27,34,45,64,71]:
 x=43+round(4*math.sin(y*.1)+2*math.sin(y*.24))
 prop(river,f'bank-reeds-{y}','reeds',x-1.5,y,2,2)
 prop(river,f'bank-rock-{y}','rock',x+10.5,y,2,2,y%4,True)
scatter(river,'willow',[(18,23,31,43),(18,60,29,73),(57,24,66,48)],5,4,4)
scatter(river,'tree',[(2,18,16,59),(62,3,94,38),(64,61,93,77)],5,3.8,3.8)
scatter(river,'rock',[(78,3,94,16),(84,25,94,36)],4,2.5,2.2)
scatter(river,'flowers',[(8,61,27,73),(64,35,74,53),(82,48,93,60)],4,1,1)
for m in [park,river]:
 ROOT.joinpath(m['id']+'.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
