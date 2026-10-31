---
id: 6
title: Build the breakfast-stall vertical slice as a web game
status: todo
priority: high
type: feature
created: 2026-10-31
---

## Why

The first playable. Everything so far is research, a decision, and a kit nobody has played. A one-screen stall that Callum can open on a phone and play for twenty minutes answers the questions the paper prototype was meant to answer, and proves the stack, the content pipeline and the art formula at once.

Blocked on [[decisions/0002-platform-stack-and-art]] being accepted.

## Done when

- A Vite + React + TypeScript app on a branch, deployable as a static site and installable as a PWA, with no backend.
- One counter screen: background plate with time-of-day grade and at least two ambient layers (steam, passers-by or rain), four regulars with portraits and three or more expressions each, twelve item cards, a price board rendered by the engine in LXGW WenKai.
- The orders loop from [[ideas/prototype-counter-kit]]: customer arrives, line shown as per-word DOM tokens and voiced; player hands over items and change; receipt confirms; customer reacts; day ends with a tally.
- A journal: tap a word for its picture and audio; taps logged to the word model in IndexedDB.
- A first director: pure function that picks the next visit from the word model so each word is re-encountered across visits and the unknown share stays near one in twenty.
- Content: lines generated offline with the ticket 3 pipeline plus a judge pass, segmented into tokens, voiced with MiniMax, committed as JSON and audio.
- Rules under Vitest; a Playwright journey (open, serve three customers, give change, journal a word) green; screenshots at phone and desktop widths.
- Callum plays it and fills in [[ideas/prototype-counter]] from that session.

## Notes

- Architecture rules in [[ideas/build-recommendation]] ("The stack"): pure rules, JSON content, test hooks, thin rendering. These are not optional.
- Assets come from ticket 7; stub with placeholders until they land.
- Claude Code (Opus) writes the code; Codex reviews before merge.
- Split into sub-tickets if it grows: scene and UI, content pipeline, director, journal.
