# Junyan: shared agent instructions

Read by Claude Code (via `CLAUDE.md`) and Codex. Keep it short; detail lives in `docs/`.

## Read first
- The assigned ticket in `docs/tickets/` and `docs/tickets/README.md`.
- `docs/ideas/build-recommendation.md`, especially "The stack" and "Art direction".
- `docs/decisions/0001-first-language.md` and `docs/decisions/0002-platform-stack-and-art.md` (both accepted).
- `docs/design/`: the chosen mock-up and the design system tokens. Ideas are exploratory; accepted decisions govern.

## What the game is
A cozy Mandarin-learning web game. The player runs a breakfast stall (早餐店); customers order in Mandarin only, voiced; the player hands over items and change; a receipt and the customer's reaction confirm. No English, no pinyin on screen (pinyin only on tap), every Chinese line is tappable word tokens, a journal collects words, four regulars return, a day has light and a tally. Learning is a side effect of a game that must be fun on its own.

## Architecture rules (not optional)
- Game rules are pure functions over explicit state; inject RNG and time. Test them without React, DOM, storage or network.
- Rendering stays thin: render state, dispatch actions, no hidden rules in components.
- Content is schema-validated JSON (Zod). Lines are pre-segmented into tokens `{hanzi, pinyin, gloss, audio}`; the UI never segments.
- Dialogue, vocabulary, signs and prices are real DOM text. Never Chinese text inside images or canvas-only text.
- Deterministic test hooks: `?test=1&seed=42` and `window.__TEST__` (gated to dev/test builds).
- First slice: offline content and audio in the repo, IndexedDB saves, no backend.
- Design: `docs/design/tokens.json` and `tokens.css` are the source of truth. Accent (vermilion) only ever touches words: the new-word dot and the 多谢 chop. Never a tick, never a green "correct". Touch targets 44px. Respect reduced motion.

## Stack
TypeScript, Vite, React, DOM for all dialogue and UI, layered PNG/SVG with CSS animation for the scene (PixiJS only if a later town needs it), Vitest for rules, Playwright for the journey. pnpm. Node 22.

## Git and worktrees
- One ticket and one writer per branch and worktree. Branches `codex/NNNN-slug` or `claude/NNNN-slug`.
- Never `git stash`; keep unfinished work as a WIP commit. Never touch another agent's worktree. Remove finished worktrees with `git worktree remove`, no force.
- Serialize changes to shared schemas, dependencies, lockfiles and these instructions.
- Reserve new ticket numbers centrally (highest + 1) before parallel work.

## Tickets
- `docs/tickets/NNNN-short-slug.md` with the frontmatter in `docs/tickets/README.md`. Statuses: todo, doing, blocked, done. Never move files by status.
- Set `doing` when starting; record owner, branch, worktree, port and progress in Notes; set `done` in the change that completes it, with what was learned.
- Discovered work becomes a new ticket, not scope creep.

## Verification
- Until scaffolding exists, report missing commands; never claim a check passed that did not run.
- For game changes: rules tests green, the Playwright journey green (open, serve three customers, give change, journal a word), screenshots at phone and desktop widths inspected, console clean.
- Each worktree has its own explicit Vite port with `strictPort: true`; Playwright points at that port.

## Review
- Cross-review before merge: a reviewer reports defects with file and line, impact, evidence and missing tests, and does not edit. Fixes return to the writer. Merge after findings are resolved and checks pass.

## Research
- File research in `docs/ideas/research-<topic>.md` with YAML frontmatter (title, created, status: draft, tags), primary URLs inline, unverified claims marked. Costly-to-reverse choices are proposed in `docs/decisions/`; Callum accepts them.
