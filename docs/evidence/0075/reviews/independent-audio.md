# Independent neighbourhood audio review

Verdict: PASS for tooling, asset inventory, provenance and signal screening. Native Mandarin listening/tones/naturalness remain unapproved; no physical speakers were used.

Reviewed source HEAD: `67b212bed2718b9529e638a8085ef7c4e75b839e`. No source edits; exact tooling SHA256 values are in final-source-checks.json and equal the initial checkpoint.

- Both stdlib self-checks passed. Independent adversarial fixtures rejected altered text, preset, pronunciation, digest, generator version, SHA and truncated WAV; rejected SHA propagation and scratch four-feature retake/archive checks passed.
- 634 raw nested references resolve to 313 stable URLs: 278 feature WAVs and 35 references to shared canonical files. Feature WAV inventory: apartment47, cats85, repairs64, garden82. Exact full authored identity, SHA and WAV signal checks pass for every URL; all are mono PCM16 24kHz, without clipping/non-silent/duration failures.
- Runtime TypeScript exports were bundled using existing local esbuild and executed with actual Zod parsing/registration. All404 runtime audio URLs exist; all78 garden labels resolve to registered word audio. Runtime files remain outside the reviewed tree.
- All132 main audio/content/preset baseline paths are byte-identical. Full exact asset and manifest hashes are in final-assets.json; final inventory SHA256 `5e28263cae34e541867955e1b66010a894710da206f98d16877ad8d4bf2f8bbb`.
- All15 rejection receipts have matching archived WAV hashes and matching archived provenance identities. No rejected SHA appears in any current public/audio WAV. Feature provenance has bounded attempts (1–8 per take), actual sequential seeds in rounds0–2, engine packages and Python version; cached aliases retain source receipt metadata.
- Independent unprompted offline CPU Whisper-small at revision `973afd24965f72e36ca33b3055d56a652f456b4d` screened four current retakes: welcome→桌子和椅子给你; final-round gift SHA`971dfc1ae522c0e8347cc7c94aec1985540b393a079ded55b42d353fa2b00dbb`→这个给你; white cat→小白; lamp-tight→登泡凝锦呢?再试试! (close phonetic uncertainty, not a proven wrong-speech defect). No expected-text prompt or upload; models already cached. Details in asr-selected.json.

No actionable source or byte/provenance defects found. ASR and signal results are screens, not native listening approval. Parent owns browser playback/demos and final commit integration. Re-run final-assets.py if owner changes audio bytes again.
