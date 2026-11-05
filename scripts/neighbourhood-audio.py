"""Generate or audit neighbourhood speech with approved presets and stable authored URLs."""
import argparse
import importlib.util
from pathlib import Path
import sys

sys.dont_write_bytecode = True
import time

spec = importlib.util.spec_from_file_location('content_audio', Path(__file__).with_name('content-audio.py'))
audio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audio)
ROOT = audio.ROOT
FEATURES = ('apartment', 'cats', 'repairs', 'garden')


def jobs_for(feature, config):
    content = audio.read_json(ROOT / f'src/features/{feature}/content.json')
    jobs = {}
    for source in audio.collect_jobs(content, config):
        for target in source['targets']:
            url = target['audio']
            if not url.startswith('/audio/'):
                raise ValueError(f'Invalid audio URL {url}')
            filename = url.removeprefix('/audio/')
            path = Path(filename)
            if path.is_absolute() or '..' in path.parts or path.suffix != '.wav':
                raise ValueError(f'Unsafe audio URL {url}')
            if len(path.parts) > 1 and path.parts[0] != feature:
                raise ValueError(f'Cross-feature audio URL {url}')
            job = {**source, 'filename': filename, 'targets': []}
            previous = jobs.setdefault(filename, job)
            if previous['content_digest'] != job['content_digest']:
                raise ValueError(f'Conflicting identities for {url}')
            previous['targets'].append(target)
    return list(jobs.values())


def records_from(path, prefix=''):
    if not path.exists():
        return {}
    manifest = audio.read_json(path)
    if not isinstance(manifest, dict) or not isinstance(manifest.get('clips'), list):
        raise ValueError(f'Invalid manifest {path}')
    records = {}
    for entry in manifest['clips']:
        name = entry.get('filename') if isinstance(entry, dict) else None
        if not isinstance(name, str) or not name or Path(name).name != name or Path(name).suffix != '.wav':
            raise ValueError(f'Unsafe provenance filename in {path}')
        filename = prefix + name
        if filename in records:
            raise ValueError(f'Duplicate provenance {filename}')
        records[filename] = {**entry, 'filename': filename}
    return records


def self_check():
    import copy
    import json
    import tempfile
    global ROOT
    original_root = ROOT
    config = audio.read_json(ROOT / 'src/content/voices.json')
    actual = {feature: jobs_for(feature, config) for feature in FEATURES}
    assert {job['voice']['speaker'] for job in actual['repairs'] if job['kind'] == 'line'} == {'Serena', 'zf_xiaobei'}
    assert all(job['voice']['speaker'] == 'Serena' for jobs in actual.values() for job in jobs if job['kind'] == 'word')
    assert all(job['voice']['speaker'] == 'Serena' for feature in ('apartment', 'cats', 'garden') for job in actual[feature])
    with tempfile.TemporaryDirectory() as directory:
        ROOT = Path(directory)
        source = ROOT / 'src/features/apartment/content.json'
        source.parent.mkdir(parents=True)
        word = {'id': 'apartment.one', 'hanzi': '一', 'pinyin': 'yī', 'audio': '/audio/apartment/word-one.wav'}
        content = {'words': [word], 'lines': [{'id': 'apartment.line', 'tokens': [word], 'text': '一。', 'audio': '/audio/apartment/line-one.wav'}]}
        try:
            audio.write_json(source, content)
            jobs = jobs_for('apartment', config)
            assert len(jobs) == 2 and len(jobs[0]['targets']) == 2
            assert jobs[1]['text'] == '一。'
            original = copy.deepcopy(jobs)
            content['words'][0]['audio'] = '/audio/apartment/word-renamed.wav'
            audio.write_json(source, content)
            assert jobs_for('apartment', config)[0]['content_digest'] == original[0]['content_digest']
            for url in ('/audio/../escaped.wav', '/audio/cats/word-one.wav', 'https://example.org/word.wav'):
                content['words'][0]['audio'] = url
                audio.write_json(source, content)
                try:
                    jobs_for('apartment', config)
                except ValueError:
                    pass
                else:
                    raise AssertionError(f'Accepted unsafe URL {url}')
            content['words'] = [word, dict(word, hanzi='二')]
            audio.write_json(source, content)
            try:
                jobs_for('apartment', config)
            except ValueError:
                pass
            else:
                raise AssertionError('Accepted conflicting identity at one URL')
            import math
            destination = ROOT / 'audio'
            (destination / 'apartment').mkdir(parents=True)
            seen = []
            def tone(job, seed):
                seen.append(seed)
                return [0.1 * math.sin(index * 0.1) for index in range(7200)], 24000, {}
            baseline = audio.generate_clip(original[0], destination, tone)
            explicit = audio.generate_clip(original[0], destination, tone, seed_offset=0)
            retry = audio.generate_clip(original[0], destination, tone, seed_offset=8000)
            base_seed = int(original[0]['content_digest'][:8], 16)
            assert seen == [base_seed, base_seed, (base_seed + 8000) % (2 ** 32)]
            assert baseline['sha256'] == explicit['sha256']
            assert baseline['content_digest'] == retry['content_digest']
            records = {original[0]['filename']: retry}
            assert cache_valid(original[0], destination, records)
            rejected = ROOT / 'docs/evidence/0073/rejected-takes.json'
            rejected.parent.mkdir(parents=True)
            audio.write_json(rejected, {'clips': [{'sha256': retry['sha256']}]})
            assert not cache_valid(original[0], destination, records)
            windows = [{(base_seed + round_index * 8000 + attempt * 1000) % (2 ** 32)
                        for attempt in range(audio.MAX_ATTEMPTS)} for round_index in range(3)]
            assert all(not windows[left] & windows[right] for left in range(3) for right in range(left + 1, 3))
            manifest = ROOT / 'manifest.json'
            audio.write_json(manifest, {'clips': [{'filename': 'one.wav'}, {'filename': 'one.wav'}]})
            try:
                records_from(manifest)
            except ValueError:
                pass
            else:
                raise AssertionError('Accepted duplicate provenance')
        finally:
            ROOT = original_root
    assert not any(name in sys.modules for name in ('numpy', 'torch', 'mlx', 'kokoro', 'mlx_audio'))
    print('Neighbourhood self-check passed. Stable URLs, exact punctuation, dictionary routing, repair cast, path boundaries and conflicting provenance.')


def rejected_hashes():
    path = ROOT / 'docs/evidence/0073/rejected-takes.json'
    return {entry['sha256'] for entry in audio.read_json(path)['clips']} if path.exists() else set()


def cache_valid(job, output, records):
    entry = records.get(job['filename'], {})
    return entry.get('sha256') not in rejected_hashes() and audio.cache_valid(job, output, records)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan', action='store_true')
    parser.add_argument('--self-check', action='store_true')
    parser.add_argument('--engine', choices=('qwen', 'kokoro'))
    parser.add_argument('--feature', choices=FEATURES, action='append')
    parser.add_argument('--limit', type=int)
    parser.add_argument('--retry-round', type=int, choices=range(3), default=0)
    parser.add_argument('--retake', action='append', default=[])
    args = parser.parse_args()
    if args.self_check:
        self_check()
        return 0
    if not args.plan and not args.engine:
        parser.error('Generation requires --engine')
    config = audio.read_json(ROOT / 'src/content/voices.json')
    features = args.feature or FEATURES
    output = ROOT / 'public/audio'
    shared = records_from(output / 'manifest.json')
    records = dict(shared)
    for feature in FEATURES:
        records.update(records_from(output / feature / 'manifest.json', feature + '/'))
    jobs = [job for feature in features for job in jobs_for(feature, config)]
    if set(args.retake) - {job['filename'] for job in jobs}:
        parser.error('Retake filenames must belong to the selected feature corpus')
    if args.retake:
        if not args.retry_round:
            parser.error('Retakes require a nonzero retry round')
        rejected = {records[name]['sha256'] for name in args.retake if name in records}
        all_jobs = [job for feature in FEATURES for job in jobs_for(feature, config)]
        jobs = [job for job in all_jobs if job['filename'] in args.retake or records.get(job['filename'], {}).get('sha256') in rejected]
        if any('/' not in job['filename'] for job in jobs):
            parser.error('A retake would affect accepted shared audio; coordinate separately')
        args.retake = [job['filename'] for job in jobs]
    if args.plan:
        import json
        for job in jobs:
            print(json.dumps({'filename': job['filename'], 'text': job['text'],
                              'speaker': job['voice']['speaker'], 'engine': job['voice']['engine'],
                              'cached': cache_valid(job, output, records)}, ensure_ascii=False))
        return 0
    generated = failures = reused = 0
    started = time.perf_counter()
    generator = audio.LocalEngines()
    with audio.output_lock(output):
        for job in jobs:
            if job['filename'] in args.retake and job['filename'] in records:
                previous = records.pop(job['filename'])
                rejection_path = ROOT / 'docs/evidence/0073/rejected-takes.json'
                rejections = audio.read_json(rejection_path) if rejection_path.exists() else {'clips': []}
                rejections['clips'].append({key: previous[key] for key in ('filename', 'sha256', 'content_digest', 'text')} | {'reason': 'Full-line ASR mismatch; bounded retake requested.'})
                audio.write_json(rejection_path, rejections)
                archive = ROOT / 'docs/evidence/0073/rejected' / previous['sha256']
                archive.mkdir(parents=True, exist_ok=True)
                audio.atomic_write(archive / Path(job['filename']).name, (output / job['filename']).read_bytes())
                audio.write_json(archive / (Path(job['filename']).stem + '.provenance.json'), previous)
                manifest_path = (output / job['filename']).parent / 'manifest.json'
                manifest = audio.read_json(manifest_path)
                manifest['clips'] = [entry for entry in manifest['clips'] if entry['filename'] != Path(job['filename']).name]
                audio.write_json(manifest_path, manifest)
            if cache_valid(job, output, records):
                continue
            if '/' not in job['filename']:
                raise ValueError(f'Invalid shared canonical asset {job["filename"]}; repair separately')
            if job['voice']['engine'] != args.engine or args.limit and generated >= args.limit:
                continue
            destination = output / job['filename']
            destination.parent.mkdir(parents=True, exist_ok=True)
            try:
                compatible = None if args.retake else next((entry for entry in records.values()
                                   if entry['content_digest'] == job['content_digest']
                                   and cache_valid({**job, 'filename': entry['filename']}, output, records)), None)
                if compatible:
                    audio.atomic_write(destination, (output / compatible['filename']).read_bytes())
                    entry = {**compatible, 'filename': job['filename'], 'reused_from': compatible['filename']}
                    reused += 1
                else:
                    generated += 1
                    entry = audio.generate_clip(job, output, generator, seed_offset=args.retry_round * audio.MAX_ATTEMPTS * 1000)
                    entry['retry_round'] = args.retry_round
                if entry['sha256'] in rejected_hashes():
                    raise ValueError('New take duplicates a rejected audio hash')
                records[job['filename']] = entry
                local = [dict(record, filename=Path(name).name) for name, record in records.items()
                         if Path(name).parent == Path(job['filename']).parent]
                audio.write_json(destination.parent / 'manifest.json', {'clips': local})
                print(f'AVAILABLE {job["filename"]} {job["voice"]["speaker"]} {job["text"]} '
                      f'attempted={generated} reused={reused} elapsed={time.perf_counter()-started:.0f}s', flush=True)
            except Exception as error:
                failures += 1
                print(f'FAILED {job["filename"]}: {error}', file=sys.stderr, flush=True)
    pending = sum(not cache_valid(job, output, records) for job in jobs)
    print(f'{generated} attempted, {reused} reused, {failures} failures, {pending} pending', flush=True)
    return int(bool(failures or pending))


if __name__ == '__main__':
    sys.exit(main())
