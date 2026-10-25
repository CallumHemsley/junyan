"""Ticket 3 spike: can an LLM write Mandarin customer lines that stay inside a
known-word whitelist, given a deterministic grader and a rewrite loop?

Throwaway. Not the app.

Usage (from this folder, with .venv active or via .venv/bin/python):

  python spike.py whitelist                      # write whitelist-507.json and whitelist-300.json
  python spike.py grade <lines.json> [--known 507|300]
  python spike.py run --backend anthropic --model claude-haiku-5-5 --known 507 --n 50
  python spike.py run --backend file --model <label> --known 507 --n 50
      # file backend: writes runs/<name>/passN.prompt.md, then stops with exit 3
      # until runs/<name>/passN.response.json exists; re-run the same command to continue.

The grader is the load-bearing part: strip punctuation, check every character is
in the player's character set, then segment with a forward-maximum-match over the
whitelist only (no outside dictionary). Anything unsegmentable is out of vocabulary.
A jieba segmentation is reported alongside, to show how an outside segmenter disagrees.
"""
from __future__ import annotations

import argparse
import json
import random
import re
import sys
import time
from pathlib import Path

import hsk30

HERE = Path(__file__).parent
RUNS = HERE / "runs"
STANDARD = "2021"  # decision 0001: HSK 3.0 as the 2021 national standard

# The sliver of new words the generator must feature: breakfast-stall words outside band 1.
TARGETS = ["馒头", "油条", "豆浆", "粥", "饺子", "碗", "根", "冰", "老板", "老样子"]

# Words every 300-word subset keeps, so the small set still has a grammar to speak with.
CORE = [
    "的", "了", "吗", "呢", "是", "我", "你", "他", "她", "这", "那", "个", "一", "二", "三", "四", "五",
    "六", "七", "八", "九", "十", "两", "要", "来", "有", "没有", "好", "不", "谢谢", "再见", "多少",
    "钱", "块", "给", "请", "和", "还", "也", "大", "小", "热", "茶", "包子", "鸡蛋", "杯", "吃", "喝",
    "早", "早上", "今天", "东西", "什么", "几", "点", "对", "行", "可以", "再", "还是",
]

PRICES_PER_M = {  # input, output; from the claude-api skill table, 2026-10
    "claude-haiku-5-5": (0.10, 0.50),
    "claude-sonnet-5-5": (2.00, 10.00),
    "claude-opus-5-5": (4.00, 20.00),
}

PUNCT = re.compile(r"[\s，。！？、；：“”‘’（）《》…—,.!?;:\"'()\[\]\-~～·0-9０-９]+")


# ----------------------------------------------------------------------------- whitelist

def band1_words() -> list[str]:
    return [w for w, lvl in hsk30.words(STANDARD).items() if lvl == 1]


def make_whitelists() -> None:
    full = band1_words()
    rng = random.Random(3)  # ticket number, for reproducibility
    core = [w for w in CORE if w in full]
    rest = [w for w in full if w not in core]
    rng.shuffle(rest)
    small = sorted(core + rest[: 300 - len(core)])
    for name, words in (("507", sorted(full)), ("300", small)):
        (HERE / f"whitelist-{name}.json").write_text(
            json.dumps({"standard": STANDARD, "band": 1, "known": words, "targets": TARGETS},
                       ensure_ascii=False, indent=0),
            encoding="utf-8",
        )
        print(f"whitelist-{name}.json: {len(words)} known + {len(TARGETS)} targets")


def load_whitelist(known: str) -> dict:
    return json.loads((HERE / f"whitelist-{known}.json").read_text(encoding="utf-8"))


# ----------------------------------------------------------------------------- grader

class Grader:
    def __init__(self, known: list[str], targets: list[str]):
        self.known = set(known)
        self.targets = set(targets)
        self.vocab = self.known | self.targets
        self.chars = {c for w in self.vocab for c in w}
        self.maxlen = max(len(w) for w in self.vocab)

    def clean(self, line: str) -> str:
        return PUNCT.sub("", line)

    def segment(self, text: str) -> list[tuple[str, bool]]:
        """Forward maximum match over the whitelist only. Returns (token, in_vocab)."""
        out: list[tuple[str, bool]] = []
        i, n = 0, len(text)
        unk = ""
        while i < n:
            for L in range(min(self.maxlen, n - i), 0, -1):
                cand = text[i : i + L]
                if cand in self.vocab:
                    if unk:
                        out.append((unk, False))
                        unk = ""
                    out.append((cand, True))
                    i += L
                    break
            else:
                unk += text[i]
                i += 1
        if unk:
            out.append((unk, False))
        return out

    def grade_line(self, line: str) -> dict:
        text = self.clean(line)
        toks = self.segment(text)
        oov_chars = sorted({c for c in text if c not in self.chars})
        oov_tokens = [t for t, ok in toks if not ok]
        targets_used = sorted({t for t, ok in toks if ok and t in self.targets})
        return {
            "line": line,
            "tokens": [t for t, _ in toks],
            "n_tokens": len(toks),
            "oov_tokens": oov_tokens,
            "oov_chars": oov_chars,
            "targets_used": targets_used,
            "clean": not oov_tokens and not oov_chars,
        }

    def grade(self, lines: list[str]) -> dict:
        rows = [self.grade_line(l) for l in lines]
        n_tok = sum(r["n_tokens"] for r in rows) or 1
        n_oov = sum(len(r["oov_tokens"]) for r in rows)
        n_chars = sum(len(self.clean(r["line"])) for r in rows) or 1
        n_oov_chars = sum(sum(1 for c in self.clean(r["line"]) if c not in self.chars) for r in rows)
        light = sum(1 for r in rows for t in r["tokens"] if t in {"这", "那", "东西", "个"})
        target_counts = {t: sum(1 for r in rows if t in r["targets_used"]) for t in sorted(self.targets)}
        jieba_oov = jieba_check(lines, self.vocab)
        return {
            "n_lines": len(rows),
            "n_clean": sum(r["clean"] for r in rows),
            "token_oov_rate": n_oov / n_tok,
            "char_oov_rate": n_oov_chars / n_chars,
            "distinct_ratio": len(set(lines)) / (len(lines) or 1),
            "lines_with_target": sum(1 for r in rows if r["targets_used"]),
            "target_counts": target_counts,
            "light_word_share": light / n_tok,
            "jieba_token_oov_rate": jieba_oov,
            "rows": rows,
        }


def jieba_check(lines: list[str], vocab: set[str]) -> float:
    """What an outside segmenter would call OOV. Shows the segmentation problem."""
    try:
        import jieba  # noqa: WPS433
    except ImportError:
        return float("nan")
    jieba.setLogLevel(60)
    toks = [t for l in lines for t in jieba.lcut(PUNCT.sub("", l)) if t]
    if not toks:
        return 0.0
    return sum(1 for t in toks if t not in vocab) / len(toks)


def summarize(g: dict) -> str:
    return (
        f"lines {g['n_clean']}/{g['n_lines']} clean | token OOV {g['token_oov_rate']:.2%} "
        f"| char OOV {g['char_oov_rate']:.2%} | jieba-OOV {g['jieba_token_oov_rate']:.2%} "
        f"| with target {g['lines_with_target']}/{g['n_lines']} | distinct {g['distinct_ratio']:.0%} "
        f"| light words {g['light_word_share']:.1%}"
    )


# ----------------------------------------------------------------------------- prompts

SYSTEM = """You write short spoken lines for customers at a small Chinese breakfast stall (早餐店) in a language-learning game. The player is the stall owner and only reads simplified Chinese. The player knows ONLY the words in the list you are given. Every line you write must be made entirely of words from that list. No other words, no other characters, no pinyin, no English, no translations, no Arabic numerals. Use Chinese punctuation only.

The list has two parts. KNOWN words the player already knows. NEW words the player is learning at this stall; every line should contain at least one NEW word, and across the whole set each NEW word should appear at least three times.

Write the way real customers talk: ordering (来两个包子), quantities with the right measure word (一杯豆浆, 一碗粥, 一根油条), hot or iced, big or small bowl, asking whether something is available (有饺子吗), adding to an order (还要), correcting themselves (不，四个), greeting the owner (老板早), regulars asking for the usual (老样子). Vary length from 3 to 14 characters. Avoid repeating the same line. Keep it natural; if a natural phrasing needs a word outside the list, find another natural phrasing rather than a stilted one."""


SCENES = {
    "orders": {
        "system": SYSTEM,
        "ask": "Write {n} customer lines. Return ONLY a JSON array of {n} strings, nothing else.",
    },
    "smalltalk": {
        "system": SYSTEM.split("\n\nWrite the way real customers talk")[0] + """

These lines are small talk: regular customers chatting with the owner while they wait for their food. Each line is two short sentences, 12 to 30 characters in total, about the weather, work, school, family, yesterday, plans for today, being tired or hungry, or the food itself. Each line still mentions at least one NEW word, since the talk happens at the stall. Vary the speakers: a grandmother, an office worker in a hurry, a child, a teacher. Natural spoken Mandarin only; if a natural phrasing needs a word outside the list, find another natural phrasing rather than a stilted one.""",
        "ask": "Write {n} small-talk lines. Return ONLY a JSON array of {n} strings, nothing else.",
    },
}


def gen_prompt(wl: dict, n: int, scene: str = "orders") -> str:
    return (
        f"KNOWN words ({len(wl['known'])}):\n" + " ".join(wl["known"]) + "\n\n"
        f"NEW words ({len(wl['targets'])}):\n" + " ".join(wl["targets"]) + "\n\n"
        + SCENES[scene]["ask"].format(n=n)
    )


def rewrite_prompt(wl: dict, bad: list[dict]) -> str:
    items = "\n".join(
        f'{r["idx"]}. {r["line"]}   ← outside the list: {" ".join(r["oov_tokens"] + [c for c in r["oov_chars"] if c not in "".join(r["oov_tokens"])])}'
        for r in bad
    )
    return (
        f"KNOWN words ({len(wl['known'])}):\n" + " ".join(wl["known"]) + "\n\n"
        f"NEW words ({len(wl['targets'])}):\n" + " ".join(wl["targets"]) + "\n\n"
        "These lines use words or characters that are NOT in the list. Rewrite each one so it uses only listed words, "
        "keeps roughly the same meaning and length, and still sounds like a real customer. "
        "Do not reuse the flagged words in any form.\n\n" + items + "\n\n"
        "Return ONLY a JSON object mapping each line number (as a string) to its rewritten line."
    )


# ----------------------------------------------------------------------------- backends

def parse_json(text: str):
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.S)
    start = min([i for i in (text.find("["), text.find("{")) if i >= 0] or [0])
    return json.loads(text[start:])


class AnthropicBackend:
    def __init__(self, model: str, effort: str | None, system: str = SYSTEM):
        import anthropic

        self.client = anthropic.Anthropic()
        self.model = model
        self.effort = effort
        self.system = system
        self.usage = {"input": 0, "output": 0, "calls": 0, "seconds": 0.0}

    def complete(self, prompt: str) -> str:
        kwargs = {}
        if self.effort:
            kwargs["output_config"] = {"effort": self.effort}
        t0 = time.perf_counter()
        resp = self.client.messages.create(
            model=self.model, max_tokens=16000, system=self.system,
            messages=[{"role": "user", "content": prompt}], **kwargs,
        )
        self.usage["seconds"] += time.perf_counter() - t0
        self.usage["calls"] += 1
        self.usage["input"] += resp.usage.input_tokens
        self.usage["output"] += resp.usage.output_tokens
        if resp.stop_reason == "refusal":
            raise RuntimeError(f"refusal: {resp.stop_details}")
        return "".join(b.text for b in resp.content if b.type == "text")

    def cost_usd(self) -> float | None:
        p = PRICES_PER_M.get(self.model)
        if not p:
            return None
        return self.usage["input"] / 1e6 * p[0] + self.usage["output"] / 1e6 * p[1]


class FileBackend:
    """Human-or-agent in the loop: write the prompt, stop, read the response next run."""

    def __init__(self, run_dir: Path, system: str = SYSTEM):
        self.run_dir = run_dir
        self.system = system
        self.usage = {"input": 0, "output": 0, "calls": 0, "seconds": 0.0}

    def complete(self, prompt: str, tag: str = "") -> str:
        p = self.run_dir / f"{tag}.prompt.md"
        r = self.run_dir / f"{tag}.response.json"
        if r.exists():
            self.usage["calls"] += 1
            # rough token estimate for cost: ~1 token per 1.5 Chinese chars, ~4 ASCII chars
            self.usage["input"] += estimate_tokens(self.system + prompt)
            self.usage["output"] += estimate_tokens(r.read_text(encoding="utf-8"))
            return r.read_text(encoding="utf-8")
        p.write_text("SYSTEM:\n" + self.system + "\n\nUSER:\n" + prompt, encoding="utf-8")
        print(f"[file backend] wrote {p}\n  → put the model's reply in {r} and re-run.")
        sys.exit(3)

    def cost_usd(self) -> None:
        return None


def estimate_tokens(s: str) -> int:
    cjk = sum(1 for c in s if "一" <= c <= "鿿")
    other = len(s) - cjk
    return int(cjk / 1.5 + other / 4)


# ----------------------------------------------------------------------------- run

def run(args) -> None:
    wl = load_whitelist(args.known)
    grader = Grader(wl["known"], wl["targets"])
    scene = SCENES[args.scene]
    name = args.name or f"{args.model}-k{args.known}-n{args.n}" + ("" if args.scene == "orders" else f"-{args.scene}")
    run_dir = RUNS / name
    run_dir.mkdir(parents=True, exist_ok=True)
    backend = (
        FileBackend(run_dir, scene["system"]) if args.backend == "file"
        else AnthropicBackend(args.model, args.effort, scene["system"])
    )

    def ask(prompt: str, tag: str) -> str:
        return backend.complete(prompt, tag) if args.backend == "file" else backend.complete(prompt)

    log: list[dict] = []
    lines = [str(x) for x in parse_json(ask(gen_prompt(wl, args.n, args.scene), "pass0"))][: args.n]
    g = grader.grade(lines)
    log.append({"pass": 0, **{k: v for k, v in g.items() if k != "rows"}})
    print(f"pass 0: {summarize(g)}")

    for p in range(1, args.max_passes + 1):
        bad = [{"idx": i, **r} for i, r in enumerate(g["rows"]) if not r["clean"]]
        if not bad:
            break
        reply = parse_json(ask(rewrite_prompt(wl, bad), f"pass{p}"))
        for k, v in reply.items():
            i = int(k)
            if 0 <= i < len(lines):
                lines[i] = str(v)
        g = grader.grade(lines)
        log.append({"pass": p, **{k: v for k, v in g.items() if k != "rows"}})
        print(f"pass {p}: {summarize(g)}")

    final_bad = [r for r in g["rows"] if not r["clean"]]
    kept = [r["line"] for r in g["rows"] if r["clean"]]
    result = {
        "model": args.model, "backend": args.backend, "known": args.known, "n": args.n, "scene": args.scene,
        "passes": log, "dropped_after_max_passes": [r["line"] for r in final_bad],
        "kept": kept, "usage": backend.usage, "cost_usd": backend.cost_usd(),
        "final": {k: v for k, v in g.items() if k != "rows"},
        "rows": g["rows"],
    }
    (run_dir / "result.json").write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\nkept {len(kept)}/{args.n}; dropped {len(final_bad)}; calls {backend.usage['calls']}; "
          f"est. tokens in/out {backend.usage['input']}/{backend.usage['output']}; cost {result['cost_usd']}")
    print(f"→ {run_dir / 'result.json'}")


def grade_cmd(args) -> None:
    wl = load_whitelist(args.known)
    lines = parse_json(Path(args.file).read_text(encoding="utf-8"))
    g = Grader(wl["known"], wl["targets"]).grade([str(x) for x in lines])
    print(summarize(g))
    for r in g["rows"]:
        if not r["clean"]:
            print(f"  ✗ {r['line']}  oov={r['oov_tokens']} chars={r['oov_chars']}")


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("whitelist")
    g = sub.add_parser("grade"); g.add_argument("file"); g.add_argument("--known", default="507")
    r = sub.add_parser("run")
    r.add_argument("--backend", choices=["anthropic", "file"], default="anthropic")
    r.add_argument("--model", default="claude-opus-5-5")
    r.add_argument("--effort", default=None)
    r.add_argument("--known", default="507")
    r.add_argument("--n", type=int, default=50)
    r.add_argument("--max-passes", type=int, default=5)
    r.add_argument("--scene", choices=list(SCENES), default="orders")
    r.add_argument("--name", default=None)
    args = ap.parse_args()
    {"whitelist": lambda a: make_whitelists(), "grade": grade_cmd, "run": run}[args.cmd](args)


if __name__ == "__main__":
    main()
