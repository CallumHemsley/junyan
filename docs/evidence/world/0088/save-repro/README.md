# Confirmed baseline position rollback

Verdict: **ISSUES**, P2. This is a reproduced baseline defect, not only a source suspicion. No application code was edited.

Product baseline is `8cd5bc209b7dc2d91cc0f765991de313f813f4eb`; the review checkout was `5132785601e5f2e688f6158d00109869c90ed218`, containing coordination documentation. `git diff 8cd5bc2 -- src` was empty. App.tsx SHA256 was `ce4e3907bf84da6ac2ddab854df791f1a90790c3c88157cf571ef7eb60b6a24d`; served production JS `index-Cwxs8DCX.js` SHA256 was `d983055a1f4220575f07f7d74ba862da12a3aee3bd5eafde0146f93b21dde382`.

## Reproduction

1. Start a clean production browser context, complete the ordinary hospital opening, and open the restaurant.
2. Visit the apartment through its real navigation button. Wait 600ms.
3. Return to the restaurant and immediately press ArrowDown. Actual action-to-key completion was 52ms desktop and 38ms phone.
4. Wait 900ms, longer than the 350ms save debounce. Read both stores without modifying them.
5. Reload, wait 900ms, and read both stores again.

Both desktop and phone produce the same result:

| Observation | Position |
|---|---|
| Before return/movement | `{x:6,y:2.5}` |
| IndexedDB after movement and save | `{x:6.45,y:2.95}` |
| Local checkpoint after movement and save | `{x:6,y:2.5}` |
| IndexedDB after reload settles | `{x:6,y:2.5}` |

The final assertion requires the moved position to survive. It fails in both projects, deliberately retained as the missing regression. The test does not inject saves, dispatch internal actions, use test mode or alter clocks/storage. Production `__TEST__` absence is asserted. No page errors were observed. Phone uses Chromium emulation with keyboard input; this is not proof of a touch-only movement flow.

## Cause and impact

`src/App.tsx:112–114` updates the local checkpoint only for non-move actions. `src/App.tsx:193–197` clears it after IndexedDB writes only if it exactly equals the newer snapshot. The old checkpoint therefore survives the valid moved save. `src/App.tsx:169–172` preferentially loads that old checkpoint and the normal save effect writes it back into IndexedDB. A player who moves shortly after an action loses the latest saved position on reload. Position loss is proven here; unrelated game-progress loss is not claimed.

The foundation writer should correct ordering/version ownership across the two stores and retain a normal-UI action→movement→settled save→reload test. Do not merely clear every checkpoint, since a newer substantive action may still need recovery.

## Evidence and rerun

`desktop-stores.json` and `phone-stores.json` contain complete read-only snapshots; `results.json` retains the failing assertions. Before/after screenshots and Playwright traces are retained. The after-reload screenshot includes the normal restaurant welcome panel; stored positions are the direct evidence.

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers /workspace/.junyan-tools/node_modules/node/bin/node node_modules/@playwright/test/cli.js test --config docs/evidence/world/0088/save-repro/repro.config.ts
```

The existing production build is required. This reviewer used the parent's baseline dist and did not rebuild or change it. Playwright owned strict port 5491; after completion `ss -ltnp 'sport = :5491'` showed no listener. No commit or push was performed by this sub-reviewer.
