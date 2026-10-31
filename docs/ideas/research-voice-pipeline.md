---
title: Research — Mandarin TTS APIs and the voice bake-off spec
status: draft
created: 2026-10-31
tags: [research, audio, tts, codex, ticket-8]
---

> Produced by OpenAI Codex (gpt-6-astra, xhigh) via `codex exec` with live web search on 2026-10-31, from a prompt by Claude Code; filed unedited apart from this header. It verifies MiniMax, Fish Audio and Azure docs, corrects two prices from [[research-ai-assets]] §6 (Azure counts each Hanzi twice, so about $30 per million characters; MiniMax's international per-Hanzi multiplier is unconfirmed), gives the exact pinyin-override syntax for each provider, and designs the bake-off script and its 20-line test set.

**Bake off MiniMax `speech-2.8-hd`, Fish `s2.1-pro`, and Azure standard `zh-CN` Neural, in that order.** Treat this as an integration order; native-speaker listening should determine the winner.

Verified against official documentation on **31 October 2026**, after reading both requested repository notes. No files were modified and no speech-generation calls were made.

**The price comparison needs a consistent denominator.** Below, “1M Chinese characters” means one million ordinary BMP Hanzi, excluding punctuation, spaces, pronunciation markup, retries, and voice-creation fees.

| Provider/model | Published API rate | Cost per 1M plain Chinese characters | Pronunciation control |
|---|---:|---:|---|
| MiniMax `speech-2.8-hd`, international API | $100/M billable characters | **Not fully confirmed:** $100 with a 1× Hanzi multiplier; $200 with 2× | Numbered pinyin, inline or dictionary |
| MiniMax `speech-2.8-turbo`, international API | $60/M billable characters | **Not fully confirmed:** $60 with 1×; $120 with 2× | Same controls |
| Fish `s2.1-pro` or `s2-pro` | $15/M UTF-8 bytes | **$45**: ordinary Hanzi occupy three bytes each | Numbered-pinyin phoneme tags |
| Fish `s2.1-pro-free` | $0/M UTF-8 bytes | **$0 within permitted fair use**; not a guaranteed million-character allowance | Same model quality as paid S2.1 |
| Fish `drama-3` | $50/M UTF-8 bytes; currently $10 promotional | **$150 list; $30 promotional** until 12 November 2026, 17:00 UTC | Phoneme tags and performance directions |
| Azure standard Neural, East US S1 | $15/M billable characters | **$30**: each Hanzi counts twice | SSML phonemes using `alphabet="sapi"` |

MiniMax’s prices come from its [international pricing page](https://platform.minimax.io/docs/pricing/overview). Fish’s byte-based rates and promotion are explicitly documented in its [pricing table](https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits). Azure’s $15 rate was retrieved from the [official retail-price meter](https://prices.azure.com/api/retail/prices?%24filter=meterId%20eq%20%270f98e708-a16c-407b-8089-a0ed9e14ab49%27); Microsoft explicitly documents [double counting for Hanzi and additional SSML billing](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech#pricing-note).

**MiniMax’s international Hanzi multiplier remains unresolved.** Its international page omits the counting definition. Its mainland-China page explicitly counts one Hanzi as two characters, producing **¥700/M Hanzi for HD and ¥400/M for Turbo**. Applying that mainland rule to international dollar rates would be an inference, so the table does not present it as verified. The script must use returned `usage_characters` for final accounting. [Mainland pricing](https://platform.minimax.cn/docs/pricing/overview)

The table therefore corrects the existing notes: Fish’s approximately $45/M Hanzi is supported; Azure’s headline character price needs doubling; MiniMax’s $100/M **Chinese** characters is not yet established.

**MiniMax’s HTTP integration should use this contract.**

| Item | Specification |
|---|---|
| Endpoint | `POST https://api.minimax.io/v1/t2a_v2` |
| Authentication | `Authorization: Bearer <API_KEY>` |
| Request type | `Content-Type: application/json` |
| Current models | `speech-2.8-hd`, `speech-2.8-turbo` |
| Additional accepted model names | `speech-2.6-hd`, `speech-2.6-turbo`, `speech-02-hd`, `speech-02-turbo`, `speech-01-hd`, `speech-01-turbo` |
| Language | `language_boost: "Chinese"`; `"Chinese,Yue"` selects Cantonese enhancement; `"auto"` enables detection |
| Delivery | `stream: false`, `output_format: "hex"` for the bake script |
| Text limit | Fewer than 10,000 characters |

These fields and model names are in the [HTTP reference](https://platform.minimax.io/docs/api-reference/speech-t2a-http). An alternative US West endpoint is `https://api-uw.minimax.io/v1/t2a_v2`; pin the chosen endpoint in configuration. [Endpoint guide](https://platform.minimax.io/docs/guides/speech-t2a-websocket#endpoints)

The two pronunciation forms are distinct:

```json
{
  "text": "处理好了。",
  "pronunciation_dict": {
    "tone": ["处理/(chu3)(li3)"]
  }
}
```

That dictionary entry is the **exact documented syntax**: `original/replacement`, with each replacement syllable parenthesized.

Inline pronunciation instead replaces the relevant Hanzi:

```json
{
  "text": "请(chong2)新说一遍。"
}
```

Use ASCII parentheses and tone numbers `1–5`; `5` means neutral tone. Do not append a second pronunciation after the original word. The official inline example replaces 和 with `(he2)` in `(he2)平`. [Pronunciation specification](https://platform.minimax.io/docs/api-reference/speech-t2a-http)

MiniMax exposes the following voice and audio controls:

| Parameter | Documented values |
|---|---|
| `voice_setting.emotion` | `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, `calm`, `fluent`, `whisper` |
| Model restriction | Documentation restricts `fluent` and `whisper` to 2.6 HD/Turbo, and explicitly excludes `whisper` from 2.8. Omit both for this 2.8 bake-off. |
| `voice_setting.speed` | `0.5–2`; default `1` |
| `voice_setting.pitch` | Integer `-12–12`; default `0` |
| `voice_setting.vol` | Greater than `0`, up to `10`; default `1` |
| `audio_setting.format` | `mp3`, `pcm`, `flac`, `wav`, `pcmu_raw`, `pcmu_wav`, `opus` |
| Sample rates | `8000`, `16000`, `22050`, `24000`, `32000`, `44100` |
| MP3 bitrates | `32000`, `64000`, `128000`, `256000` bits/sec |
| Channels | `1` or `2` |

The shared [voice/audio schema](https://platform.minimax.io/docs/api-reference/speech/t2a/api/asyncapi.json) documents these values. Start with automatic emotion, unchanged pitch, and mono WAV at 24 kHz. Character delivery adjustments belong in a separate, recorded audition condition.

For recurring voices:

- **List:** `POST https://api.minimax.io/v1/get_voice`, body `{"voice_type":"all"}`. Other categories are `system`, `voice_cloning`, and `voice_generation`. [Get Voice](https://platform.minimax.io/docs/api-reference/voice-management-get)
- **Design:** `POST https://api.minimax.io/v1/voice_design`, supplying `prompt` and `preview_text`—maximum 500 characters—and optionally `voice_id`. The response supplies a reusable ID and hex preview audio. [Voice Design](https://platform.minimax.io/docs/api-reference/voice-design-design)
- **Clone:** Upload MP3/M4A/WAV to `/v1/files/upload` with multipart `purpose=voice_clone`; accepted audio is 10 seconds–5 minutes, at most 20 MB. Pass its `file_id` and your chosen `voice_id` to `/v1/voice_clone`. [Upload](https://platform.minimax.io/docs/api-reference/voice-cloning-uploadcloneaudio), [Clone](https://platform.minimax.io/docs/api-reference/voice-cloning-clone)
- **Activate:** Use a new voice in T2A within seven days to retain it. A cloning preview does not activate it. [Voice persistence FAQ](https://platform.minimax.io/docs/faq/about-apis)

International setup fees are **$3/designed voice** or **$1.50/cloned voice**, charged on first synthesis use. **Preview pricing conflicts:** the pricing page says $60/M characters for design previews; the Voice Design reference says $30/M. Record this as unresolved rather than choosing silently. [Pricing](https://platform.minimax.io/docs/pricing/overview), [Design reference](https://platform.minimax.io/docs/api-reference/voice-design-design)

Published standard limits are **60 T2A requests/minute**, **60 cloning requests/minute**, and **20 voice-design requests/minute**. Audio subscriptions have different allowances, so make the account limit configurable. [Rate limits](https://platform.minimax.io/docs/guides/rate-limits), [Subscription allowances](https://platform.minimax.io/docs/pricing/overview)

**No dedicated official MiniMax Node/TypeScript T2A SDK was confirmed.** MiniMax documents `@minimax-ai/ai-sdk-provider`, but that page describes language models, not this speech endpoint. Use Node’s `fetch` for T2A. [Official SDK integration page](https://platform.minimax.io/docs/api-reference/text-ai-sdk)

**Fish’s current comparison target should be S2.1 Pro.** Fish recommends `s2.1-pro` for production; `s2-pro` remains available. Drama 3 is newer and aimed at directed performances, making it a useful optional fourth candidate. [Model overview](https://docs.fish.audio/developer-guide/models-pricing/models-overview), [Drama 3](https://docs.fish.audio/features/text-to-speech/drama-3)

```http
POST https://api.fish.audio/v1/tts
Authorization: Bearer <API_KEY>
Content-Type: application/json
model: s2.1-pro
```

```json
{
  "text": "来一个包子。",
  "reference_id": "<locked-character-voice-id>",
  "format": "wav",
  "sample_rate": 24000,
  "temperature": 0.7,
  "top_p": 0.7,
  "latency": "normal",
  "prosody": { "speed": 1, "volume": 0 }
}
```

The **model is an HTTP header**; `reference_id` selects the speaker. Missing or unrecognized model headers fall back to `s2.1-pro`, so validate model strings locally. The response contains audio bytes. Formats include WAV, PCM, MP3, and Opus. [TTS API](https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech)

A persistent voice comes from the voice library or `POST /model`. Alternatively, `references` supplies reference audio plus its transcript for zero-shot cloning; direct audio bytes use MessagePack. Prefer a persistent reference ID for the four regulars. [Create Model](https://docs.fish.audio/api-reference/endpoint/model/create-model), [Reference-audio mechanism](https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech)

Fish now documents Mandarin overrides explicitly:

```text
请<|phoneme_start|>chong2<|phoneme_end|>新说一遍。
```

Each tag pair contains **one lowercase, tone-numbered syllable**. Adjacent syllables require adjacent tag pairs; punctuation stays outside. Neutral tone is `5`. [Chinese phoneme control](https://docs.fish.audio/developer-guide/core-features/fine-grained-control/chinese)

Fish also supports request-local or versioned pronunciation dictionaries. For this script, positional tags avoid ambiguous substring matches. [Dictionary documentation](https://docs.fish.audio/developer-guide/core-features/fine-grained-control/pronunciation-dictionaries)

S2 performance cues use square brackets, such as `[happy]` or `[in a hurry tone]`. Keep these out of the first pronunciation comparison. [Emotion controls](https://docs.fish.audio/developer-guide/core-features/emotions)

The initial account tier allows **five concurrent requests**; higher prepaid tiers allow 15 and 50. This is a concurrency limit, not five requests per second. [Limits](https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits)

An official JavaScript SDK, `fish-audio`, is documented, but its published `Backends` type currently lags S2.1. Direct REST avoids that mismatch. [JavaScript reference](https://docs.fish.audio/api-reference/sdk/javascript/api-reference)

**Use Azure standard Neural as the inexpensive phoneme-controlled baseline.**

```http
POST https://eastus.tts.speech.microsoft.com/cognitiveservices/v1
Ocp-Apim-Subscription-Key: <SPEECH_RESOURCE_KEY>
Content-Type: application/ssml+xml
X-Microsoft-OutputFormat: riff-24khz-16bit-mono-pcm
User-Agent: junyan-voice-bakeoff
```

The result is binary WAV audio. Retrieve available regional voices from `GET https://eastus.tts.speech.microsoft.com/cognitiveservices/voices/list`. [REST reference](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech)

Mandarin’s SAPI notation separates the syllable from its tone number:

```xml
<speak version="1.0"
       xmlns="http://www.w3.org/2001/10/synthesis"
       xml:lang="zh-CN">
  <voice name="zh-CN-XiaoxiaoNeural">
    <phoneme alphabet="sapi" ph="ni 2 hao 3">你好</phoneme>，
    来<phoneme alphabet="sapi" ph="yi 2 ge 5">一个</phoneme>包子。
  </voice>
</speak>
```

The supported alphabet is **`sapi`**, not `pinyin`; neutral tone is `5`. The example above deliberately supplies spoken sandhi tones. [Mandarin phoneme notation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-ssml-phonetic-sets?tabs=zh-CN#zh-cn), [SSML phoneme element](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation)

Audition `zh-CN-XiaoruiNeural` for the grandmother, `zh-CN-YunxiNeural` for the office worker, `zh-CN-XiaoshuangNeural` for the child, and `zh-CN-XiaoxiaoNeural` for the teacher. These are candidate assignments, not assessed character fits. Microsoft specifically lists Xiaoshuang as a child voice. [Voice inventory](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)

**The bake-off should separate pronunciation control from character performance.**

1. **Lock four voices per provider.** Store one ID for 王奶奶, 小李, 小朋友, and 张老师. Use separate grandmother and child voices initially; test shared voices with pitch/rate adjustments only as an additional experiment.
2. **Render the same 20 lines twice per provider:** plain Hanzi and controlled pronunciation. That produces **120 main clips**, with five lines assigned to each character.
3. **Blind-review matched clips.** Randomize provider labels, use consistent playback loudness, and have one or preferably two native speakers mark target pronunciation pass/fail, naturalness 1–5, and character fit 1–5. A roughly 30-minute review session is a reasonable initial allowance.
4. **Select on pronunciation first.** Require every teaching target to pass after reviewed corrections, then compare naturalness and character fit. Record failed first takes and rerender costs. Add MiniMax Turbo or Fish Drama 3 only if the main comparison leaves a useful question unanswered.

**The TypeScript script should compile pronunciation data into provider-specific requests.** It should not infer polyphone readings during synthesis.

Proposed invocation:

```sh
npx tsx scripts/bake-voices.ts \
  --lines lines.json \
  --cast voices.json \
  --providers minimax,fish,azure \
  --variants plain,controlled \
  --out generated/voices \
  --dry-run
```

Removing `--dry-run` performs rendering. A dry run validates input, resolves cache hits, and prints estimated usage without requiring synthesis credentials.

The input contract:

```ts
type Character = "grandmother" | "office_worker" | "child" | "teacher";

type Token = {
  hanzi: string;
  pinyin: string[];        // Expected spoken pronunciation; numbered tones 1–5.
  lexicalPinyin?: string[]; // Optional dictionary form, kept separately.
  override?: boolean;     // Compile this token into pronunciation markup.
};

type Line = {
  id: string;
  character: Character;
  text: string;
  tokens: Token[];
};

type LinesFile = {
  schemaVersion: 1;
  locale: "zh-CN";
  lines: Line[];
};
```

Example:

```json
{
  "id": "T03",
  "character": "child",
  "text": "来一个包子。",
  "tokens": [
    { "hanzi": "来", "pinyin": ["lai2"] },
    {
      "hanzi": "一个",
      "pinyin": ["yi2", "ge5"],
      "lexicalPinyin": ["yi1", "ge4"],
      "override": true
    },
    { "hanzi": "包子", "pinyin": ["bao1", "zi5"] },
    { "hanzi": "。", "pinyin": [] }
  ]
}
```

`pinyin` means the intended **spoken** form. Ordinary learning-material pinyin often retains dictionary tones even when speech changes them; preserve that separately. Third-tone sequences depend on phrasing, so a blanket “replace every third tone before another third tone” pass is insufficient for arbitrary sentences. [University of Texas pronunciation guide](https://laits.utexas.edu/ppp/learning.php), [Open University sandhi explanation](https://www.open.edu/openlearn/mod/oucontent/view.php?id=108532&section=_unit2.4)

The script’s processing rules:

1. **Validate and normalize.** Normalize Unicode to NFC; require unique IDs, a configured character voice, exact concatenation of token Hanzi to `text`, and 3–30 spoken Hanzi. Require explicit tone digits. Punctuation has an empty pinyin array. For this dataset, require one syllable per Hanzi; reject unsupported alignments such as unmodelled erhua instead of guessing.
2. **Compile each variant.** Plain preserves Hanzi. Controlled converts tokens marked `override:true`, plus tokens whose supplied lexical and spoken arrays differ. Mark every requested polyphone and sandhi target in the test data.
3. **Build and hash the complete render recipe.** Include provider, endpoint/region, exact model, voice ID/revision, reference-audio digest where applicable, source text, pronunciation data, variant, final request body, audio settings, adapter version, and take number.
4. **Reuse or render.** A valid cache hit requires matching metadata and audio checksum. On a miss, queue the request, validate its result, and commit audio plus metadata atomically.
5. **Record every attempt.** Preserve usage, estimated or reported cost, elapsed time, provider request IDs, errors, and any retry. Produce a manifest mapping each line/provider/variant to its artifact.

Core pronunciation compilation:

```ts
function pinyinMarkup(
  token: Token,
  provider: "minimax" | "fish" | "azure",
): string {
  const syllables = token.pinyin;

  if (provider === "minimax") {
    return syllables.map(s => `(${s})`).join("");
  }

  if (provider === "fish") {
    return syllables
      .map(s => `<|phoneme_start|>${s}<|phoneme_end|>`)
      .join("");
  }

  // Input is already validated. escapeXml handles XML special characters.
  const phones = syllables
    .map(s => s.replace(/([1-5])$/, " $1"))
    .join(" ");

  return `<phoneme alphabet="sapi" ph="${escapeXml(phones)}">` +
    `${escapeXml(token.hanzi)}</phoneme>`;
}
```

The Azure adapter additionally needs a validated spelling map for its phone inventory—for example, `ü` uses `v` in the documented SAPI set. MiniMax/Fish spellings involving ü and erhua should receive explicit adapter fixtures before use; the test set below avoids them.

For MiniMax, expose an optional dictionary mode:

```ts
const rule = `${token.hanzi}/${token.pinyin.map(s => `(${s})`).join("")}`;
```

Use it only when keys are unambiguous and non-overlapping within that request. If the same surface form needs different readings, fall back to positional inline markup. **Never create a corpus-wide rule such as `还/(hai2)`**: test line T20 requires both readings.

A suitable cache layout is:

```text
generated/voices/
  objects/<recipe-sha256>/audio.wav
  objects/<recipe-sha256>/metadata.json
  manifests/<run-id>.json
  attempts/<run-id>.jsonl
```

Use SHA-256 over canonical JSON with sorted object keys and preserved array order. Exclude line IDs, credentials, timestamps, and prices from the recipe hash; they do not affect sound. Store a separate SHA-256 of the audio bytes.

A cache guarantees reuse of an existing take, not deterministic provider output. New audition takes increment `take`; provider/model changes can increment a configured render revision. Never overwrite an approved take.

For response handling, MiniMax must pass both HTTP status checks and `base_resp.status_code === 0`; require nonempty completed audio before decoding hex. Fish and Azure responses must decode as the requested audio format. Validate duration and reject empty or corrupt output. [MiniMax response schema](https://platform.minimax.io/docs/api-reference/speech-t2a-http)

Start with two concurrent requests per provider. For standard MiniMax pay-as-you-go, pace below 60 RPM, such as 50 RPM; use the actual account allowance when lower. Retry explicit throttling and transient failures with bounded exponential backoff and jitter. Record timeouts after submission as **possibly charged**; a local content hash does not provide server-side idempotency.

**Cost accounting must distinguish estimates from reported usage.**

| Provider | Before rendering | After rendering |
|---|---|---|
| MiniMax | Record source and compiled character counts; retain the unresolved international Hanzi multiplier | Use `extra_info.usage_characters × published_rate / 1e6`; retain `usage_voice_count` when present |
| Fish | `Buffer.byteLength(compiledText, "utf8") × byte_rate / 1e6` | Retain this as an estimate unless independently reconciled |
| Azure | Count the billable SSML fragment, with Hanzi weighted twice; exclude `<speak>` and `<voice>` wrappers | Retain as an estimate until reconciled with Azure usage |

MiniMax distinguishes billable `usage_characters` from informational `word_count`. Fish’s published TTS success schema does not expose a per-request billing counter. [MiniMax schema](https://platform.minimax.io/docs/api-reference/speech-t2a-http), [Fish schema](https://api.fish.audio/openapi.json)

**Markup can change the effective price substantially.** Fish documents input-text bytes but does not clearly establish whether pronunciation/control markup is excluded from billing. Budget the actual compiled text conservatively and mark that assumption. Azure explicitly bills SSML markup other than the two wrapper elements. Consequently, the comparison’s $45 and $30 figures are **plain-Hanzi prices**, not guaranteed costs for fully annotated requests.

Each attempt record should contain:

```ts
type CostRecord = {
  unit: "character" | "utf8_byte";
  estimatedUnits: number | null;
  reportedUnits: number | null;
  ratePerMillion: string;
  currency: "USD";
  estimatedCost: string | null;
  reportedUsageCost: string | null;
  setupCost: string | null;
  billingStatus: "estimated" | "api_reported" | "reconciled" | "unknown";
  priceSourceUrl: string;
  priceCheckedAt: string;
};
```

Use decimal arithmetic or integer nanodollars; do not round individual lines to cents. Keep voice-creation charges separate. Cache hits incur zero new cost while retaining the artifact’s original generation cost. Count unsuccessful or discarded takes in the run total, with unknown charges explicitly flagged.

**The 20-line test set uses expected spoken pinyin.** Tone `5` is neutral. Slashes separate tokens; punctuation remains in `text` and becomes separate empty-pinyin tokens in JSON. These are proposed standard-Mandarin targets for native-speaker sign-off.

| ID | Character | Chinese line | Expected pinyin per token |
|---|---|---|---|
| T01 | Teacher | 你好，来一杯茶。 | 你好 `ni2 hao3` / 来 `lai2` / 一杯 `yi4 bei1` / 茶 `cha2` |
| T02 | Grandmother | 老板，来一碗粥。 | 老板 `lao2 ban3` / 来 `lai2` / 一碗 `yi4 wan3` / 粥 `zhou1` |
| T03 | Child | 来一个包子。 | 来 `lai2` / 一个 `yi2 ge5` / 包子 `bao1 zi5` |
| T04 | Office worker | 不是冰的，要热的。 | 不是 `bu2 shi4` / 冰 `bing1` / 的 `de5` / 要 `yao4` / 热 `re4` / 的 `de5` |
| T05 | Child | 不喝茶，要豆浆。 | 不 `bu4` / 喝 `he1` / 茶 `cha2` / 要 `yao4` / 豆浆 `dou4 jiang1` |
| T06 | Grandmother | 一杯豆浆，一个馒头。 | 一杯 `yi4 bei1` / 豆浆 `dou4 jiang1` / 一个 `yi2 ge5` / 馒头 `man2 tou5` |
| T07 | Office worker | 这样行吗？ | 这样 `zhe4 yang4` / 行 `xing2` / 吗 `ma5` |
| T08 | Teacher | 银行就在对面。 | 银行 `yin2 hang2` / 就 `jiu4` / 在 `zai4` / 对面 `dui4 mian4` |
| T09 | Office worker | 今天得上班。 | 今天 `jin1 tian1` / 得 `dei3` / 上班 `shang4 ban1` |
| T10 | Grandmother | 包子做得真香。 | 包子 `bao1 zi5` / 做 `zuo4` / 得 `de5` / 真 `zhen1` / 香 `xiang1` |
| T11 | Teacher | 这次得分很高。 | 这次 `zhe4 ci4` / 得分 `de2 fen1` / 很 `hen3` / 高 `gao1` |
| T12 | Child | 我吃完了。 | 我 `wo3` / 吃 `chi1` / 完 `wan2` / 了 `le5` |
| T13 | Teacher | 现在了解了。 | 现在 `xian4 zai4` / 了解 `liao2 jie3` / 了 `le5` |
| T14 | Grandmother | 还要一根油条。 | 还 `hai2` / 要 `yao4` / 一根 `yi4 gen1` / 油条 `you2 tiao2` |
| T15 | Child | 杯子明天还。 | 杯子 `bei1 zi5` / 明天 `ming2 tian1` / 还 `huan2` |
| T16 | Child | 我要长高。 | 我 `wo3` / 要 `yao4` / 长高 `zhang3 gao1` |
| T17 | Office worker | 队伍太长了。 | 队伍 `dui4 wu5` / 太 `tai4` / 长 `chang2` / 了 `le5` |
| T18 | Grandmother | 这个袋子太重了。 | 这个 `zhe4 ge5` / 袋子 `dai4 zi5` / 太 `tai4` / 重 `zhong4` / 了 `le5` |
| T19 | Teacher | 请重新说一遍。 | 请 `qing3` / 重新 `chong2 xin1` / 说 `shuo1` / 一遍 `yi2 bian4` |
| T20 | Office worker | 还要一杯，杯子明天还。 | 还 `hai2` / 要 `yao4` / 一杯 `yi4 bei1` / 杯子 `bei1 zi5` / 明天 `ming2 tian1` / 还 `huan2` |

T13’s dictionary reading is `liao3 jie3`; its spoken target is `liao2 jie3`. Likewise, 你好 and 老板 retain third tones in ordinary dictionary transcription but have rising first syllables here. 一个 uses conversational `yi2 ge5`; an emphasized `ge4` can also be natural, but should be a separately labelled condition. Tone `3` elsewhere does not require an exaggerated full dipping contour in connected speech. [Sandhi and phrasing reference](https://laits.utexas.edu/ppp/learning.php)

**Still unconfirmed by actual synthesis:** override adherence, whether supplied surface tones undergo further sandhi processing, naturalness under dense markup, and voice consistency across short lines. Those are the bake-off’s measurements—not guarantees established by the API documentation.
## Related

- [[tickets/0008-voice-bake-off]]
- [[research-ai-assets]]
- [[decisions/0001-first-language]]
