---
title: Build recommendation — platform, stack, art, workflow
status: draft
created: 2026-10-31
tags: [build, synthesis, recommendation]
---

# Build recommendation

What to build the MVP with, and why. Synthesis of four research notes: [[research-agentic-gamedev]], [[research-platform]], [[research-ai-assets]], [[research-visual-formula]]. The decision itself is proposed in [[decisions/0002-platform-stack-and-art]].

## The short version

**A web game, in TypeScript, with the dialogue in real DOM text and the stall as layered illustrated 2D.** Ship it as a URL and a PWA first. Wrap the same code for Steam with Electron later, and for the app stores with Capacitor last. Illustrated clean-line 2D with a fixed palette, not pixel art and not 3D. Claude Code writes the code, Codex does research and review, one worktree per ticket. The first slice is the breakfast stall from the prototype kit, playable in a browser in a few weeks, with no backend at all.

## Why not Unreal, Unity or pixel art

- **Unreal and Unity** are built for real-time 3D and live in a GUI editor. Agents cannot run, test or screenshot them without a human in the editor, Unreal's Blueprints are binary, and a breakfast stall has no physics, camera or lighting problem that needs them. Every practitioner who tried both Unity and Godot with Claude Code moved to Godot. ([[research-agentic-gamedev]] §2)
- **Godot** is the right native engine and the fallback if this becomes a walking-around town game. But Godot's C# cannot export to the web at all, its headless mode cannot render for screenshots, and its text rendering needs manual work for per-word taps on Chinese. ([[research-agentic-gamedev]] §2, [[research-platform]] §2)
- **Pixel art** is the style AI generates worst (off-grid, palette drift, cleanup that takes longer than drawing), and its audience is the most hostile to AI art. Illustrated 2D is the native output of every frontier image model and tolerates edit-in-place consistency work. ([[research-ai-assets]] §2)
- **3D diorama** is harder, not easier, to make cohesive with AI: generators bias to realism, every mesh needs cleanup, and cohesion in Unpacking or A Short Hike comes from one artist's eye. ([[research-ai-assets]] §5)

## Why web, and what "scalable" actually buys

Three things point the same way:

1. **The core interaction is tapping a Chinese word inside a dialogue line.** DOM text gives that for free: word segmentation is built into browsers, per-word tap targets are spans, pinyin-on-tap is CSS ruby, fonts are sliced so only used glyphs download. Every canvas engine makes this manual, and PixiJS's own docs say bitmap text is a poor fit for CJK. ([[research-platform]] §2)
2. **The agent loop is best in a browser.** Playwright gives screenshots, accessibility snapshots (the agent reads the real text, not pixels), console and network logs, with no custom tooling. Every shipped Codex-built game found was a browser game. Deploy is a git push. ([[research-agentic-gamedev]] §3)
3. **Web is the cheapest path to a player and the right base to wrap.** A URL has no install, no store cut, instant updates, and runs on phone and desktop. Web-wrapped games are routinely on Steam (Cookie Clicker, CrossCode, Vampire Survivors before 1.6). The reverse direction, native first then web, is the expensive one. ([[research-platform]] §1, §3, §5)

What web does **not** buy is money. Web conversion for small language products is single digits, portals want arcade loops, and Steam is where language games have actually sold (Wagotabi, Shashingo). So: web for the loop and the first hundred players, a Steam page early for wishlists, Steam via Electron when retention shows, mobile last because Apple's "repackaged website" rule and the store cut make it the most friction for the least certainty. ([[research-platform]] §1, §6)

## The stack

| layer | choice | why |
|---|---|---|
| language | TypeScript | strongest priors for both agents; one language front to back |
| UI and dialogue | React + DOM, Vite | per-word spans, ruby, CJK line breaking, IME, accessibility, Playwright snapshots read real text |
| scene | layered PNGs with CSS animation first; PixiJS only if a town needs it | a single counter screen with portraits does not need a renderer |
| content | JSON validated with Zod; one schema for lines, segmented into `{hanzi, pinyin, gloss, audio}` tokens at generation time | agents can edit and test it; the UI never segments |
| game rules | pure functions over state, with simulation tests | the one thing every agent-built-game postmortem says: deterministic rules, thin rendering |
| tests | Vitest for rules, Playwright for the loop (`?test=1&seed=42`, `window.__TEST__` hooks) | the agent verifies without a human |
| v0 backend | none: content and audio generated offline and committed, player state in IndexedDB | the first slice needs one player |
| v1 backend | Supabase (auth, Postgres word model), Cloudflare Worker cron for the nightly batch, R2 for audio keyed by content hash, a Worker proxy for any live call | cheap, serverless, zero-egress audio |
| fonts | LXGW WenKai for dialogue and the price board, Noto Sans CJK Medium for chrome, 28 px and up for Chinese | both OFL; never the engine default CJK fallback |

The main risk of this stack is the one the research names: a DOM/canvas hybrid has no engine to impose structure, so without strict data-driven architecture the agents produce sprawl. Mitigation is the rules-as-pure-functions, content-as-JSON, test-hooks discipline from day one, written into the repo's agent instructions.

## Art direction

**Formula:** VA-11 Hall-A and Coffee Talk's layout (one polished background, waist-up portraits, dialogue box) on a Strange Horticulture single counter screen. Those were made by three or four people with Photoshop; a four-character slice is about three weeks for a skilled pixel artist, and six to ten days AI-assisted. ([[research-visual-formula]] §1, §6)

**Style:** clean-line illustrated 2D, flat or cel shading, a fixed palette of about 28 colours sampled from reference photos, a visible ink line, and one post-filter (paper grain or slight pixelation) applied to everything so AI drift reads as style. Not clean anime, which exposes AI flaws and reads as generic. ([[research-ai-assets]] recommendation, [[research-visual-formula]] §4, §5)

**Setting:** a 早餐店 on a cold morning street. Steamer baskets, soy milk in cups and bowls, youtiao lifted with tongs, a hand-written price board, a 老板娘. Reference aesthetics image models render well: Taiwanese breakfast shop (stainless griddle, roller shutter, plastic stools), or 90s Lingnan morning haze. Two 2026 Steam games prove the setting sells (Herb Tea Man 92%, Chinese Street Food Legend 98%); no breakfast-stall dialogue game exists. ([[research-visual-formula]] §3)

**Rules that follow from what AI cannot do:**
- Never put Chinese text in a generated image. Every sign, menu and price is rendered by the engine. The price board becomes live vocabulary UI.
- One character sheet per cast member, every expression as an edit of that sheet with the sheet attached, never switch tools mid-series, accept with a rubric.
- Portraits: 4 regulars × 5 expressions, layered body / eyes / mouth / arm for blink, talk and hand-over. Strangers assembled from parts, Papers Please style.
- Background: one plate at noon, dawn and evening by colour grade, with separate steam, rain, light and passer-by layers. Liveness is ambient layers, not more art. Add a cat.
- Disclose AI use on every store page, specifically.

**Tools:** Nano Banana (Pro for sheets, 2.1 for edits) or gpt-image-2.5 for portraits, items and plates; transparent output from OpenAI or rembg; a Scenario style LoRA once 20 images are approved; Stable Audio 3 or ElevenLabs Music for beds, ElevenLabs SFX or freesound CC0; MiniMax Speech 2.8 for Mandarin TTS because it takes a pinyin tone dictionary and inline tone overrides, with Fish Audio S2 Pro as the A/B and CosyVoice 3 as the self-hosted fallback. The whole script's audio costs under twenty dollars. ([[research-ai-assets]] §1, §6)

## The working agreement for two agents

- Claude Code (Opus) writes the game code. Codex does research, review and well-specified side tasks. Both read the same `docs/`; the backlog stays in `docs/tickets/`.
- One ticket per branch, one worktree per agent, never `git stash`, `strictPort` on dev servers, cross-review by the other agent before merge (`codex review`, or a diff piped to `claude -p`). ([[research-agentic-gamedev]] §3)
- A short `AGENTS.md` and `CLAUDE.md` generated from one source, pointing at the architecture rules above and at the content schema.
- A rules-only test suite the agents must keep green; a Playwright journey ("open, serve three customers, give change, journal a word") run before every merge.

## The MVP

"The breakfast stall, day one." One screen. The 45 words and four regulars from [[prototype-counter-kit]] as the content spec. Orders loop: customer arrives, says a line (text and audio), player hands over item cards and change, receipt confirms, customer reacts. A day cycle with time-of-day light and a closing tally. The journal: tap a word to see its picture and hear it again; a tap is logged. A first director: schedules re-encounters of each word across visits and keeps the unknown share near one word in twenty. Lines pre-generated offline with the ticket 3 pipeline plus a judge pass, voiced with MiniMax, committed as JSON and audio. Playable in a phone browser and on desktop, installable as a PWA, no account, no backend.

Done when Callum plays it for twenty minutes and it feels like a game, and the questions in [[prototype-counter]] can be answered from that session.

## Open questions

- React versus Solid or Svelte: React is the safe pick for agent priors; nothing here needs React specifically.
- Whether the stall scene wants PixiJS at all. Start without it.
- Which image model holds our four faces best. Decided by generating all four in two models and scoring with the rubric, not by reading.
- MiniMax versus Fish for the voices. Decided by rendering the same twenty lines, including polyphones and tone sandhi, and a native blind rank.

## Related

- Fact-check of the four notes this draws on, with corrected prices and narrower policy wording: [[research-factcheck-2026-10-31]]
- Codex specs for the follow-on tickets: [[research-agent-workflow]], [[research-image-pipeline]], [[research-voice-pipeline]]
- [[vision]], [[design-directions]], [[spike-constrained-generation]]
- [[decisions/0001-first-language]], [[decisions/0002-platform-stack-and-art]]
