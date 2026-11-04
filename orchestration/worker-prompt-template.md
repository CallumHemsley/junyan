# Worker prompt template

Fill every bracket. Keep it under 120 lines. Paste it to `orchestration/prompts/<ticket>.md`.

```
You are implementing one ticket of the Junyan MVP in your own git worktree. Work only inside it.

Read first: AGENTS.md; docs/tickets/[NNNN-slug].md (your ticket); docs/design/design-system.md and docs/design/tokens.css; [the two or three other docs this ticket needs, by path]. The mock-up at docs/design/mockups/morning-steam-desktop.dc.html is the layout and palette reference.

Ticket: [paste the ticket's Why and Done when].

Your paths (you own these; do not edit anything else): [list of files and folders].
Interfaces you must keep: [types, schema files, function signatures other tickets rely on].
Your Vite port: [518X]. Set `server.port` to it with `strictPort: true`; point Playwright's baseURL at it.

Rules that fail review if broken: Chinese only in the UI, no pinyin on screen, no English except the hospital opening's premise lines that decision 0004 bounds; accent colour only on the new-word dot and the 多谢 chop; rules pure and tested; real DOM text for Chinese; tokens from tokens.css, never ad hoc colours; 44px touch targets; respect prefers-reduced-motion; no paid APIs; no global installs.

Do not run git commit (your sandbox cannot write .git; the harness commits your work when you finish). Run `pnpm verify` (or the subset that exists: typecheck, test, build) before you finish. If something you need is missing from another ticket, stub it minimally behind the agreed interface and say so in your final message.

When done: set the ticket's status to done in docs/tickets/[NNNN-slug].md with a Learned section (what you built, what you stubbed, what is unverified), and reply with: what you built, how you verified it (exact commands and results), what is stubbed, and anything the reviewer should look at first.
```
