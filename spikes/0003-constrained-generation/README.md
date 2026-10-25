# Spike 0003: vocabulary-constrained generation for Mandarin

Throwaway code for [ticket 3](../../docs/tickets/0003-spike-constrained-generation.md). Not the app. Findings are written up in `docs/ideas/spike-constrained-generation.md`.

## Setup

```bash
python3 -m venv .venv && .venv/bin/pip install anthropic jieba hsk30
.venv/bin/python spike.py whitelist
```

## Run against the API

Needs Anthropic credentials (`ANTHROPIC_API_KEY`, or an `ant auth login` profile).

```bash
.venv/bin/python spike.py run --backend anthropic --model claude-haiku-5-5 --known 507 --n 50
.venv/bin/python spike.py run --backend anthropic --model claude-opus-5-5 --known 507 --n 50
.venv/bin/python spike.py run --backend anthropic --model claude-haiku-5-5 --known 300 --n 50
```

## Run with a model in the loop by hand

Without credentials, the `file` backend writes each prompt to `runs/<name>/passN.prompt.md` and stops. Paste the model's reply into `runs/<name>/passN.response.json` and re-run the same command; it continues from there.

```bash
.venv/bin/python spike.py run --backend file --model haiku-via-agent --known 507 --n 50
```

## What the grader does

Strips punctuation, checks every character against the characters of the known words, then segments by forward maximum match over the whitelist alone. Anything it cannot segment is out of vocabulary. It also reports what jieba, an outside segmenter, would flag, to show the disagreement.

Whitelists: `whitelist-507.json` is HSK 3.0 (2021 standard) band 1 in full; `whitelist-300.json` is a seeded 300-word subset of it that keeps a grammar core. Both carry the ten "new" stall words the generator must feature.
