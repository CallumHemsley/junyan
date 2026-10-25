# Junyan

Early setup. The plan hasn't been written down yet, so don't scaffold an app or pick a stack until it's in `docs/ideas/` and the choice lands in `docs/decisions/`.

## Layout

- `docs/tickets/` — the backlog. Conventions in `docs/tickets/README.md`.
- `docs/ideas/` — exploratory notes and research.
- `docs/decisions/` — decisions that are costly to reverse.

`docs/` doubles as an Obsidian vault, so keep notes as plain Markdown with YAML frontmatter.

## Working on a ticket

1. Set `status: doing` when you start.
2. Do the work on a branch, one ticket per branch.
3. Set `status: done` in the same change that completes it, and note anything learned in the ticket.
4. New work you discover becomes a new ticket, not scope creep.

## Tooling

pstack is enabled for this project (`.claude/settings.json`). Use `/pstack:poteto-mode` for anything that needs rigor.
