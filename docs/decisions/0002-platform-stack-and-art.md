---
id: 2
title: Web first, TypeScript and DOM dialogue, illustrated 2D
status: accepted
created: 2026-10-31
tags: [decision, platform, stack, art]
---

# Web first, TypeScript and DOM dialogue, illustrated 2D

Status: **accepted** on 2026-10-31. Callum reviewed five mock-up directions on the design board, chose direction 1 (Morning Steam, after an unslop pass) and asked for the MVP to be built on this stack with Codex workers orchestrated by an Astra model and Claude Code reviewing; the acceptance is implied by that instruction rather than stated word for word.

## Context

Callum wants a playable, good-looking MVP built mostly by coding agents (Claude Code for code, Codex for research and review), that can scale to many players cheaply, and asked whether it should be pixel art, a 3D engine such as Unreal, or a web game, and whether to ship web or mobile. The research is in [[ideas/build-recommendation]] and the four notes it cites.

The facts that decide it: the core interaction is tapping a Chinese word inside a dialogue line, which DOM text does for free and every canvas engine makes manual; coding agents can run, test and screenshot a browser game with no human in an editor, and cannot do that for Unity or Unreal; web-wrapped games are routinely on Steam, so web first keeps Steam and the app stores open; illustrated 2D is what AI image models produce cleanly and pixel art is what they produce worst; the setting (a Chinese breakfast stall) has two 2026 Steam precedents and no direct competitor.

## Decision

1. **Platform sequence:** web first, on our own domain, as a PWA. Steam via Electron and steamworks.js once retention shows, with a Steam page opened early. iOS and Android via Capacitor last, only if demand is proven.
2. **Stack:** TypeScript end to end. React and DOM for all dialogue and UI; layered PNGs with CSS animation for the scene, PixiJS only if a later town needs a renderer. Vite, Vitest, Playwright. Content as Zod-validated JSON with lines pre-segmented into tokens. Game rules as pure functions over state with simulation tests; rendering stays thin.
3. **Backend:** none for the first slice (content and audio generated offline and committed; player state in IndexedDB). Then Supabase for auth and the word model, a Cloudflare Worker cron for nightly generation, R2 for content-addressed audio, a Worker proxy for any live model call.
4. **Art direction:** clean-line illustrated 2D with flat shading, a fixed palette, a visible ink line and one unifying post-filter. One counter screen in the VA-11 Hall-A / Coffee Talk / Strange Horticulture formula: one polished background with ambient layers, waist-up portraits with a few expressions and layered blink/talk/hand-over, item cards, a dialogue box. No Chinese text in generated images; the engine renders all signage. AI use disclosed on every store page.
5. **Asset tools:** Nano Banana or gpt-image for images with one character sheet per cast member and edit-in-place for expressions; MiniMax Speech 2.8 for Mandarin TTS (pinyin tone overrides), Fish Audio as the A/B; licence-clean music and SFX only.
6. **Agent workflow:** one ticket per branch, one worktree per agent, shared `AGENTS.md` and `CLAUDE.md` from one source, cross-review by the other agent before merge, a rules test suite and a Playwright journey that must stay green. Amended 2026-10-31: for the MVP build, Codex (gpt-6.1-sol) workers write code under a Codex (gpt-6-astra) orchestrator, with Claude Code reviewing; the research-and-review split in [[ideas/research-agent-workflow]] is the fallback.

## Consequences

- The MVP is reachable in weeks, not months, and is playable on a phone from a link. Feedback starts early.
- We give up an engine's structure. The architecture rules (pure rules, JSON content, test hooks) are load-bearing and go into the agent instructions on day one; the research is explicit that without them agent-built code sprawls.
- We give up native performance and a native feel on mobile. For a counter game this costs nothing now; a walking-around town would be the point to reconsider PixiJS or Godot.
- Monetisation on web is weak. This is a decision about the loop and the first players, not revenue; Steam remains the revenue platform for this genre.
- Hosting is near zero. The recurring cost is model and TTS inference per player, which the nightly batch, content-addressed audio and a cheap model tier keep to cents per player per month.
- Art consistency is a process, not a purchase: style bible, character sheets, rubric acceptance, one filter. Budget retakes.
- Supersedes nothing. Revisit if the game needs free movement, real-time play, or console ports.
