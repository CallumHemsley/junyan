#!/usr/bin/env python3
"""Mux live browser audio with measured screenshot timing and verify the export."""
import array
import hashlib
import json
import math
import pathlib
import subprocess
import sys

root = pathlib.Path(sys.argv[1]).resolve()
capture = json.loads((root / 'capture.json').read_text())
frames = capture['frames']
assert len(frames) > 10, 'Need real captured frames'
assert not capture['errors'], capture['errors']
first = frames[0]['epochMs']
end = capture['stopEpochMs']
duration = (end - first) / 1000
concat = []
for index, frame in enumerate(frames):
    next_ms = frames[index + 1]['epochMs'] if index + 1 < len(frames) else end
    assert next_ms > frame['epochMs'], 'Frames must advance in time'
    concat += [f"file '{frame['file']}'", f"duration {(next_ms - frame['epochMs']) / 1000:.6f}"]
concat += [f"file '{frames[-1]['file']}'"]
(root / 'frames.txt').write_text('\n'.join(concat) + '\n')
offset = (first - capture['start']['epochMs']) / 1000
assert 0 <= offset < 2, f'Unexpected first-frame offset {offset}'
video = root / 'walkthrough.mp4'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(root / 'frames.txt'), '-i', str(root / 'browser-audio.webm'), '-filter_complex', f'[1:a]atrim=start={offset:.6f},asetpts=PTS-STARTPTS[a]', '-map', '0:v', '-map', '[a]', '-t', str(duration), '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(video)], check=True)
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)]))
(root / 'ffprobe.json').write_text(json.dumps(probe, indent=2) + '\n')
assert any(stream['codec_name'] == 'h264' for stream in probe['streams']), 'Missing H264 video'
assert any(stream['codec_name'] == 'aac' for stream in probe['streams']), 'Missing AAC audio'
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(video), '-map', '0:a', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'])
samples = array.array('f', raw)
rms = math.sqrt(sum(sample * sample for sample in samples) / len(samples))
peak = max(abs(sample) for sample in samples)
assert rms > .001 and peak > .01, f'Audio is silent/too quiet: RMS {rms}, peak {peak}'
plays = [event for event in capture['events'] if event['event'] == 'playing' and event['epochMs'] >= first]
assert plays, 'No actual playing events recorded'
assets = []
for event in plays:
    from urllib.parse import urlparse
    relative = urlparse(event['src']).path
    path = pathlib.Path('public' + relative)
    assert path.is_file(), f'Played asset absent from source tree: {path}'
    assets.append({'src': relative, 'atSeconds': (event['epochMs'] - first) / 1000, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
speech_match = None
for event in plays:
    source = pathlib.Path('public' + urlparse(event['src']).path)
    if '/audio/ambience/' in str(source):
        continue
    source_raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(source), '-ac', '1', '-ar', '2000', '-f', 'f32le', '-'])
    reference = array.array('f', source_raw)
    if not reference or len(reference) > 20000:
        continue
    recorded_raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(video), '-map', '0:a', '-ac', '1', '-ar', '2000', '-f', 'f32le', '-'])
    recorded = array.array('f', recorded_raw)
    expected = int((event['epochMs'] - first) * 2)
    reference = reference[:min(len(reference), 6000)]
    energy = sum(value * value for value in reference)
    if energy < .001:
        continue
    best = (-1, 0)
    for shift in range(max(0, expected - 600), min(len(recorded) - len(reference), expected + 600)):
        segment = recorded[shift:shift + len(reference)]
        denominator = math.sqrt(energy * sum(value * value for value in segment))
        correlation = sum(a * b for a, b in zip(reference, segment)) / denominator if denominator else 0
        if correlation > best[0]:
            best = (correlation, shift)
    if best[0] > .8:
        speech_match = {'src': urlparse(event['src']).path, 'normalizedWaveformCorrelation': best[0], 'loggedPlayingSeconds': expected / 2000, 'matchedSourceStartSeconds': best[1] / 2000, 'alignmentDifferenceSeconds': (best[1] - expected) / 2000}
        break
assert speech_match, 'Could not match genuine played speech to the exported audio'
assert abs(speech_match['alignmentDifferenceSeconds']) < .12, f'Speech is out of sync: {speech_match}'
verification = {'speechMatch': speech_match, 'sourceSha': capture['sourceSha'], 'video': str(video), 'durationSeconds': duration, 'frameCount': len(frames), 'measuredFramesPerSecond': len(frames) / duration, 'audioRms': rms, 'audioPeak': peak, 'firstFrameAudioTrimSeconds': offset, 'actualPlayingEvents': assets, 'browserErrors': capture['errors'], 'method': capture['method'], 'limits': ['Runtime audio routing is instrumented.', 'Screenshot cadence measures visual motion; 30FPS encoding does not add motion detail.', 'Signal checks establish nonzero output; independent Mandarin pronunciation and physical-speaker listening remain separate checks.']}
(root / 'verification.json').write_text(json.dumps(verification, ensure_ascii=False, indent=2) + '\n')
for index, chapter in enumerate(capture['chapters']):
    start = max(0, (chapter['epochMs'] - first) / 1000)
    stop = min(duration, (capture['chapters'][index + 1]['epochMs'] - first) / 1000) if index + 1 < len(capture['chapters']) else duration
    if stop - start < 1:
        continue
    target = root / f'chapter-{index:02}.mp4'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(start), '-i', str(video), '-t', str(stop - start), '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-c:a', 'aac', '-movflags', '+faststart', str(target)], check=True)
print(json.dumps({'video': str(video), 'seconds': duration, 'rms': rms, 'peak': peak, 'actualPlayedClips': len(plays)}, indent=2))
