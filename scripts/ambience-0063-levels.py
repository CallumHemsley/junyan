"""Measure decoded level windows, not subjective sound quality. Requires ffmpeg."""
from array import array
from pathlib import Path
import argparse
import json
import math
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
parser.add_argument('--label', required=True)
args = parser.parse_args()
asset = Path('public/audio/ambience/breakfast.mp3')
rate = 24000
pcm = subprocess.check_output(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(asset),
                               '-f', 'f32le', '-ac', '1', '-ar', str(rate), 'pipe:1'])
samples = array('f')
samples.frombytes(pcm)
def db(value):
    return round(20 * math.log10(max(value, 1e-12)), 2)
def rms(values):
    return math.sqrt(sum(v * v for v in values) / len(values))
def measure(start, end):
    part = samples[round(start * rate):round(end * rate)]
    window = rate // 20  # 50 ms: stable short-event energy, not a single sample peak.
    highest = max(rms(part[i:i + window]) for i in range(0, len(part) - window + 1, rate // 100))
    raw = rms(part)
    return {'window_seconds': [start, end], 'raw_rms_dbfs': db(raw),
            'raw_peak_dbfs': db(max(abs(v) for v in part)), 'strongest_50ms_rms_dbfs': db(highest),
            'default_rms_dbfs': db(raw * .35 * .45),
            'default_ducked_rms_dbfs': db(raw * .35 * .12),
            'maximum_rms_dbfs': db(raw * .45), 'maximum_ducked_rms_dbfs': db(raw * .12),
            'default_margin_below_speech_reference_db': round(-20 - db(raw * .35 * .45), 2)}
result = {
 'label': args.label, 'asset': str(asset), 'bytes': asset.stat().st_size,
 'duration_seconds': len(samples) / rate, 'speech_reference_active_rms_dbfs': -20,
 'limits': 'Decoded RMS/peak windows are objective audibility/headroom evidence only. Device level, masking, perceptual realism, loop seamlessness and enjoyment require listening. Speech reference is the established active-RMS comparison supplied by root, not a claim that all clips share an identical perceptual loudness.',
 'gains': {'default': .1575, 'default_ducked': .042, 'maximum': .45, 'maximum_ducked': .12},
 'whole_mix': measure(0, len(samples) / rate),
 'regions': {
  'quiet_room': measure(.5, 2.5),
  'cup_contact': measure(3.1, 3.2),
  'cup_pair_with_decay': measure(3.1, 3.97),
  'pour_body': measure(8, 9.5),
  'preparation_body': measure(12.7, 13.9),
  'later_pour_body': measure(34, 36),
 },
 'decoded_clipped_samples': sum(abs(v) >= 1 for v in samples),
}
Path(args.output).write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'label': args.label, 'whole': result['whole_mix'], 'regions': result['regions']}, indent=2))
