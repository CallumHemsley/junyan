# The four regulars

Casting follows the four voices Callum auditioned and approved on November 1, 2026. Ages and personalities below are fictional character direction, not claims about the people behind the voice presets.

| Character | Voice preset | Character direction | Pixel Plays appearance | Speech pattern |
| --- | --- | --- | --- | --- |
| 林姐, Lin Jie | Qwen Serena | Warm adult neighbour, thirties or forties; thoughtful and familiar | Sage shirt, dark hair in a bun | 我想要…; 麻烦你了，谢谢 |
| 小李, Xiao Li | Kokoro `zm_yunxi` | Young office worker, twenties; brisk, practical and polite | Blue work shirt, dark hair, tie | 来…; 谢谢，明天见 |
| 张老师, Zhang Laoshi | Qwen Uncle_Fu | Older retired teacher, sixties or seventies; mellow, precise and encouraging | Ochre shirt, silver hair, glasses | 请给我…; 慢慢来，再看看 |
| 小周, Xiao Zhou | Kokoro `zf_xiaobei` | Young adult student, around twenty; bright and sociable | Plum shirt, dark hair, jade backpack | 你好呀; 我要…; 谢谢你呀 |

The former 王奶奶 role is now 林姐 to suit Serena's adult voice. Order IDs, table numbers, prices and saved progress stay stable. Personality is conveyed through authored speech and appearance; nobody penalizes the player with a timer.

`src/content/content.json` holds character IDs, names, voice IDs, editorial personality notes, appearance and segmented greetings/reactions. Orders reference the character's unique name. `src/content/voices.json` holds reusable voice presets and the shared word-lookup voice (Serena). Full orders and reactions use their speaker's voice; dictionary word taps always use the same lookup voice.

The schema rejects unknown characters/voices and duplicate character IDs or names. The scene gets appearances from content rather than table-specific casts. Every spoken token, including greetings and reactions, opens a word card and can enter the journal. Chinese dialogue stays in the DOM; the scene continues to use the actual Pixel Plays software rasterizer.

See `docs/content-audio.md` for adding and generating content. Native Mandarin review of pronunciation and prosody remains pending; voice preference and technical WAV validation do not substitute for it.

## The opening cast

The hospital opening (decision 0004, variant A) has its own cast in `content.opening.cast`. Cast members have no appearance or accessory, so they are separate from the four regulars above. Each one names a Chinese preset and, for the doctor only, an English preset. Casting comes from `spikes/hospital-opening/voice/provenance.json`.

| Cast id | Name | Chinese preset | English preset | Role |
| --- | --- | --- | --- | --- |
| `doctor` | 王医生 | `ryan-zh` (Qwen Ryan) | `ryan-en` (Qwen Ryan) | Speaks the four English premise lines, then one Chinese line |
| `nurse` | 护士 | `vivian` (Qwen Vivian) | none | Answers the doctor once |
| `elder` | 老爷爷 | `uncle-fu-levelled` (Qwen Uncle_Fu) | none | The man in the next bed who asks for 豆浆 and 鸡蛋 |
| `aunt` | 小姨 | `serena-levelled` (Qwen Serena) | none | Asks the player to help at the shop tomorrow |

All five presets level to -20 dBFS active RMS with a -1 dBFS peak cap. The end title 第一天·早安小馆 and every word use the shared `wordVoice`. `spikes/hospital-opening/to-content.mjs` writes the opening into `src/content/content.json` from the spike script with every new audio path set to `/audio/pending.wav`. Run the pipeline with `--write-content` afterwards, which fills those paths from cache or generates the missing clips. Native Mandarin listening review of the opening clips is pending, as for every other clip.
