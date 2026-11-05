import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
existing={}
def walk(v):
 if isinstance(v,dict):
  if {'id','hanzi','pinyin','gloss','audio'} <= v.keys():existing[v['hanzi']]=v
  for item in v.values():walk(item)
 elif isinstance(v,list):
  for item in v:walk(item)
walk(json.loads((root/'src/content/content.json').read_text()))
entries=[
('wood','木头','mùtou','wood'),('metal','金属','jīnshǔ','metal'),('lamp','台灯','táidēng','table lamp'),('bulb','灯泡','dēngpào','light bulb'),('toy','玩具','wánjù','toy'),('battery','电池','diànchí','battery'),('wire','线','xiàn','wire'),('cover','盖子','gàizi','cover'),
('tighten','拧紧','nǐngjǐn','tighten'),('loosen','转松','zhuǎnsōng','turn to loosen'),('connect','接上','jiēshàng','connect'),('disconnect','拔下','báxià','disconnect'),('replace','换','huàn','replace'),('open','打开','dǎkāi','open'),('close','盖上','gàishàng','close the cover'),('off','关掉','guāndiào','switch off'),('return','放回','fànghuí','put back'),('reset','重新来','chóngxīn lái','start again'),('practice','再修一次','zài xiū yí cì','repair again'),('workshop','修理间','xiūlǐjiān','workshop'),
('can','能','néng','can'),('light','亮','liàng','light up'),('but','但是','dànshì','but'),('always','一直','yìzhí','continuously'),('flicker','闪','shǎn','flicker'),('this','这个','zhège','this'),('move','动','dòng','move'),('first','先','xiān','first'),('steady','稳','wěn','steady'),('now','现在','xiànzài','now'),('tight','紧','jǐn','tight'),('loose','松','sōng','loose'),('still','还是','háishi','still'),('not-yet','还没','hái méi','not yet'),('on','上','shàng','on'),('old','旧','jiù','old'),('new','新','xīn','new'),('together','一起','yìqǐ','together'),('sit','坐','zuò','sit'),('stool','凳子','dèngzi','stool'),('take','拿','ná','take'),('you','你','nǐ','you'),('hear','再听','zài tīng','listen again'),('done','修好','xiūhǎo','repair successfully'),('good','好','hǎo','good'),('le','了','le','completed action'),('no','不','bù','not'),('again','再','zài','again'),('try','试试','shìshi','try'),('all','都','dōu','both'),('give','给','gěi','give')]
words=[]
for ident,h,p,g in entries:
 words.append(existing[h] if h in existing else {'id':'repairs.'+ident,'hanzi':h,'pinyin':p,'gloss':g,'audio':'/audio/repairs/word-'+ident+'.wav'})
by={w['hanzi']:w for w in words}
specs=[
('lamp-intro','lamp','能亮，但是一直闪。',['能','亮','但是','一直','闪']),
('lamp-unstable','lamp','还是不稳。',['还是','不','稳']),
('lamp-steady','lamp','好了，现在亮得稳了。',['好','了','现在','亮','稳','了']),
('power-first','lamp','先关掉。',['先','关掉']),
('lamp-tight','lamp','灯泡拧紧了。再试试。',['灯泡','拧紧','了','再','试试']),
('lamp-loose','lamp','灯泡松了。',['灯泡','松','了']),
('toy-intro','toy','这个玩具不动了。',['这个','玩具','不','动','了']),
('toy-open','toy','打开了。',['打开','了']),
('toy-closed','toy','盖上了。试试。',['盖上','了','试试']),
('toy-connect','toy','线接上了。',['线','接上','了']),
('toy-disconnect','toy','线拔下了。',['线','拔下','了']),
('toy-cell','toy','换上新电池了。',['换','上','新','电池','了']),
('toy-old-cell','toy','旧电池放回了。',['旧','电池','放回','了']),
('toy-still','toy','还是不动。再打开看看。',['还是','不','动','再','打开']),
('toy-moving','toy','好了，动了。',['好','了','动','了']),
('open-first','toy','先打开盖子。',['先','打开','盖子']),
('close-first','toy','先盖上，再试试。',['先','盖上','再','试试']),
('lamp-returned','lamp','台灯修好了。',['台灯','修好','了']),
('toy-returned','toy','玩具修好了。',['玩具','修好','了']),
('lamp-off','lamp','关掉了。',['关掉','了']),
('all-complete','lamp','都修好了。这个木头凳子给你。',['都','修好','了','这个','木头','凳子','给','你'])]
specs[2]=('lamp-steady','lamp','好了，现在亮了。',['好','了','现在','亮','了'])
specs[7]=('toy-open','toy','打开了。',['打开','了'])
specs[13]=('toy-still','toy','还是不动。再打开。',['还是','不','动','再','打开'])
chars=[]
for job,name,voice in [('lamp','林姐','serena'),('toy','小周','xiaobei')]:
 lines=[{'id':'repairs.'+i,'text':text,'tokens':[by[h] for h in hs],'audio':'/audio/repairs/line-'+i+'.wav'} for i,j,text,hs in specs if j==job]
 chars.append({'id':job,'name':name,'voiceId':voice,'lines':lines})
data={'words':words,'characters':chars}
(root/'src/features/repairs/content.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
manifest={'status':'blocked-pending-synthesis','reason':'Linux cloud lacks MLX/Qwen and Kokoro runtime/models. No substitutions authorized.','wordVoice':'serena','words':[w for w in words if w['id'].startswith('repairs.')],'speakers':[{'name':c['name'],'voiceId':c['voiceId'],'lines':c['lines']} for c in chars]}
(root/'evidence/0069/pending-audio.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(len(words),'words;',sum(len(c['lines']) for c in chars),'lines;',len(manifest['words']),'new word clips')
