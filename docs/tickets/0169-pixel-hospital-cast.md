---
id: 169
title: Draw the hospital opening's cast
status: todo
priority: high
type: feature
created: 2026-11-10
---

## Why

The opening's doctor, nurse, aunt, elder and the patient need sprites, including lying and sitting up in bed.

## Done when

- `char/doctor`, `char/nurse`, `char/aunt`, `char/elder`, `char/patient` with idle/walk, and `lie`/`sit-bed` for the elder and patient, per `docs/design/pixel-contracts.md`.
- `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
