"""Screen generated full lines with pinned local CPU Whisper. ASR is not listening approval."""
import argparse
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True

spec = importlib.util.spec_from_file_location('neighbourhood_audio', Path(__file__).with_name('neighbourhood-audio.py'))
local = importlib.util.module_from_spec(spec)
spec.loader.exec_module(local)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--model', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--feature', choices=local.FEATURES, action='append')
args = parser.parse_args()
if args.model.name != '973afd24965f72e36ca33b3055d56a652f456b4d':
    parser.error('Use the pinned openai/whisper-small revision')
import numpy as np
import torch
from transformers import WhisperForConditionalGeneration, WhisperProcessor

torch.set_num_threads(2)
processor = WhisperProcessor.from_pretrained(args.model, local_files_only=True)
model = WhisperForConditionalGeneration.from_pretrained(args.model, local_files_only=True, use_safetensors=True).to('cpu').eval()
config = local.audio.read_json(local.ROOT / 'src/content/voices.json')
results = []
for feature in args.feature or local.FEATURES:
    for job in local.jobs_for(feature, config):
        path = local.ROOT / 'public/audio' / job['filename']
        if job['kind'] != 'line' or not path.exists():
            continue
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
        samples = np.frombuffer(raw, dtype=np.float32).copy()
        inputs = processor(samples, sampling_rate=16000, return_tensors='pt', return_attention_mask=True)
        with torch.inference_mode():
            ids = model.generate(input_features=inputs.input_features, attention_mask=inputs.attention_mask, language='chinese', task='transcribe', do_sample=False, max_new_tokens=160)
        transcript = processor.batch_decode(ids, skip_special_tokens=True)[0].strip()
        result = {'filename': job['filename'], 'sha256': local.audio.digest(path.read_bytes()), 'expected': job['text'], 'recognized': transcript}
        results.append(result)
        print(json.dumps(result, ensure_ascii=False), flush=True)
        local.audio.write_json(args.output, {'model': 'openai/whisper-small', 'revision': args.model.name,
            'method': 'Local CPU ASR. Language and task only. No expected-text prompt and no audio upload. Not a listening, tone or naturalness judgement.', 'clips': results})
