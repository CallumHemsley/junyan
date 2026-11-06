import json
from pathlib import Path

rect=lambda x,y,w,h:dict(x=x,y=y,width=w,height=h)
point=lambda x,y:dict(x=x,y=y)
palette={'cream':[239,224,191],'jade':[111,154,134],'ink':[48,43,42],'wood':[133,103,72],'brass':[190,157,97],'slate':[91,114,119],'plaster':[201,187,157],'road':[132,139,133],'paving':[191,185,160],'leaf':[104,137,99],'shadow':[62,81,76],'water':[119,151,157]}
m=dict(version=1,id='town',bounds=dict(width=80,height=64),defaultSpawn=dict(x=34,y=32,facing='south'),walkable=[],colliders=[],occluders=[],entrances=[],exits=[],anchors=[],terrain=[],props=[],palette=palette,npcHooks=[],landmarks=[])

def surface(name,x,y,w,h,material,variant='worn'):
 r=rect(x,y,w,h); m['walkable'].append(r); m['terrain'].append(dict(id='town.'+name,rect=r,material=material,variant=variant))

def prop(name,kind,x,y,w=1,h=1,variant='default',solid=False,tall=0,layer='object'):
 m['props'].append(dict(id='town.'+name,kind=kind,position=point(x,y),width=w,height=h,layer=layer,variant=variant))
 if solid: m['colliders'].append(dict(id='town.'+name,rect=rect(x,y,w,h)))
 if tall: m['occluders'].append(dict(id='town.'+name,rect=rect(x,y,w,h),height=tall,fadeWhenPlayerBehind=True))

def landmark(name,x,y,kind): m['landmarks'].append(dict(id='town.'+name,position=point(x,y),kind=kind))

# Width changes and offset intersections give different streets different rhythms.
for args in [('breakfast-paving',0,29,80,8,'paving'),('breakfast-road',0,31,80,4,'road'),('west-lane',19,8,7,24,'paving'),('north-lane',21,8,43,6,'brick'),('east-lane',59,11,7,45,'paving'),('south-lane',23,49,42,7,'brick'),('south-west',23,35,6,18,'paving'),('lantern-passage',40,12,5,18,'brick'),('courtyard-approach',42,0,6,14,'brick'),('residence-landing',10,21,12,4,'paving'),('market-pocket',28,37,12,8,'brick'),('market-link',37,36,9,4,'brick'),('service-lane',43,36,6,17,'paving'),('river-path',64,44,16,7,'paving'),('tree-junction',17,27,11,13,'paving'),('tea-terrace',49,14,9,5,'brick'),('restaurant-landing',32.5,28,3,2,'paving')]: surface(*args)

buildings=[('residence','building-residence',4,10,13,11,'old-jade',8),('restaurant','building-restaurant',28,18,11,10,'breakfast',5.5),('tea-house','building-tea',49,19,9,10,'timber',6),('workshop','building-workshop',67,18,11,11,'sawtooth',5),('corner-store','building-shop',67,5,10,10,'blue-shutter',6),('north-row','building-row',27,2,12,6,'ochre',7),('linen-house','building-row',50,2,8,6,'jade',7.5),('west-store','building-shutter',5,25.5,12,3,'slate',3.7),('south-residence','building-residence',7,38,13,12,'warm-plaster',8.5),('market-house','building-shop',29,45,10,4,'olive-shutter',5),('south-bakery','building-shop',30,56,10,6,'timber-shutter',6),('south-studio','building-row',49,56,9,6,'plaster',7),('pump-house','building-utility',52,38,6,9,'slate',3.4),('bookshop','building-shop',68,52,10,8,'cream-shutter',6.3),('river-store','building-shutter',69,37,9,6,'jade',4)]
for name,kind,x,y,w,h,var,z in buildings:
 prop(name,kind,x,y,w,h,var,True,z)

# Real doors have clear landings. Other facades receive visibly closed shutters.
for name,target,r,arrival,facing,kind in [('restaurant','restaurant',rect(33,28,2,1.2),(34,30.4),'south','door'),('residence','residential-hall',rect(10.5,21,2,1.2),(11.5,23.5),'south','door'),('courtyard','courtyard',rect(43,0,4,1.6),(45,3.3),'south','path'),('workshop','workshop',rect(72,29,2.5,1.1),(73.25,31.4),'south','door'),('park','park',rect(0,30,1.6,6),(3.4,33),'east','path'),('riverbank','riverbank',rect(78.4,44.5,1.6,6),(76.6,47.5),'west','path')]:
 m['entrances'].append(dict(id='from-'+target,position=point(*arrival),facing=facing))
 m['exits'].append(dict(id='to-'+target,rect=r,targetMapId=target,targetEntranceId='from-town',kind=kind))
 landmark(name+'-approach',*arrival,kind)

for name,x,y,w,h,var in [('restaurant-steps',32.5,28,3,1,'wide'),('residence-steps',10,21,3,1,'stone'),('workshop-landing',71.5,29,3.5,1,'loading'),('river-stairs',74,44.4,4,2,'river')]:prop(name,'steps',x,y,w,h,var,layer='ground')
prop('courtyard-moon-gate','gate',42,2,6,.35,'moon',False,4)
prop('breakfast-awning','awning',28,27.3,11,.7,'stripe-jade',False,3)
prop('tea-awning','awning',49,28.4,9,.6,'ochre',False,3)
prop('workshop-canopy','awning',67,28.2,11,.8,'slate',False,3)

# Edge planting is authored around routes, with interruptions for the real entrances.
trees=[('junction',18,28.2,1.5,1.5),('park-sentinel',3,37.5,2,2),('courtyard-left',37.8,3,2,2),('courtyard-right',49,12.5,1.5,1.5),('east-lane',65.6,39.5,1.5,1.5),('river-view',73.5,41,2,2),('south-fig',20.3,56.8,2,2),('tea-garden',55.2,15.6,1.8,1.8),('west-shade',15.5,6,2,2),('market-tree',38.2,41.8,1.2,1.2),('east-corner',77,15.2,1.8,1.8),('south-grove',59.4,60,2,2)]
for i,(name,x,y,w,h) in enumerate(trees):prop(name,'tree',x,y,w,h,['camphor','ginkgo','willow'][i%3],True,5.5)
for i,(x,y,w,h) in enumerate([(1,6,15,1.3),(1,7,1.2,16),(27,15,1,12),(49,15,4,1),(66.5,15.5,12,1),(1,51,18,1),(21,58,1.2,5),(41,58,6,1),(66.5,60.5,12,1.5),(77.5,36.5,1.2,7),(66.5,51.5,1,10),(1,40,1.5,9)]):prop('hedge-'+str(i),'hedge',x,y,w,h,'mixed',True,1)
for i,(x,y,w,h) in enumerate([(1,9,2,14),(3,8,14,.35),(27,14,11,.3),(49,14,3,.35),(56,14,2,.35),(66.5,16,12,.25),(1,53,19,.3),(21,57,7,.3),(40,62,7,.3),(66.5,62,12,.3)]):prop('fence-'+str(i),'fence',x,y,w,h,'wood' if i%2 else 'iron',True,1.2)

for i,(x,y,var) in enumerate([(27,28.4,'herbs'),(39.8,27,'flowers'),(48.2,27.2,'broadleaf'),(58.3,28.2,'herbs'),(66.2,28.2,'broadleaf'),(77.5,28.8,'herbs'),(14.5,21.5,'flowers'),(39.2,46.5,'broadleaf'),(29.2,55.8,'herbs'),(67,53,'flowers')]):prop('planter-'+str(i),'planter',x,y,.65,.65,var,True,1.2)
for i,(x,y,var) in enumerate([(28.3,29.1,'jade'),(47.8,39.5,'ochre'),(20.2,16,'steel'),(64.6,53,'jade')]):prop('bike-'+str(i),'bicycle',x,y,1.8,.6,var,True,1.5)
for i,(x,y,w,h) in enumerate([(20.2,28,2.2,.6),(31,43.8,2.7,.6),(68.5,50.3,2.8,.6),(56.3,49.3,2,.6)]):prop('bench-'+str(i),'bench',x,y,w,h,'wood',True,1.2)
for i,(x,y) in enumerate([(18,26.5),(26.7,36.4),(58.1,35.9),(65.9,13.5),(41.2,47.7),(5,30),(75.8,50)]):prop('lamp-'+str(i),'street-lamp',x,y,.35,.35,'brass',True,4.5)
for i,(x,y,w,h) in enumerate([(30,30.5,2,.25),(50,30.4,1.8,.25),(68,30.5,2,.25),(25.8,18,.25,2),(62,48.7,2,.25),(43.5,43,.25,1.5)]):prop('drain-'+str(i),'drain',x,y,w,h,'iron',layer='ground')
for i,(x,y,w,h) in enumerate([(2,35.8,14,.18),(28,35.8,28,.18),(66,35.8,12,.18),(25.8,15,.18,11),(64.7,17,.18,24)]):prop('gutter-'+str(i),'gutter',x,y,w,h,'moss',layer='ground')
for i,(x,y) in enumerate([(19,30),(26,30),(59,30),(65.5,30),(19,36),(26,36),(59,36),(65.5,36)]):prop('bollard-'+str(i),'bollard',x,y,.3,.3,'stone',True,.7)
for i,(x,y,w,h) in enumerate([(67.3,29.2,2.2,.9),(75,29.1,2,.9),(48.3,38,1,.9),(39.4,37.7,1,.8)]):prop('crates-'+str(i),'crates',x,y,w,h,'workshop' if i<2 else 'market',True,1.2)
prop('market-stall','market-stall',29,38.2,3.2,1.4,'vegetables',True,2.2)
prop('market-baskets','baskets',34,43,2,.7,'bamboo',True,.7)
prop('residence-laundry','laundry',4.8,18.8,10.8,.2,'cream-jade',False,4)
prop('south-laundry','laundry',7.8,47.5,10.5,.2,'blue-ochre',False,4)
prop('alley-laundry','laundry',39.5,17,5.7,.2,'cream-jade',False,4)
prop('north-utility','utility-pole',24.8,7,.3,.3,'crossbar',True,6)
prop('south-utility','utility-pole',61.8,57,.3,.3,'crossbar',True,6)
prop('pump-pipes','pipes',58.1,39,.35,4,'steel',True,2)
prop('closed-yard-gate','closed-gate',69.2,43.2,8.6,.3,'locked',True,1.8)
prop('park-milestone','milestone',2.6,28.8,.6,.6,'stone',True,.8)
prop('river-rail-left','fence',71,43.3,7,.25,'iron',True,1.2)
prop('tea-stone-table','stone-table',50,16.5,1.7,1.2,'stone',True,1.1)

for name,x,y,kind in [('breakfast-steam',34,29.5,'restaurant-frontage'),('camphor-junction',22,29,'tree-junction'),('laundry-lane',22.5,18,'residential-lane'),('lantern-cut',42.5,21,'narrow-lane'),('moon-gate',45,5,'moon-gate'),('market-pocket',34,41,'market'),('sawtooth-roof',72,30.5,'workshop-frontage'),('river-overlook',72,47,'river-approach'),('south-fig',24,53,'garden-lane'),('closed-yard',72,45.2,'closed-yard')]:landmark(name,x,y,kind)
for name,x,y,interaction in [('junction-rest',22,29.2,'rest'),('market-baskets',34,41,'observe-market'),('river-view',72,47,'look-river'),('laundry-lane',22.5,19,'observe-laundry'),('tea-terrace',54,15,'rest')]:
 m['anchors'].append(dict(id='town.'+name,position=point(x,y),radius=1.4,featureId='exploration',interactionId='town.'+interaction))
for name,actor,route in [('morning-walk','aunt',[(34,30),(42.5,30),(42.5,14),(45,10)]),('market-regular','glasses',[(31,41),(36,41),(38,40),(31,40)]),('workshop-delivery','backpack',[(70,33),(62,33),(62,47),(70,47)])]:
 m['npcHooks'].append(dict(id='town.'+name,position=point(*route[0]),route=[point(*p) for p in route],characterId=actor))
variants = list(dict.fromkeys(item['variant'] for item in m['props'] + m['terrain']))
Path(__file__).parents[2].joinpath('art/town/variants.json').write_text(json.dumps(variants, indent=2)+'\n')
for item in m['props'] + m['terrain']: item['variant'] = variants.index(item['variant'])
Path(__file__).with_name('map.json').write_text(json.dumps(m,indent=2)+'\n')
print({k:len(v) for k,v in m.items() if isinstance(v,list)})
