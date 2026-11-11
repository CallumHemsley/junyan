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

# A lilong (弄堂) quarter. Rows of shikumen houses face south onto narrow brick lanes and back onto the
# next lane north; shops line the breakfast road; lanes are 3-5 tiles, alleys 2-3. Grass is left only as
# the park edge (west), the canal bank (east), the back verges (north and south) and a few beds.
# Every walkable rect is a lane, alley, court or pavement; buildings fill the blocks between them.
for args in [
 # The breakfast road and its pavements.
 ('breakfast-paving',0,29,80,8,'paving'),('breakfast-road',0,31,80,4,'road'),
 # North of the road.
 ('west-lane',18,7,5,22,'paving'),('north-lane',17,7,45,4,'brick'),('back-lane',3,7,15,3,'brick'),
 ('kitchen-alley',23,16,20,2,'brick'),('lantern-passage',39,11,4,18,'brick'),('courtyard-approach',42,0,6,14,'brick'),
 ('lantern-alley',43,20,6,2,'brick'),('tea-terrace',49,11,9,8,'brick'),('east-lane',58,7,4,22,'paving'),
 ('east-nook',62,7,5,2,'brick'),('corner-alley',58,14,22,4,'paving'),('residence-landing',4,21,14,4.5,'paving'),
 ('tree-junction',17,27,11,13,'paving'),('store-front',4,28,13,1,'paving'),('restaurant-front',28,28,11,1,'paving'),('restaurant-landing',32.5,28,3,2,'paving'),
 # South of the road.
 ('south-west',20,37,3.5,12,'paving'),('market-pocket',28.5,37,11.5,8,'brick'),('service-lane',39,37,4,12.5,'paving'),
 ('service-yard',43,37,9,4,'paving'),('pump-apron',52,47,6,2,'paving'),('east-lane-south',58,37,4.5,12,'paving'),('river-path',60,44,20,7,'paving'),
 ('south-lane',1,49,63.5,4,'brick'),('fig-court',19,53,6,9.5,'paving'),('grove-court',45,53,4,6,'brick'),
 ('back-street',1,59,63.5,3.5,'paving'),('south-pavement',7,37,73,1,'paving'),
]: surface(*args)

m['terrain'].append(dict(id='town.junction-inset',rect=rect(17.7,27.7,10.3,3.5),material='brick',variant='inset'))

# Fixed: the restaurant, the residence and the workshop (their doors are exits), and the shops and houses
# the art draws by id. New rows take the row-house sprite at their own width; widths and depths vary so
# neighbours never repeat.
buildings=[('residence','building-residence',4,10,13,11,'old-jade',8),('restaurant','building-restaurant',28,18,11,10,'breakfast',5.5),('tea-house','building-tea',49,19,9,10,'timber',6),('workshop','building-workshop',67,18,11,11,'sawtooth',5),('corner-store','building-shop',67,4,10,10,'blue-shutter',6),('north-row','building-row',27,2,12,6,'ochre',7),('linen-house','building-row',48,2,8,6,'jade',7.5),('west-store','building-shutter',5,25.5,12,3,'cream-shutter',5.2),('south-residence','building-residence',7,37.5,13,12,'warm-plaster',8.5),('market-house','building-shop',29,45,10,4,'olive-shutter',5),('south-bakery','building-shop',30,53,10,6,'timber-shutter',6),('south-studio','building-row',49,53,9,6,'plaster',7),('pump-house','building-utility',52,38,6,9,'slate',3.4),('bookshop','building-shop',68,52,10,8,'olive-shutter',6.3),('river-store','building-shutter',69,37,9,6,'jade',4),
 # North edge: rows facing the back lane and the north lane.
 ('back-row-west','building-row',1.5,0.5,8,6.5,'cinder',7),('back-row-east','building-row',9.5,0.5,6.5,6.5,'rose-brick',7),('hot-water-house','building-utility',16,2,3.5,5,'boiler',4.5),('well-row','building-row',19.5,2,7.5,5,'soot',7),('ne-row','building-row',56,1.5,6,6.5,'grey-brick',7),('nook-row','building-row',62,1,5,6,'lime',7),
 # Behind the restaurant: two rows facing the kitchen alley, a shop on the junction.
 ('kitchen-row-west','building-row',23,11,7.5,5,'smoke',6.5),('kitchen-row-east','building-row',30.5,11.5,8.5,4.5,'clay',6.5),('junction-shop','building-tea',23,18,5,9,'red-lacquer',6),
 # Between the lantern passage and the tea house.
 ('lantern-row','building-row',43,14,6,6,'ash',7),('lantern-shop','building-shutter',43,22,6,7,'green-shutter',5.5),
 # East: a row on the corner alley, a shop on the road.
 ('alley-row','building-shutter',62,9.5,5,4.5,'lockup',5),('east-shop','building-shop',62,18,5,11,'brown-lacquer',6),
 # South of the road.
 ('market-row','building-row',23.5,40,5.5,9,'tile-red',7),('service-row','building-row',43,40,9,9,'pale-brick',7),('canal-row','building-row',62.5,37.5,6.5,6.5,'river-grey',7),
 ('fig-house','building-residence',1,53,13.5,6,'ochre-wash',8),('fig-shop','building-shop',14.5,53.5,4.5,5.5,'teal-lacquer',5.5),('bakery-row','building-row',25,53,5,6,'umber',7),('grove-row','building-row',40,53.5,5,5.5,'sand',7),('canal-end-row','building-workshop',58,53,6,6,'moss-brick',5),
]
for name,kind,x,y,w,h,var,z in buildings:
 prop(name,kind,x,y,w,h,var,True,z)

# Real doors have clear landings. Other facades receive visibly closed shutters.
for name,target,r,arrival,facing,kind in [('restaurant','restaurant',rect(33,28,2,1.2),(34,30.4),'south','door'),('residence','residential-hall',rect(10.5,21,2,1.2),(11.5,23.5),'south','door'),('courtyard','courtyard',rect(43,0,4,1.6),(45,3.3),'south','path'),('workshop','workshop',rect(72,29,2.5,1.1),(73.25,31.4),'south','door'),('park','park',rect(0,30,1.6,6),(3.4,33),'east','path'),('riverbank','riverbank',rect(78.4,44.5,1.6,6),(76.6,47.5),'west','path')]:
 m['entrances'].append(dict(id='from-'+target,position=point(*arrival),facing=facing))
 exit=dict(id='to-'+target,rect=r,targetMapId=target,targetEntranceId='from-town',kind=kind)
 if name == 'residence': exit['cueWordId']='apartment.home'
 m['exits'].append(exit)
 landmark(name+'-approach',*arrival,kind)

for name,x,y,w,h,var in [('restaurant-steps',32.5,28,3,1,'wide'),('residence-steps',10,21,3,1,'stone'),('workshop-landing',71.5,29,3.5,1,'loading'),('river-stairs',74,44.4,4,2,'river')]:prop(name,'steps',x,y,w,h,var,layer='ground')
# Only real portals get an open leaf and a threshold mat. Closed shops keep shutters.
# The open leaf stands folded against the left jamb, just outside the doorway (the exit rect), never in it.
for name,x,y,variant in [('restaurant',33,28,'woven-jade'),('residence',10.5,21,'home-stone'),('workshop',72.25,29,'workshop-slats')]:
 prop(name+'-mat','threshold-mat',x+.15,y+.9,1.7,1.05,variant,layer='ground')
 prop(name+'-open-leaf','open-door-leaf',{'restaurant':33,'residence':10.5,'workshop':72}[name]-.22,y+.28,.18,.7,variant,True,2.5)
prop('gateway-threshold','threshold-mat',43.15,6.2,3.7,.6,'gate-stone',layer='ground')
prop('book-delivery-ledge','delivery-ledge',6.7,28.65,1.2,.2,'wrapped-books',True,.9)
prop('junction-rest-bag','rest-bag',20.8,28.2,.5,.3,'folded-cloth',False,1.2)
prop('courtyard-moon-gate','gate',42,6.5,6,.35,'moon',False,4)
m['colliders'] += [dict(id='town.gate-left',rect=rect(42,6.5,1.1,.35)),dict(id='town.gate-right',rect=rect(46.9,6.5,1.1,.35))]
prop('breakfast-awning','awning',28,27.3,11,.7,'stripe-jade',False,3)
prop('tea-awning','awning',49,28.4,9,.6,'ochre',False,3)
prop('workshop-canopy','awning',67,28.2,11,.8,'slate',False,3)

# Trees stand in lanes, pockets and courts where their crowns have room, never across a route.
trees=[('junction',18,28.2,1.5,1.5),('park-sentinel',3,37.5,2,2),('courtyard-left',39.8,5,2,2),('courtyard-right',49,12.5,1.5,1.5),('east-lane',60.4,51.2,1.5,1.5),('river-view',72.2,48.9,1.8,1.8),('south-fig',20.3,56.8,2,2),('tea-garden',55.2,15.6,1.8,1.8),('west-shade',18.2,12.4,2,2),('market-tree',38.2,41.8,1.2,1.2),('east-corner',59.5,40.4,1.8,1.8),('south-grove',46,56.2,2,2)]
for i,(name,x,y,w,h) in enumerate(trees):prop(name,'tree',x,y,w,h,['camphor','ginkgo','willow'][i%3],True,5.5)
# Hedges and fences keep to the green edges: the park side, the top and bottom verges, the canal bank.
for i,(x,y,w,h) in enumerate([(4.5,62.7,9.5,1.1),(1,10,1.2,13),(26,62.8,4,1),(49,11.4,3,1),(67.5,2.4,9.5,1),(1,62.7,3.2,1.1),(23.6,54,1,4.2),(41,62.8,7,1),(66.5,60.5,12,1.5),(78.3,37,1.2,6),(66.5,51.5,1,10),(1,40,1.5,9)]):prop('hedge-'+str(i),'hedge',x,y,w,h,'mixed',True,1)
for i,(x,y,w,h) in enumerate([(1,11,2,12),(3,7.1,.35,2.9),(27,0.8,12,.3),(49,11,3,.35),(56,11,2,.35),(67.5,3.5,9.5,.25),(1,63.5,13,.3),(15.5,63.5,9,.3),(31,63.5,9,.3),(66.5,62,12,.3)]):prop('fence-'+str(i),'fence',x,y,w,h,'wood' if i%2 else 'iron',True,1.2)

for i,(x,y,var) in enumerate([(27,28.4,'herbs'),(39.8,27,'flowers'),(43.3,29.15,'broadleaf'),(58.3,28.2,'herbs'),(66.2,29.15,'broadleaf'),(78.5,28.2,'herbs'),(14.5,21.5,'flowers'),(39.2,46.5,'broadleaf'),(38.9,59.2,'herbs'),(67,53,'flowers')]):prop('planter-'+str(i),'planter',x,y,.65,.65,var,True,1.2)
for i,(x,y,var) in enumerate([(28.3,29.1,'jade'),(45.4,38.3,'ochre'),(20.2,16,'steel'),(62.4,52.2,'jade')]):prop('bike-'+str(i),'bicycle',x,y,1.8,.6,var,True,1.5)
for i,(x,y,w,h) in enumerate([(20.2,28,2.2,.6),(31,43.8,2.7,.6),(68.5,50.3,2.8,.6),(56.3,49.3,2,.6)]):prop('bench-'+str(i),'bench',x,y,w,h,'wood',True,1.2)
for i,(x,y) in enumerate([(18,26.5),(26.7,36.4),(58.1,35.9),(61.5,12.6),(41.2,47.7),(5,30),(75.8,50)]):prop('lamp-'+str(i),'street-lamp',x,y,.35,.35,'brass',True,4.5)
for i,(x,y,w,h) in enumerate([(30,30.5,2,.25),(50,30.4,1.8,.25),(68,30.5,2,.25),(25.5,17.1,2,.25),(62,48.7,2,.25),(42.5,43,.25,1.5)]):prop('drain-'+str(i),'drain',x,y,w,h,'iron',layer='ground')
for i,(x,y,w,h) in enumerate([(2,35.8,14,.18),(28,35.8,28,.18),(66,35.8,12,.18),(22.75,11,.18,16),(61.75,8,.18,21)]):prop('gutter-'+str(i),'gutter',x,y,w,h,'moss',layer='ground')
for i,(x,y) in enumerate([(19,30),(26,30),(59,30),(65.5,30),(19,36),(26,36),(59,36),(65.5,36)]):prop('bollard-'+str(i),'bollard',x,y,.3,.3,'stone',True,.7)
for i,(x,y,w,h) in enumerate([(67.3,29.2,2.2,.9),(75,29.1,2,.9),(48.3,38,1,.9),(39.4,37.7,1,.8)]):prop('crates-'+str(i),'crates',x,y,w,h,'workshop' if i<2 else 'market',True,1.2)
prop('market-verge','flowerbed',40.2,40,1.6,4,'mixed',False,layer='ground')
prop('market-stall','market-stall',29,38.2,3.2,1.4,'vegetables',True,2.2)
prop('market-baskets','baskets',34,43,2,.7,'bamboo',True,.7)
prop('residence-laundry','laundry',4.8,21.35,10.8,.2,'cream-jade',False,4)
prop('south-laundry','laundry',7.8,49.85,10.5,.2,'blue-ochre',False,4)
prop('alley-laundry','laundry',39,23.6,4,.2,'cream-jade',False,4)
prop('north-utility','utility-pole',24.8,7,.3,.3,'crossbar',True,6)
prop('south-utility','utility-pole',63.9,59.7,.3,.3,'crossbar',True,6)
prop('pump-pipes','pipes',58.1,39,.35,4,'steel',True,2)
prop('closed-yard-gate','closed-gate',69.2,43.2,8.6,.3,'locked',True,1.8)
prop('park-milestone','milestone',2.6,28.8,.6,.6,'stone',True,.8)
prop('river-rail-left','fence',71,43.3,7,.25,'iron',True,1.2)
m['terrain'] += [dict(id='town.canal-water',rect=rect(65,51,2,13),material='water',variant='canal'),dict(id='town.canal-bank',rect=rect(64.5,51,.5,13),material='stone',variant='bank')]
prop('canal-rail','fence',64.3,51,.15,12.5,'iron',False,1.2)
prop('tea-stone-table','stone-table',50,16.5,1.7,1.2,'stone',True,1.1)

# Lane life that came with the dense layout: lamps down every lane, washing strung across the alleys,
# pot plants by the doors, bikes against the walls.
for name,x,y in [('back-lane',8.6,7.05),('north-lane',35,8.05),('lantern-passage',39.05,19.5),('corner-alley',70.5,14.05),('south-lane',21,49.1),('market-row',26,49.05),('back-street',27.5,59.05),('grove',44.6,59.1),('fig-court',19.1,59.1)]:prop('lamp-'+name,'street-lamp',x,y,.35,.35,'brass',True,4.5)
for name,x,y,w,var in [('back-lane-laundry',3.3,8.4,6,'blue-ochre'),('kitchen-laundry',24,16.9,5.5,'cream-jade'),('nook-laundry',62.3,8,4.4,'blue-ochre'),('back-street-laundry',2,60.1,5.6,'cream-jade'),('grove-laundry',45.2,58.1,3.6,'blue-ochre'),('south-lane-laundry',43.4,49.4,8.2,'cream-jade')]:prop(name,'laundry',x,y,w,.2,var,False,4)
for name,x,y,var in [('back-lane-pot',12.4,7.15,'flowers'),('well-pot',22.3,7.3,'herbs'),('kitchen-pot',33.6,16.15,'broadleaf'),('lantern-pot',48.2,20.15,'herbs'),('nook-pot',66.2,7.2,'flowers'),('market-row-pot',28.2,49.15,'herbs'),('fig-row-pot',18.2,59.15,'flowers'),('canal-end-pot',58.2,59.15,'broadleaf'),('canal-row-pot',68.2,44.15,'herbs')]:prop(name,'planter',x,y,.65,.65,var,True,1.2)
for name,x,y,var in [('north-lane-bike',30,8.1,'ochre'),('back-street-bike',50.5,59.15,'steel'),('south-lane-bike',36.5,49.15,'ochre'),('lantern-bike',41.1,25.6,'jade')]:prop(name,'bicycle',x,y,1.8,.6,var,True,1.5)
prop('fig-bench','bench',20.1,59.6,2.4,.6,'wood',True,1.2)
for name,x,y,w,h in [('yard-crates',50.6,37.3,1.2,.9),('alley-crates',29.6,16.2,1.4,.8),('nook-crates',77.4,15.1,1.6,.9)]:prop(name,'crates',x,y,w,h,'market',True,1.2)
for name,x,y,w,h in [('back-street-gutter',1,62.3,63.5,.18),('south-lane-gutter',1,52.8,13.5,.18)]:prop(name,'gutter',x,y,w,h,'moss',layer='ground')

for name,x,y,kind in [('book-window',10.5,30,'closed-bookshop-display'),('breakfast-steam',34,29.5,'restaurant-frontage'),('camphor-junction',22,29,'tree-junction'),('laundry-lane',19.7,22.5,'residential-lane'),('lantern-cut',42.5,21,'narrow-lane'),('moon-gate',45,9.5,'moon-gate'),('market-pocket',33,40.5,'market'),('sawtooth-roof',72,30.5,'workshop-frontage'),('river-overlook',67,49,'river-approach'),('south-fig',24,53,'garden-lane'),('closed-yard',72,45.2,'closed-yard')]:landmark(name,x,y,kind)
for name,x,y,interaction in [('book-window',10.5,30,'observe-window'),('junction-rest',22,29.2,'rest'),('market-baskets',34,41,'observe-market'),('river-view',67,49,'look-river'),('laundry-lane',22.5,19,'observe-laundry'),('tea-terrace',54,15,'rest')]:
 m['anchors'].append(dict(id='town.'+name,position=point(x,y),radius=1.4,featureId='exploration',interactionId='town.'+interaction))
for name,actor,route in [('market-tender','lin-jie',[(30.6,40.3)]),('canal-birds','bird',[(66.5,49.4),(65.3,50.3),(63,48.5)]),('park-birds','bird',[(7,35.5),(10,35.5),(12,35.5)]),('morning-walk','aunt',[(35.5,31.5),(42.5,31.5),(42.5,14),(45,10)]),('market-regular','zhang-laoshi',[(32,43.2)]),('workshop-delivery','xiao-zhou',[(70,33),(62,33),(62,47),(70,47)])]:
 m['npcHooks'].append(dict(id='town.'+name,position=point(*route[0]),route=[point(*p) for p in route],characterId=actor))
m['npcHooks'] = [hook for hook in m['npcHooks'] if hook['characterId'] != 'aunt']
m['npcHooks'].append(json.loads(Path(__file__).with_name('courier-hook.json').read_text()))

# Variant indices stay stable: names already listed keep their index (art seeds and fallbacks hang off
# them), new names append, and unused names are trimmed from the end only.
variants_path = Path(__file__).parents[2].joinpath('art/town/variants.json')
used = list(dict.fromkeys(item['variant'] for item in m['props'] + m['terrain']))
variants = json.loads(variants_path.read_text())
variants += [name for name in used if name not in variants]
while variants[-1] not in used: variants.pop()
variants_path.write_text(json.dumps(variants, indent=2)+'\n')
for item in m['props'] + m['terrain']: item['variant'] = variants.index(item['variant'])
Path(__file__).with_name('map.json').write_text(json.dumps(m,indent=2)+'\n')
print({k:len(v) for k,v in m.items() if isinstance(v,list)})
