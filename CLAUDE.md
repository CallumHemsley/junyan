@AGENTS.md

# Junyan (Claude-specific notes)

State as of 2026-10-31: research done, decisions 0001 (Mandarin first) and 0002 (web first, TypeScript and DOM dialogue, illustrated 2D) accepted, design direction chosen (`docs/design/`). The MVP build runs under `orchestration/RUNBOOK.md`: a Codex orchestrator with Codex workers; Claude Code reviews, researches and keeps `docs/` coherent.

## Layout

- `docs/tickets/` — the backlog. Conventions in `docs/tickets/README.md`.
- `docs/ideas/` — exploratory notes and research.
- `docs/decisions/` — decisions that are costly to reverse.
- `docs/design/` — the chosen mock-up and the design system.
- `spikes/` — throwaway experiments, never imported by the app.
- `orchestration/` — the MVP build runbook, scripts and logs.

`docs/` doubles as an Obsidian vault, so keep notes as plain Markdown with YAML frontmatter.

## Tooling

pstack is enabled for this project (`.claude/settings.json`). Use `/pstack:poteto-mode` for anything that needs rigor (user-invoked only).
