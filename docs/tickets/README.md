# Tickets

One Markdown file per ticket: `NNNN-short-slug.md`, numbered in order (take the highest number in this folder and add 1).

## Frontmatter

```yaml
---
id: 1
title: Short imperative title
status: todo        # todo | doing | blocked | done
priority: high      # high | medium | low
type: explore       # explore | feature | bug | chore
created: 2026-10-25
---
```

## Body

- **Why** — the problem or question, in a sentence or two.
- **Done when** — concrete, checkable outcomes.
- **Notes** — links to `[[ideas/...]]` or `[[decisions/...]]`, findings, open questions.

## Workflow

- Change `status` in the frontmatter as work moves; don't move files between folders.
- A PR that finishes a ticket sets `status: done` in the same change.
- In Obsidian, `Tickets.base` shows open tickets as a table.
