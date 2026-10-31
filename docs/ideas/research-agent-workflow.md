---
title: Research — Claude Code and Codex working agreement
status: draft
created: 2026-10-31
tags: [research, workflow, agents, codex]
---

> Produced by OpenAI Codex (gpt-6-astra, xhigh) via `codex exec` with live web search on 2026-10-31, from a prompt by Claude Code; filed unedited apart from this header. The draft `AGENTS.md` in section 2 inherited a few lines from Callum's global Codex instructions (GitHub connector instead of `gh`, the show-me skill, AWS writes) that do not apply to this repo and should be dropped on adoption. Section 3 corrects the `-c 'mcp_servers={}'` override this session used: on this machine it does not disable the servers; use the per-server `enabled=false` overrides listed there.

# Junyan: Claude Code + Codex working agreement

*Research checked 31 October 2026. Local versions: Codex CLI 0.166.0; Claude Code 2.1.316. No repository files were modified. Command syntax and effective MCP configuration were checked locally; full research and review jobs were not launched.*

## 1. One-page working agreement

**Ownership.** Claude Code implements the game and integrates changes. Codex researches questions, independently reviews changes, and implements explicitly bounded side tasks. Callum chooses priorities, accepts architectural decisions, and approves merges. ADR 0002 remains **proposed**: this agreement does not authorize scaffolding.

**Shared instructions.** Keep durable, tool-neutral rules in root `AGENTS.md`. Make `CLAUDE.md` import it with `@AGENTS.md`, retaining only Claude-specific additions. Keep detailed architecture in `docs/ideas/build-recommendation.md`, decisions in `docs/decisions/`, and task state in `docs/tickets/`.

**Branches and worktrees.** Use one ticket, branch, and writer per active worktree:

```text
junyan/                      main — integration
junyan-claude-0006/           claude/0006-breakfast-stall
junyan-codex-NNNN/            codex/NNNN-research-topic
junyan-review-0006-<sha>/     detached — frozen review snapshot
```

Start from an agreed committed baseline. Existing uncommitted research does not appear automatically in new worktrees. Never use `git stash`; use local WIP commits. Never switch, reset, clean, or edit another agent’s checkout. Remove completed worktrees using `git worktree remove`, without force. Git isolates working files and indexes, while sharing repository objects and most refs. [Git worktree documentation](https://git-scm.com/docs/git-worktree)

**Parallelism and ports.** Agree file ownership before starting. Serialize changes to shared schemas, dependencies, lockfiles, and agent instructions. Give each running worktree an explicit port—for example, 5173 and 5174—and enable Vite `strictPort`. Match Playwright’s `baseURL` and server URL to that port; use `reuseExistingServer: false` for automated verification. Keep browser profiles, generated output, and test data separate. [Vite server options](https://vite.dev/config/server-options.html#server-strictport), [Playwright web servers](https://playwright.dev/docs/test-webserver)

**Ticket flow.**

1. Callum assigns the ticket and writer; reserve new ticket numbers centrally.
2. The writer sets `doing`, records branch/worktree/port in Notes, and works against “Done when”.
3. Research lands in `docs/ideas/research-<topic>.md`, with YAML frontmatter, dated sources, findings, alternatives, and uncertainties. Link it from ticket Notes. Research remains exploratory; costly decisions become proposed ADRs.
4. The writer completes relevant checks and prepares a committed review candidate, including the ticket’s `done` change when complete.
5. The other agent reviews that fixed revision. Findings return to the writer. Record reviewed head/base SHAs in the PR; merge after findings are resolved, checks pass, and Callum approves.

**Review gate.** Game changes require rules tests and the specified Playwright journey; visual changes also require phone/desktop inspection. Documentation changes require appropriate document checks. The reviewer reports defects without editing. Recheck after fixes or integration changes. Independent branches passing separately does not establish that their combined result works. [Henrique Cardoso de Faria’s firsthand workflow](https://hencf.org/blog/parallel-claude-code-git-worktrees)

**Practitioner basis.** Arun’s tested Claude/Codex account is particularly useful for shared-stash hazards, port collisions, and returning review fixes to the original writer. Its CLI claims need checking against current versions. Tactic Remote supplies a reproducible isolation/integration experiment, explicitly conducted without calling agents; it supports the Git workflow, not claims about model quality. [Arun’s writeup](https://dev.to/offrun/running-claude-code-and-codex-in-parallel-on-one-repo-git-worktree-gotchas-and-cross-review-41eg), [Tactic Remote experiment](https://tacticremote.com/blog/claude-code-codex-git-worktree/)

## 2. Draft `AGENTS.md`

The following draft is **84 lines**, including blank lines.

```markdown
# Junyan: shared agent instructions

## Read first
- Read the assigned ticket and `docs/tickets/README.md`.
- Read `docs/ideas/build-recommendation.md`, especially "The stack".
- Read `docs/decisions/0002-platform-stack-and-art.md`.
- Ideas are exploratory; accepted decisions govern implementation.
- ADR 0002 is proposed: do not scaffold or adopt its stack until Callum accepts it.
- After acceptance, preserve the architecture below unless a new decision changes it.

## Roles and scope
- Claude Code owns game implementation and integration.
- Codex owns research, independent review, and explicitly scoped side tasks.
- Callum sets priorities, accepts decisions, and authorizes merges.
- One ticket and one writer per branch/worktree; reviewers report without editing.
- Agree file ownership and interfaces before parallel implementation.
- Serialize shared schema, dependency, lockfile, and instruction changes.
- Put discovered work in another ticket; do not expand the current task silently.

## Git and worktrees
- Confirm repository, worktree path, branch, and existing changes before working.
- Use branches `claude/NNNN-slug` or `codex/NNNN-slug`.
- Use a separate worktree for each active ticket; keep main for integration.
- Never switch branches, reset, clean, or edit another agent's worktree.
- Never use git stash; preserve unfinished work with a local WIP commit.
- Do not include unrelated existing changes in your commits.
- Review committed code in a detached worktree at the supplied head SHA.
- Remove finished worktrees with git worktree remove, without force.
- Use the GitHub connector for PRs and metadata; do not use gh.
- Use local git push to publish a branch when authorized.
- Use the show-me skill for a concise, accurate visual in each PR description.

## Tickets and handoff
- Keep tickets in `docs/tickets/NNNN-short-slug.md`; never move them by status.
- Preserve id, title, status, priority, type, and created YAML fields.
- Statuses: todo, doing, blocked, done. Do not invent a review status.
- Reserve each new number centrally before parallel work; highest number + 1.
- Set doing when starting; set blocked with a concrete reason when blocked.
- Keep Why, Done when, and Notes; make acceptance criteria checkable.
- In Notes record owner, branch, worktree, port, progress, checks, and next step.
- Record review evidence in the PR with reviewed head and base commit IDs.
- Set done in the same completing PR, with findings and research links.
- A branch-local status change is not a shared lock; confirm task ownership.

## Architecture after ADR 0002 acceptance
- Follow `docs/ideas/build-recommendation.md`; do not invent a competing stack.
- Game rules are pure functions over explicit state; inject RNG and time.
- Test rules and simulations without React, the DOM, storage, or network access.
- Keep rendering thin: render state and dispatch actions; no hidden game rules.
- Store content as schema-validated JSON, with tokens segmented offline.
- Token content carries hanzi, pinyin, gloss, and an audio reference.
- Render dialogue, vocabulary, signs, and prices as real DOM text.
- Do not embed Chinese text in generated images or canvas-only dialogue.
- Provide deterministic `?test=1&seed=42` and `window.__TEST__` hooks.
- Gate test controls to development/test builds; exclude them from production.
- First slice: offline content/audio, IndexedDB saves, no backend.

## Verification and local services
- Until scaffolding exists, report missing commands; never invent passing checks.
- The scaffold must document install, dev, build, typecheck, and test commands.
- Run relevant checks from the actual package scripts and lockfile.
- For game changes, run rules tests and the Playwright customer-to-journal journey.
- For visual changes, inspect phone and desktop screenshots and console errors.
- Give each worktree a unique explicit port; enable Vite strictPort.
- Point Playwright at that port; do not reuse another worktree's server.
- Keep dependencies, output files, browser profiles, and test data worktree-local.
- Recheck integrated changes when the merge base or reviewed code changes.

## Research and decisions
- File research in `docs/ideas/research-<topic>.md`.
- Use Markdown with title, created, status: draft, and tags YAML frontmatter.
- State the question, recommendation, alternatives, evidence, and uncertainties.
- Cite primary URLs inline; record checked dates and relevant tool versions.
- Label practitioner experience, inference, and unverified claims separately.
- Link research from ticket Notes with `[[ideas/research-<topic>]]`.
- Propose costly-to-reverse choices in docs/decisions; Callum accepts them.

## Review and external actions
- Cross-review: Codex reviews Claude's work; Claude reviews Codex's changes.
- Report actionable defects with file/line, impact, evidence, and missing tests.
- Check pure rules, JSON validation, DOM dialogue, deterministic hooks, and scope.
- Return fixes to the original writer; review does not grant merge approval.
- Merge only after relevant checks, resolved findings, and Callum's approval.
- Ask before AWS writes; verify account, environment, and stack before deployment.
```

### How both tools load it

`AGENTS.md` is ordinary Markdown with no mandatory fields. Discovery behavior belongs to each tool, so the format alone does not guarantee identical loading. [AGENTS.md specification](https://agents.md/)

**Codex:** at startup, loads global guidance from `CODEX_HOME`, then guidance along the project-root-to-working-directory path. Each directory contributes at most one file: `AGENTS.override.md`, otherwise `AGENTS.md`, otherwise configured fallback names. More local guidance takes precedence. The default combined limit is 32 KiB. It does not recursively preload every descendant directory; read applicable nested instructions when entering their scope. [Codex discovery rules](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

**Claude:** loads ancestor `CLAUDE.md` instructions at launch and descendant instructions on demand. Current Claude Code also supports `AGENTS.md`, but its default selects that only when no qualifying `CLAUDE.md` or `CLAUDE.local.md` exists in or above the working directory. Junyan already has `CLAUDE.md`. Use this explicit adapter when adopting the draft:

```markdown
@AGENTS.md

## Claude-specific tooling
pstack is enabled in `.claude/settings.json`.
Use `/pstack:poteto-mode` for work requiring rigor.
```

An actual `@AGENTS.md` import is more reliable than a sentence asking Claude to read the file. Current Claude also supports loading both through a user setting, but the import travels with the repository. [Claude instruction loading and imports](https://code.claude.com/docs/en/memory#agentsmd)

## 3. Commands and current configuration

### Non-interactive Codex configuration

Use `web_search="live"` for current research. The documented modes are `disabled`, `cached`, `indexed`, and `live`; cached is the ordinary default. CLI overrides take precedence over project configuration, which takes precedence over selected profile and user configuration. [Codex configuration basics](https://learn.chatgpt.com/docs/config-file/config-basic)

For these jobs, use `sandbox_mode="read-only"` and `approval_policy="never"`. The latter prevents approval prompts; it does not grant additional access. `workspace-write` is appropriate for separately authorized implementation jobs; `danger-full-access` removes the normal sandbox boundary. [Sandbox and approvals](https://learn.chatgpt.com/docs/agent-approvals-security)

**Do not use `-c 'mcp_servers={}'` to disable MCP.** On this installation, it left the existing servers enabled.

The following Bash/zsh array uses the current local inventory. With these overrides, `codex mcp list --json` reported **zero enabled servers**:

```bash
codex_batch=(
  -c 'approval_policy="never"'
  -c 'sandbox_mode="read-only"'
  -c 'notify=[]'
  -c 'features.hooks=false'
  -c 'features.apps=false'
  -c 'mcp_servers.playwright.enabled=false'
  -c 'mcp_servers.figma.enabled=false'
  -c 'mcp_servers.maestro.enabled=false'
  -c 'mcp_servers.paper.enabled=false'
  -c 'mcp_servers.node_repl.enabled=false'
  -c 'mcp_servers.sentry.enabled=false'
  -c 'mcp_servers.computer-use.enabled=false'
  -c 'mcp_servers.cua_repl={command="/usr/bin/false",enabled=false}'
)
```

`notify=[]` clears the external notification command. Lifecycle hooks are separate, hence `features.hooks=false`; connector integrations are disabled with `features.apps=false`. These are documented configuration keys. [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)

For ordinary configured MCP servers, use `mcp_servers.<name>.enabled=false`. Plugin servers also have documented controls under `plugins.<plugin>.mcp_servers.<server>`. [MCP configuration](https://learn.chatgpt.com/docs/extend/mcp)

**Local exception:** the app-provided `cua_repl` remained enabled when its plugin controls were overridden during my checks. The disabled, inert transport entry above successfully suppressed it. This is a verified workaround for this installation, not a universal Codex requirement; `/usr/bin/false` is not launched because the entry is disabled.

After installing plugins or changing configuration, recheck:

```bash
codex "${codex_batch[@]}" mcp list --json
```

Every entry must show `"enabled": false` before using these recipes. Managed policies can constrain configuration, including enforcing hooks. [Codex hooks](https://learn.chatgpt.com/docs/hooks)

### Research job

Run from the root of the assigned research worktree. This example produces the research note for this topic:

```bash
codex exec "${codex_batch[@]}" \
  -c 'web_search="live"' \
  --ephemeral \
  --color never \
  --output-last-message docs/ideas/research-agent-workflow.md \
  - <<'PROMPT'
Read AGENTS.md if present, CLAUDE.md, docs/ideas/README.md,
docs/tickets/README.md, docs/ideas/build-recommendation.md, and
docs/decisions/0002-platform-stack-and-art.md.

Research CURRENT official Claude Code and Codex documentation for using
both tools concurrently on this repository. Check instruction discovery,
worktrees, headless commands, hooks, configuration, and review behavior.
Compare with firsthand practitioner accounts.

Return a complete Markdown research note with YAML frontmatter:
title, created, status: draft, and tags.
Include the question, recommendation, alternatives, checked tool versions,
inline source URLs, uncertainties, and implications for Junyan.
Distinguish documented behavior, practitioner experience, and inference.

Do not edit files, change tickets, commit, or contact external services
other than the native web research tool. The CLI will save your final
answer to the explicitly requested output file.
PROMPT
```

`codex exec` accepts its prompt through stdin, sends progress to stderr, and prints the final answer to stdout. `--output-last-message` additionally saves that answer; this CLI output write is separate from the model’s read-only sandbox. `--ephemeral` avoids persisting session rollouts. [Non-interactive Codex](https://learn.chatgpt.com/docs/non-interactive-mode)

The ticket owner checks the resulting note, links it from Notes, and commits it on the research branch. The example commands here have **not** been executed to create that file.

### Pre-merge Codex review

Commit all intended changes first. From the integration checkout, freeze the candidate and current target into commit IDs. This example assumes the branch naming convention above:

```bash
git fetch origin

review_head=$(git rev-parse claude/0006-breakfast-stall)
review_base=$(git rev-parse origin/main)
review_dir="../junyan-review-0006-${review_head:0:8}"

git worktree add --detach "$review_dir" "$review_head"

(
  cd "$review_dir" || exit 1

  codex review "${codex_batch[@]}" \
    -c 'web_search="disabled"' \
    --base "$review_base"
)
```

Run this after defining `codex_batch` in the same shell. Choose an unused review directory for each candidate. The detached worktree lets the writer continue elsewhere without changing the files under review.

`--base` reviews the branch change against its base. `--commit` reviews only one commit’s changes. `--uncommitted` covers staged, unstaged, and untracked changes and is useful during development. These selectors conflict with each other **and with a positional custom review prompt**; keep repository-specific review criteria in `AGENTS.md`. [Codex review reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli#codex-review)

A completed review process is not proof that the code passes its checks. The writer or CI supplies test evidence for the candidate; Callum evaluates findings and approves the merge.

### Profiles: current syntax

Since Codex 0.134.0, configuration profiles are separate files. For example:

```toml
# ~/.codex/junyan-research.config.toml
approval_policy = "never"
sandbox_mode = "read-only"
web_search = "live"
notify = []

[features]
hooks = false
apps = false
```

Select it with `codex exec --profile junyan-research ...`. Keep the explicit MCP overrides above, or translate them into the profile too. Profiles overlay configuration; they do not provide an empty configuration environment.

The older `[profiles.junyan-research]` tables and top-level `profile="..."` selector are no longer supported. `--ignore-user-config` is available for `exec`, but does not by itself establish that project or plugin MCP servers are disabled. [Current profile syntax](https://learn.chatgpt.com/docs/config-file/config-advanced), [Non-interactive options](https://learn.chatgpt.com/docs/non-interactive-mode)

### Claude cross-review and hooks

For a Codex-authored change, use a clean, committed review worktree and the frozen `review_base`:

```bash
git diff "$review_base"...HEAD |
  claude -p \
    "Read AGENTS.md and the relevant ticket. Review the supplied branch diff.
     Report actionable bugs, architecture violations, and missing tests with
     file/line references and evidence. Do not edit files." \
    --tools "Read,Glob,Grep" \
    --allowedTools "Read,Glob,Grep" \
    --disallowedTools "mcp__*" \
    --strict-mcp-config \
    --mcp-config '{"mcpServers":{}}' \
    --settings '{"disableAllHooks":true}' \
    --output-format text
```

`--tools` restricts available built-in tools; `--allowedTools` controls prompting and is not itself a tool restriction. The command permits repository reading while excluding shell execution and file editing. [Claude CLI reference](https://code.claude.com/docs/en/cli-reference)

Ordinary `claude -p` loads hooks and MCP configuration. `--bare` skips automatic discovery, but also skips project instructions and subscription authentication, so it is not a drop-in replacement for this command. [Claude headless documentation](https://code.claude.com/docs/en/headless)

For interactive implementation, useful hook responsibilities are:

- `PreToolUse`: reject prohibited operations before execution.
- `PostToolUse`: run small checks after relevant edits.
- `Stop`: check completion evidence, guarding against repeated invocation with `stop_hook_active`.
- `WorktreeCreate`: customize provisioning; it **replaces** default worktree creation.

Hooks belong in settings/plugin configuration, not instruction prose. Keep checks worktree-aware and retain the merge gate even when hooks are enabled. [Claude hooks reference](https://code.claude.com/docs/en/hooks)

Claude supports `claude --worktree <name>`; its default path is `.claude/worktrees/<name>`. Plain `git worktree add` is useful here for predictable sibling directories and branch names. Worktrees do not isolate every setting: Claude shares some approvals, plugins, and memory across the repository. [Claude worktree documentation](https://code.claude.com/docs/en/worktrees)

## 4. Corrections and gaps in the current repository guidance

The proposed workflow broadly agrees with practitioner experience. The issues are stale details and missing coordination rules, rather than a reason to abandon it.

| Current text | Assessment and recommended correction |
|---|---|
| [CLAUDE.md](/Users/callumhemsley/Personal/junyan/CLAUDE.md:3) says the plan has not been written down. | **Stale.** Research and a proposed ADR now exist. Replace this with the precise remaining boundary: ADR 0002 awaits acceptance. Preserve the prohibition on scaffolding before acceptance. |
| [Build recommendation](/Users/callumhemsley/Personal/junyan/docs/ideas/build-recommendation.md:70) proposes two instruction files generated from one source. | **Sound intent, unnecessary machinery for this stage.** Use `AGENTS.md` plus a `CLAUDE.md` import. Merely adding `AGENTS.md` beside the existing Claude file will not load it under Claude’s default selection behavior. [Official loading rules](https://code.claude.com/docs/en/memory#agentsmd) |
| [Agent research](/Users/callumhemsley/Personal/junyan/docs/ideas/research-agentic-gamedev.md:62) says Claude has a worktree flag while Codex uses plain Git. | **Outdated capability comparison.** Installed Codex 0.166.0 exposes `--worktree`, including for `exec`. Plain Git remains a valid shared convention. The cited practitioner article explicitly tested an older Codex version. |
| [Agent research](/Users/callumhemsley/Personal/junyan/docs/ideas/research-agentic-gamedev.md:22) abbreviates cross-review to `--uncommitted` or `git diff \| claude -p`. | **Incomplete pre-merge recipe.** Uncommitted review misses already committed branch changes; bare `git diff` misses staged and untracked additions. Review a committed candidate against its base. The practitioner article itself explains the untracked-file problem. [Practitioner correction](https://dev.to/offrun/running-claude-code-and-codex-in-parallel-on-one-repo-git-worktree-gotchas-and-cross-review-41eg) |
| [Ticket conventions](/Users/callumhemsley/Personal/junyan/docs/tickets/README.md:3) allocate the highest number plus one; the agreement says both agents share `docs/`. | **Parallel coordination gap.** Two branches can allocate the same number, and branch-local `doing` changes are invisible elsewhere. Reserve numbers and ownership centrally; use ticket Notes for handoff instead of introducing a second backlog. Separate checkouts still require coordination and integration testing. [Reproducible worktree experiment](https://tacticremote.com/blog/claude-code-codex-git-worktree/) |

Two implementation details also need tightening when scaffolding is authorized: `strictPort` must be paired with explicit per-worktree ports and matching Playwright configuration; “review before merge” must identify the reviewed revision and who resolves findings. The current untracked research and proposed ADR should become part of the agreed committed baseline before new implementation worktrees depend on them.
## Related

- [[build-recommendation]]
- [[research-agentic-gamedev]]
- [[decisions/0002-platform-stack-and-art]]
