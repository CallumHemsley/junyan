"""Build a standalone, provider-blind listening page from completed local manifests.

Usage: python3 scripts/voice-samples/make-review-pack.py output/voice-samples/kokoro/manifest.json
Pass all completed model manifests together to make a combined audition.
"""
import argparse
import base64
import csv
import hashlib
import html
import json
from pathlib import Path
import struct
import wave
import zipfile

ROOT = Path(__file__).resolve().parents[2]


def read_clips(manifest_paths, lines):
    variants = {}
    for manifest_path in manifest_paths:
        manifest = json.loads(manifest_path.read_text())
        if manifest.get('complete') is not True:
            raise ValueError(f'Incomplete generation: {manifest_path}')
        for clip in manifest['clips']:
            line_id, voice = clip['line_id'], clip['voice']
            if line_id not in lines or clip['text'] != lines[line_id]['text']:
                raise ValueError('Audio transcript does not match shared corpus')
            path = (manifest_path.parent / clip['filename']).resolve()
            if path.parent != manifest_path.parent.resolve():
                raise ValueError('Audio must be beside its manifest')
            data = path.read_bytes()
            if hashlib.sha256(data).hexdigest() != clip['sha256']:
                raise ValueError(f'Audio hash mismatch: {path.name}')
            with wave.open(str(path), 'rb') as wav:
                if (wav.getnchannels(), wav.getsampwidth(), wav.getframerate()) != (1, 2, 24000):
                    raise ValueError('Expected mono PCM16 WAV at 24 kHz')
                samples = struct.unpack('<' + str(wav.getnframes()) + 'h', wav.readframes(wav.getnframes()))
                if not samples or max(map(abs, samples)) < 4 or max(map(abs, samples)) >= 32767:
                    raise ValueError('Empty, silent or clipped WAV')
            key = (manifest['model_id'], voice)
            group = variants.setdefault(key, {'manifest': str(manifest_path), 'clips': {}})
            if line_id in group['clips']:
                raise ValueError('Duplicate voice/line combination')
            group['clips'][line_id] = data
    for group in variants.values():
        if set(group['clips']) != set(lines):
            raise ValueError('Every voice must cover the full corpus')
    return variants


CSS = '''body{margin:0;background:#f7f3e9;color:#292c27;font:17px/1.6 system-ui,sans-serif}main{max-width:850px;margin:auto;padding:24px}h1{line-height:1.2}section{padding:20px;margin:20px 0;background:white;border:1px solid #d4d5c9;border-radius:12px}h2{margin:0 0 12px;font-size:25px}.variant{border-top:1px solid #eee;padding:14px 0}audio{width:100%;display:block;margin:10px 0}label{display:inline-block;margin:6px 16px 6px 0}select,input,textarea,button{font:inherit;min-height:44px;padding:6px;border:1px solid #999;border-radius:5px;box-sizing:border-box}textarea{width:100%;min-height:65px}button{cursor:pointer;background:#e1e9d9;color:#202a1d;padding:10px 18px}.quiet{color:#595f55;font-size:14px}.sticky{position:sticky;bottom:0;background:#f7f3e9;padding:14px 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap}input{max-width:100%}:focus-visible{outline:3px solid #627a49;outline-offset:3px}@media(max-width:500px){main{padding:14px}section{padding:14px}}'''
JS = r'''
const storeKey='junyan-audition-'+document.body.dataset.pack;
const fields=[...document.querySelectorAll('[data-score]')];
let saved={};try{saved=JSON.parse(localStorage.getItem(storeKey)||'{}')}catch{}
for(const field of fields){if(Object.hasOwn(saved,field.id))field.value=saved[field.id];field.addEventListener('input',()=>{saved[field.id]=field.value;try{localStorage.setItem(storeKey,JSON.stringify(saved));document.querySelector('#status').textContent='评分已保存在本机。'}catch{document.querySelector('#status').textContent='请下载评分；浏览器无法保存。'}})}
for(const audio of document.querySelectorAll('audio'))audio.addEventListener('play',()=>{for(const other of document.querySelectorAll('audio'))if(other!==audio)other.pause()});
function csvCell(value){let text=String(value??'');if(/^[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'}
document.querySelector('#export').addEventListener('click',()=>{
const rows=[['reviewer','line_id','text','variant','naturalness_1_to_5','pronunciation_1_to_5','wrong_or_missing_words','notes']];
for(const item of document.querySelectorAll('.variant')){const get=s=>document.getElementById(item.dataset.key+'-'+s).value;rows.push([document.querySelector('#reviewer').value,item.dataset.line,item.dataset.text,item.dataset.variant,get('natural'),get('pronunciation'),get('words'),get('notes')])}
const blob=new Blob(['\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='junyan-voice-review.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
'''


def build(manifest_paths, output):
    corpus = json.loads((ROOT / 'scripts/voice-samples/lines.json').read_text())
    lines = {line['id']: line for line in corpus['lines']}
    assert list(lines) == [f'T{i:02}' for i in range(1, 21)]
    variants = read_clips(manifest_paths, lines)
    # Stable opaque voice labels. Model and voice identifiers stay in a separate organizer key.
    order = sorted(variants, key=lambda key: hashlib.sha256('|'.join(key).encode()).hexdigest())
    labels = {key: chr(65 + i) for i, key in enumerate(order)}
    pack_id = hashlib.sha256(json.dumps([(key, hashlib.sha256(variants[key]['clips']['T01']).hexdigest()) for key in order]).encode()).hexdigest()[:16]
    sections = []
    for index, (line_id, line) in enumerate(lines.items()):
        cards = []
        # Rotate playback order to avoid always hearing A first.
        rotated = order[index % len(order):] + order[:index % len(order)]
        for key in rotated:
            label = labels[key]
            field_key = f'{line_id}-{label}'
            source = base64.b64encode(variants[key]['clips'][line_id]).decode()
            options = '<option value="">未评分</option>' + ''.join(f'<option>{n}</option>' for n in range(1, 6))
            cards.append(f'''<div class="variant" data-key="{field_key}" data-line="{line_id}" data-text="{html.escape(line['text'], quote=True)}" data-variant="{label}"><strong>声音 {label}</strong><audio controls preload="none" aria-label="{line_id} 声音 {label}" src="data:audio/wav;base64,{source}"></audio><label>自然度 <select data-score id="{field_key}-natural">{options}</select></label><label>发音准确度 <select data-score id="{field_key}-pronunciation">{options}</select></label><label for="{field_key}-words">错读、漏读或多读的字词</label><input data-score id="{field_key}-words" style="width:100%"><label for="{field_key}-notes">备注（声调、轻声、停顿、人物感觉）</label><textarea data-score id="{field_key}-notes"></textarea></div>''')
        sections.append(f'<section><h2>{line_id} · {html.escape(line["text"])}</h2>'+''.join(cards)+'</section>')
    output.mkdir(parents=True, exist_ok=True)
    page = f'''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>君言 · 普通话声音试听</title><style>{CSS}</style><body data-pack="{pack_id}"><main><h1>君言 · 普通话声音试听</h1><p>请按屏幕上的文字听录音。每种声音都读相同的二十句话。先独立评分，再讨论。</p><p>评分：1＝很差，5＝很好。发音准确度包括多音字、声调、变调和轻声；自然度包括节奏、停顿和语气。请记录错读、漏读或多读的字。</p><p class="quiet">这些是本机生成的 AI 合成语音，尚未经母语者审核。页面无需联网，不上传录音或评分。声音标签不透露模型或预设。请勿在评分前查看单独的答案表。</p><label>评审姓名或代号 <input data-score id="reviewer" autocomplete="off"></label>{''.join(sections)}<div class="sticky"><button id="export">下载评分 CSV</button><span id="status" role="status">评分会尝试保存在本机；完成后请下载 CSV。</span></div></main><script>{JS}</script></body></html>'''
    (output / 'listen.html').write_text(page)
    with (output / 'review-sheet.csv').open('w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['reviewer','line_id','text','variant','naturalness_1_to_5','pronunciation_1_to_5','wrong_or_missing_words','notes'])
        for line_id, line in lines.items():
            for key in order:
                writer.writerow(['', line_id, line['text'], labels[key], '', '', '', ''])
    answer = {labels[key]: {'model':key[0], 'voice':key[1], 'manifest':variants[key]['manifest']} for key in order}
    (output / 'organizer-key.json').write_text(json.dumps(answer, ensure_ascii=False, indent=2)+'\n')
    (output / 'README.txt').write_text('Open listen.html in a browser. It contains all audio and works offline. Send listen.html to reviewers; keep organizer-key.json separate until scores are submitted. Export the CSV to return scores. No native pronunciation approval is implied.\n')
    with zipfile.ZipFile(output / 'reviewer-pack.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for name in ['listen.html', 'review-sheet.csv', 'README.txt']:
            archive.write(output / name, name)
    assert page.count('<audio ') == len(lines) * len(order)
    assert all(key[0] not in page and key[1] not in page for key in order)
    assert 'organizer-key.json' not in zipfile.ZipFile(output / 'reviewer-pack.zip').namelist()
    print(json.dumps({'voices':len(order),'clips':len(lines)*len(order),'html':str(output/'listen.html'),'zip':str(output/'reviewer-pack.zip')},indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifests', nargs='+', type=Path)
    parser.add_argument('--output', type=Path, default=ROOT/'output/voice-samples/review')
    args=parser.parse_args()
    build(args.manifests,args.output)
