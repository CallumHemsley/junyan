"""Rebuild the authored segmented apartment corpus; no speech assets are synthesized here."""
import json
from pathlib import Path
root=Path(__file__).parent
canonical={}
def visit(value):
    if isinstance(value,dict):
        if all(k in value for k in ('id','hanzi','pinyin','gloss','audio')): canonical.setdefault(value['hanzi'],value)
        for v in value.values(): visit(v)
    elif isinstance(value,list):
        for v in value: visit(v)
visit(json.loads((root/'../../content/content.json').read_text()))
entries=[
('table','桌子','zhuō zi','table'),('chair','椅子','yǐ zi','chair'),('window','窗户','chuāng hu','window'),('beside','旁边','páng biān','beside'),('left','左边','zuǒ biān','left side'),('right','右边','yòu biān','right side'),('small','小','xiǎo','small'),('large','大','dà','large'),('blue','蓝色','lán sè','blue'),('cream','米色','mǐ sè','cream colour'),('put','放','fàng','put'),('turn','转','zhuǎn','rotate'),('store','收起来','shōu qǐ lái','put away'),('can','可以','kě yǐ','can; okay'),('here','这里','zhè lǐ','here'),('at','在','zài','at'),('also','也','yě','also'),('this','这个','zhè ge','this one'),('too','太','tài','too'),('le','了','le','change of state particle'),('once','一下','yí xià','a little; once'),('thus','这样','zhè yàng','like this'),('and','和','hé','and'),('give','给','gěi','give'),('you','你','nǐ','you'),('bed','床','chuáng','bed'),('rug','地毯','dì tǎn','rug'),('cushion','靠垫','kào diàn','cushion'),('stool','凳子','dèng zi','stool'),('plant','盆栽','pén zāi','potted plant'),('cat','猫','māo','cat'),('vase','花瓶','huā píng','vase'),('basket','篮子','lán zi','basket'),('lamp','灯','dēng','lamp'),('home','家','jiā','home'),('lin','林姐','Lín jiě','Sister Lin'),('door','门','mén','door'),('find','找到','zhǎo dào','find'),('one','一个','yí ge','one'),('not','不','bù','not'),('first','先','xiān','first'),('change','换','huàn','change'),('look','看看','kàn kan','have a look')]
words={key:canonical.get(hanzi,dict(id='apartment.'+key,hanzi=hanzi,pinyin=pinyin,gloss=gloss,audio='/audio/apartment/word-'+key+'.wav')) for key,hanzi,pinyin,gloss in entries}
authored={
'welcome':('table and chair give you','table chair give you'),
'window':('','table put at window beside'),
'left':('','chair put at left'),
'right':('','put at right also can'),
'large':('','this too large le'),
'rotate':('','turn once'),
'okay':('','thus can'),
'blocked':('','here first not put'),
'stored':('','first store'),
'gift':('','this give you'),
'colour':('','change one cushion'),
}
authored['welcome']=('', 'table and chair give you')
lines=[]
for key,(_,tokens) in authored.items():
    seq=[words[t] for t in tokens.split()]
    lines.append(dict(id='apartment.'+key,tokens=seq,audio='/audio/apartment/line-'+key+'.wav',text=''.join(w['hanzi'] for w in seq)+'。'))
(root/'content.json').write_text(json.dumps(dict(words=list(words.values()),lines=lines),ensure_ascii=False,indent=2)+'\n')
