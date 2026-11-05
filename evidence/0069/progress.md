# Progress and PSTACK feature checklist

- [x] `how` over the affected subsystem. Read contracts, WordToken/recovery, content schemas/voices, scene renderer lifecycle, ticket ledger and accepted decisions. Pure game rules feed a controlled React view; shared App owns journal/playback/save. Feature uses those seams.
- [x] `architect` for parallel design exploration. Parent supplied independent read-only candidates from repair_design_a and repair_design_b. Synthesis uses typed object records and explicit feedback, rejecting a generic circuit/graph engine. No nested writer.
- [x] Write the throughput checkpoint as four todo items.
  - [x] Blocking first steps. Read instructions, refine ticket/plan and agree exclusive paths before implementation. Audio manifest starts early.
  - [x] Independent workstreams. Audio synthesis and central integration can proceed outside this writer. Feature rules then UI then browser evidence remain ordered.
  - [x] Shared mutable state. No shared production file writes. Feature state travels through controlled props and the central save envelope.
  - [x] Smallest safe decomposition. One feature writer owns coupled rules, content, scene and UI. Parent manages separate read-only reviewers. No extra writers.
- [x] Delegate code-writing. This worker is the sole parent-delegated implementation owner. Feature step 4 explicitly permits a subagent forbidden to spawn to own the diff with review separation.
- [ ] Verify on the matching surface.
- [ ] Rebase into small, ordered commits. Sequence Work into Verifiable Units controls ordering.
- [ ] If the design is contested, interrogate before shipping. No unresolved contested choice in the supplied synthesis.
- [ ] Run Opening a PR. Central lead owns connector operations and asks when ready.

Applied skills read locally from PSTACK include poteto-mode, feature playbook, how, architect, Model the Domain, Prove It Works, Sequence Work into Verifiable Units, deslop and control-ui. Model the Domain chose explicit object state. Prove It Works requires actual browser evidence. Sequence Work into Verifiable Units separates checked rules from checked UI. Native tools replace Cursor-specific tool names. User-selected model and connector override skill defaults. The separate show-me visual skill is unavailable. Show-me-your-work exists and was read during this run; its canonical six-column TSV trail is evidence/0069/decision-trail.tsv. The earlier four-column decisions.tsv is retained as historical evidence. Parent owns independent trail review because this writer may not spawn.

Mandatory audio and integrated navigation/save/offline verification remain pending. No harness result will be described as integrated completion.

First rules/content unit passed `pnpm test -- src/features/repairs/rules.test.ts` on 2026-11-05. This repository command runs the full suite. 12 files and 179 tests passed, including 10 repair tests. Audio pipeline `--plan` succeeded with exact authored content. No audio generated. Parent subsequently requested free switching between both unfinished jobs; implement that as the next checked unit before UI.

Architecture comparison evidence. Candidate A offered object-state unions with guarded return and test invalidation. Candidate B offered a bounded parts table with freely ordered reversible manipulation. Root Astra compared them because a different-model-family arena judge was unavailable within the requested Sol-medium worker policy. Synthesis takes guarded test/return from A and freely ordered toy interventions from B. Explicit actions replace a generic circuit interpreter.
