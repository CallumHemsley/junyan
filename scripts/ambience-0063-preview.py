"""Render a human-review A/B/C file from committed assets; never plays audio."""
from array import array
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile
import wave

RATE = 24000
SECTION = 14
content = json.loads(Path('src/content/content.json').read_text())
order = next(order for order in content['orders'] if order['level'] == 1)
speech_path = Path('public') / order['line']['audio'].lstrip('/')
ambience_path = Path('public/audio/ambience/breakfast.mp3')
def decode(path):
    pcm = subprocess.check_output(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(path),
                                  '-f', 'f32le', '-ac', '1', '-ar', str(RATE), 'pipe:1'])
    result = array('f')
    result.frombytes(pcm)
    return result
speech = decode(speech_path)
ambience = decode(ambience_path)
starts = [4, 9]
sections = [('speech-only', 0, 0), ('default-level-0.35', .1575, .042), ('maximum-level-1', .45, .12)]
out = array('f')
for label, base, duck in sections:
    bed = array('f', (sample * base for sample in ambience[:SECTION * RATE]))
    for start in starts:
        offset = start * RATE
        for i, value in enumerate(speech[:len(bed) - offset]):
            bed[offset + i] = ambience[offset + i] * duck + value
    out.extend(bed)
peak = max(abs(v) for v in out)
if peak >= 1:
    raise ValueError(f'Comparison would clip at {peak}; do not normalize the speech invisibly')
target = Path('docs/evidence/0063/listening-comparison.mp3')
with tempfile.TemporaryDirectory() as tmp:
    source = str(Path(tmp) / 'comparison.wav')
    with wave.open(source, 'wb') as wav:
        wav.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        wav.writeframes(array('h', (round(v * 32767) for v in out)).tobytes())
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', source,
                    '-c:a', 'libmp3lame', '-b:a', '96k', str(target)], check=True)
metadata = {
 'kind': 'Offline deterministic A/B/C render for human listening; NOT a browser recording or claimed listening result.',
 'file': str(target), 'duration_seconds': len(out) / RATE,
 'speech_source': str(speech_path), 'speech_sha256': hashlib.sha256(speech_path.read_bytes()).hexdigest(),
 'ambience_source': str(ambience_path), 'ambience_sha256': hashlib.sha256(ambience_path.read_bytes()).hexdigest(),
 'speech_starts_within_each_section_seconds': starts,
 'sections': [{'label': label, 'from_seconds': i * SECTION, 'to_seconds': (i + 1) * SECTION,
               'bed_gain': base, 'bed_gain_during_speech': duck}
              for i, (label, base, duck) in enumerate(sections)],
 'limits': 'Same actual committed restaurant line repeated without level alteration; ambience uses actual controller gains only while the line plays. Device volume, actual game timing/interactions, browser output, spectral realism, user preference and enjoyment remain unverified. Existing speech retains its existing source terms; the comparison is not labelled CC0 as a whole.',
}
target.with_suffix('.json').write_text(json.dumps(metadata, indent=2) + '\n')
print(json.dumps(metadata, indent=2))
