import hashlib
import json
from pathlib import Path
import subprocess

import numpy as np
import torch
from transformers import WhisperForConditionalGeneration, WhisperProcessor

MODEL = Path('/tmp/junyan-asr-models/models--openai--whisper-small/snapshots/973afd24965f72e36ca33b3055d56a652f456b4d')
ROOT = Path('/tmp/junyan-feedback-0060-source/output/0060-full-neutral')
content = json.loads((ROOT / 'content.json').read_text())
steps = [step for step in content['opening']['steps'] if step.get('who') == 'elder']
steps=[{'type':'say','line':line} for step in steps for line in [step['line']]+([step['wrong'],step['ok']] if step['type']=='request' else [])]
assert len(steps)==6
steps=[step for step in steps if step['line']['id']=='elder-egg-wrong']
print([s['line']['id'] for s in steps],flush=True)
torch.set_num_threads(2)
processor = WhisperProcessor.from_pretrained(MODEL, local_files_only=True)
model = WhisperForConditionalGeneration.from_pretrained(MODEL, local_files_only=True, use_safetensors=True).to('cpu').eval()
results = []
for step in steps:
    english = step['type'] == 'say-en'
    path = ROOT / 'audio' / Path(step['audio'] if english else step['line']['audio']).name
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
    samples = np.frombuffer(raw, dtype=np.float32).copy()
    assert len(samples) and np.isfinite(samples).all()
    inputs = processor(samples, sampling_rate=16000, return_tensors='pt', return_attention_mask=True)
    with torch.inference_mode():
        ids = model.generate(input_features=inputs.input_features, attention_mask=inputs.attention_mask, language='english' if english else 'chinese', task='transcribe', do_sample=False, max_new_tokens=160)
    transcript = processor.batch_decode(ids, skip_special_tokens=True)[0].strip()
    assert transcript
    result = {'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'expected': step['en'] if english else step['line']['text'], 'recognized': transcript}
    results.append(result)
    print(json.dumps(result, ensure_ascii=False), flush=True)
out = ROOT / 'asr-third-wrong-egg.json'
out.write_text(json.dumps({'model': 'openai/whisper-small', 'revision': MODEL.name, 'method': 'Local CPU transcription with language/task only; no expected script prompt; no audio uploaded. ASR is not a listening, naturalness or tone judgement.', 'clips': results}, ensure_ascii=False, indent=2) + '\n')
print(out, flush=True)
