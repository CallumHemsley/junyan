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
if capture['mode'] == 'tour':
    final = capture['finalState']
    neighbourhood = final['neighbourhood']
    assert final['day'] == 2, 'Tour must genuinely advance the restaurant day'
    assert neighbourhood['cats']['story']['node'] == 'reunited', 'Cat reunion not completed'
    assert set(neighbourhood['repairs']['completed']) == {'lamp', 'toy'}, 'Both repairs must complete'
    assert all(plant['growth'] >= 1 for plant in neighbourhood['garden']['plants'].values()), 'Garden did not grow'
    assert sum('递上找零' in action['text'] for action in capture['actions']) == 4, 'Four customer change handovers required'
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
def probe_and_match(target, segments, required_features=()):
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(target)]))
    assert any(stream['codec_name'] == 'h264' for stream in probe['streams']), 'Missing H264 video'
    assert any(stream['codec_name'] == 'aac' for stream in probe['streams']), 'Missing AAC audio'
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(target), '-map', '0:a', '-ac', '1', '-ar', '2000', '-f', 'f32le', '-'])
    recorded = array.array('f', raw)
    rms = math.sqrt(sum(value * value for value in recorded) / len(recorded))
    peak = max(abs(value) for value in recorded)
    assert rms > .001 and peak > .01, f'Silent or quiet audio {target}: {rms}, {peak}'
    candidates = []
    elapsed = 0
    for start, stop in segments:
        for event in capture['events']:
            at = (event['epochMs'] - first) / 1000
            if event['event'] != 'playing' or not start <= at < stop:
                continue
            relative = urlparse(event['src']).path
            path = pathlib.Path('public' + relative)
            assert path.is_file(), f'Missing played source {path}'
            ended = next((item for item in capture['events'] if item['event'] == 'ended' and item['src'] == event['src'] and item['epochMs'] > event['epochMs']), None)
            candidates.append({'src': relative, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'atSeconds': elapsed + at - start, 'complete': ended is not None and (ended['epochMs'] - first) / 1000 <= stop})
        elapsed += stop - start
    speeches = [item for item in candidates if item['complete'] and item['src'].endswith('.wav')]
    assert speeches, f'No complete real speech in {target}'
    selected = []
    for feature in required_features:
        item = next((item for item in speeches if f'/audio/{feature}/line-' in item['src']), None)
        assert item, f'No complete {feature} line in {target}'
        selected.append((feature, item))
    if not selected:
        selected.append(('first', speeches[0]))
    selected.append(('late', speeches[-1]))
    matches = []
    for label, event in selected:
        source_raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', 'public' + event['src'], '-ac', '1', '-ar', '2000', '-f', 'f32le', '-'])
        reference = array.array('f', source_raw)[:6000]
        energy = sum(value * value for value in reference)
        assert energy > .001, f'Silent source {event}'
        expected = round(event['atSeconds'] * 2000)
        best = (-1, 0)
        for shift in range(max(0, expected - 400), min(len(recorded) - len(reference), expected + 400)):
            segment = recorded[shift:shift + len(reference)]
            denominator = math.sqrt(energy * sum(value * value for value in segment))
            correlation = sum(a * b for a, b in zip(reference, segment)) / denominator if denominator else 0
            if correlation > best[0]:
                best = (correlation, shift)
        result = {**event, 'label': label, 'normalizedWaveformCorrelation': best[0], 'matchedSourceStartSeconds': best[1] / 2000, 'alignmentDifferenceSeconds': (best[1] - expected) / 2000}
        assert best[0] > .8, f'Cannot match actual source speech in {target}: {result}'
        assert abs(result['alignmentDifferenceSeconds']) < .12, f'Speech out of sync in {target}: {result}'
        matches.append(result)
    proof = {'sourceSha': capture['sourceSha'], 'video': str(target), 'videoSha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'durationSeconds': float(probe['format']['duration']), 'audioRmsAt2000Hz': rms, 'audioPeakAt2000Hz': peak, 'speechMatches': matches, 'actualPlayingEvents': candidates, 'sourceSegmentsSeconds': segments, 'browserErrors': capture['errors'], 'method': capture['method'], 'limits': ['Runtime audio routing is instrumented.', 'Timed screenshots do not capture every display frame.', 'No independent physical speaker audition or Mandarin pronunciation review claimed.']}
    target.with_suffix('.ffprobe.json').write_text(json.dumps(probe, indent=2) + '\n')
    target.with_suffix('.verification.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
    return proof

from urllib.parse import urlparse
features = ['apartment', 'cats', 'repairs', 'garden'] if capture['mode'] == 'tour' else []
proofs = [probe_and_match(video, [(0, duration)], features)]
chapters = []
for index, chapter in enumerate(capture['chapters']):
    start = max(0, (chapter['epochMs'] - first) / 1000)
    stop = min(duration, (capture['chapters'][index + 1]['epochMs'] - first) / 1000) if index + 1 < len(capture['chapters']) else duration
    if stop - start >= 1:
        chapters.append((chapter['name'], (start, stop)))

def export_segments(target, segments):
    filters = []
    inputs = []
    for index, (start, stop) in enumerate(segments):
        filters += [f'[0:v]trim=start={start}:end={stop},setpts=PTS-STARTPTS[v{index}]', f'[0:a]atrim=start={start}:end={stop},asetpts=PTS-STARTPTS[a{index}]']
        inputs.append(f'[v{index}][a{index}]')
    filters.append(''.join(inputs) + f'concat=n={len(segments)}:v=1:a=1[v][a]')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(video), '-filter_complex', ';'.join(filters), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(target)], check=True)

if capture['mode'] == 'tour':
    combined = []
    for feature, name in zip(features, ['家', '院子', '修理间', '屋顶花园']):
        segments = [interval for chapter_name, interval in chapters if chapter_name == name]
        assert segments, f'Missing chapter {name}'
        combined.extend(segments)
        target = root / f'{feature}.mp4'
        export_segments(target, segments)
        proofs.append(probe_and_match(target, segments, [feature]))
    combined.sort()
    target = root / 'neighbourhood-combined.mp4'
    export_segments(target, combined)
    proofs.append(probe_and_match(target, combined, features))
summary = {'sourceSha': capture['sourceSha'], 'frameCount': len(frames), 'measuredFramesPerSecond': len(frames) / duration, 'firstFrameAudioTrimSeconds': offset, 'outputs': proofs}
(root / 'verification.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
print(json.dumps([{key: item[key] for key in ['video', 'durationSeconds', 'audioRmsAt2000Hz', 'speechMatches']} for item in proofs], ensure_ascii=False, indent=2))
