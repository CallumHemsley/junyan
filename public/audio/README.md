# Offline Mandarin prototype audio

Regenerate from the committed, pre-segmented `src/content/content.json` with
`node scripts/make-audio.mjs` on macOS with the installed `Tingting` (`zh_CN`)
voice. No network or paid service is used. Output is mono AAC in M4A containers.
Every food word, dialogue token and complete line has its own local clip;
repeated words share a stable recording and lookup ID.

Whole-line speech uses the concatenated authored Hanzi, allowing the synthesizer
to supply connected-speech prosody. Word pinyin uses dictionary tones; speech may
apply contextual tone sandhi. These are prototype recordings, not vendor-quality
or native-speaker-reviewed learning audio. All four regulars currently share the
same voice. The older counter audio was not reused because none of the newly
authored complete lines or individual words exactly match its recorded text.

`饺子` is ordered by the bowl; one game item is one bowl. `bread` denotes 馒头
(plain steamed bread), while `milk` denotes 豆浆 (soy milk). English glosses and
pinyin are lookup metadata for tap reveal, never parallel dialogue text.
