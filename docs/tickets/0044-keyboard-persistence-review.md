---
id: 44
title: Independently verify keyboard and immediate-reload fixes
status: todo
priority: high
type: chore
created: 2026-11-02
---

## Why

The 0037/0042 App changes alter keyboard handling and persistence. The immediate-reload case needs independent real-UI proof without waiting for IndexedDB.

## Done when

Review c1a4fb7 against its baseline, prove production no-wait reload on desktop/phone Chromium and silent-PCM WebKit, check blocked/aborted storage and keyboard/modal regressions, and return concrete findings or acceptance. No production edits by reviewer.

## Notes

- Owner: independent Sol 6.1 medium reviewer; branch/worktree recorded on start.
- Ports 5252 dev / 5253 preview, strict and owned. All browser testing silent: Chromium --mute-audio; WebKit valid silent PCM fixture. Never change system volume or WAVs.
- Preserve actual Pixel Plays, approved characters, all85WAVs and Mandarin-only calm UI. No push/deploy/AWS, dependencies or child agents.
