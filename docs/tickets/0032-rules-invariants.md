---
id: 32
title: Strengthen game rule invariants
status: done
priority: medium
type: chore
created: 2026-11-02
---

## Why

Callum requested ten Sol 6.1 medium agents to improve Junyan using pstack, with silent verification and a consolidated morning result.

## Done when

The assigned slice has reproducible evidence, scoped changes where warranted, and an honest PASS, ISSUES or BLOCKED report. Product fixes require independent review before integration.

## Notes

- Worker: Sol 6.1 implementation sub-agent; branch `t3/rules-invariants`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-8b8e5605`.
- Actual starting HEAD: `21a4faaa8887dc8091f8d34ee70ad462ea472096`; product baseline: `5dfad159c8d3544efccdbaf6500b54f4d3562062`. No browser/server needed for pure rules verification; ports 5204/5205 unused.
- Read the required project decisions/design guidance and pstack `principle-test-behavior-not-implementation` / `principle-prove-it-works`. Inspect reachable action sequences before deciding whether a correction is warranted.
- Initial `pnpm test` could not run: this worktree has no `node_modules` (`vitest: command not found`). Restore existing dependencies with the frozen lockfile; no dependency/schema/content changes.

- Baseline: `5dfad15`.
- Scope: Own src/game.ts and src/game.test.ts only. Prove real counterexamples before corrections.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Browser ports: 5204 dev, 5205 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.

## Result: PASS — no proven defect

- No production or existing test changes warranted. `src/game.ts` and `src/game.test.ts` remain byte-for-byte unchanged from starting HEAD; seeded RNG and caller-supplied lookup timestamps are untouched. Only this ticket is committed. The final commit SHA is reported in the worker handoff; resolve it locally with `git log -1 --format=%H -- docs/tickets/0032-rules-invariants.md`.
- The audit below completed **81,984 reducer transitions**, including **48,000 deterministic adversarial actions**, **120 completed days**, **480 customer checkouts**, all **24 customer-service permutations**, all **12 shipped orders**, and **2,544 rejected deliveries**. Each transition was replayed against frozen state/content/actions to check deterministic behavior and mutation safety. Output: `{"transitions":81984,"rejectedTrays":2544,"completedDays":120,"coveredOrders":12,"adversarialActions":48000}`.
- Concrete probes: take all four orders before serving; deliver every incomplete prefix (including empty), wrong foods, and an extra item where capacity permits; preserve rejected trays and money; fill six slots, reject a seventh, return items and recover; reverse correct trays; reject incorrect/negative/nonfinite change, then accept exact change and reject duplicate payment. Journal the same word four times daily across five days, retaining counts across rollover; reset day-local state, preserve lifetime money, cap levels at three. Arbitrary sequences also mix remote/unknown-table, unavailable, invalid-position, unknown-food, invalid-return-index, unknown-word and premature-next-day actions.
- Baseline after `pnpm install --frozen-lockfile`: `pnpm test` **88/88 passed**, `pnpm build` passed. Final: `pnpm exec vitest run src/game.test.ts src/save.test.ts src/content/content.test.ts` **63/63 passed** (22 rules, 31 saves, 10 content); full suite rerun **88/88 passed**; `pnpm build` passed; `git diff --check` clean. Both builds emitted the same two non-fatal third-party Zod/Rollup annotation warnings. Frozen dependency installation changed no manifest or lockfile.
- Learned: stale receipts after switching active tables are an explicitly covered reachable save state (`src/save.test.ts`, “accepts stale receipts, changed active tables, full trays and wrong answers”), not a rules failure to “fix”. The UI selects receipt content from the served order. No speculative clock-order policy, movement refactor, or arbitrary corrupted-state sanitization was introduced.
- Limits: bounded deterministic exploration is evidence, not proof over every possible sequence. The existing synthetic rules suite covers seeded alternatives/repeated food entries and malformed order totals; the audit adds shipped-content interleavings. Browser journey, phone/desktop screenshots and console inspection were not run because no game/rendering code changed. No browser opened, audio played, system volume changed, other worktree touched, child started, push/deploy/AWS performed. Product integration still follows the repository's independent-review policy.

## Reproducible reducer audit

Run from the repository root with Node 22.23.4 and the existing frozen-lockfile dependencies:

```sh
sed -n '/^```javascript$/,/^```$/p' docs/tickets/0032-rules-invariants.md | sed '1d;$d' | node --experimental-strip-types --input-type=module
```

This drives the real reducer using shipped content, without React, DOM, storage, network, browser audio, invented state, or private helpers. Expected money comes from the content's prices and quantities, not `orderTotal`. The deterministic action generator is independent of the game's RNG.

```javascript
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  try { return next(specifier, context); }
  catch (error) {
    if (specifier.startsWith('.')) return next(`${specifier}.ts`, context);
    throw error;
  }
} });
const { createGame, reduceGame } = await import(`${process.cwd()}/src/game.ts`);
const content = JSON.parse(readFileSync('src/content/content.json', 'utf8'));
const kitchen = { x: 6, y: 1 };
const positions = [{ x: 3, y: 2.5 }, { x: 9, y: 2.5 }, { x: 3, y: 6.5 }, { x: 9, y: 6.5 }];
const ranks = ['seated', 'ordered', 'checkout', 'served'];
const price = foodId => content.foods.find(food => food.id === foodId).price;
const orderFor = (state, table) => content.orders.find(order => order.id === state.customers[table - 1].orderId);
const totalFor = order => order.items.reduce((total, item) => total + price(item.foodId) * item.quantity, 0);
const wordId = content.foods[0].word.id;
let transitions = 0, rejectedTrays = 0, completedDays = 0, now = 0;
const coveredOrders = new Set();
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
freeze(content);
function step(state, action) {
  freeze(state);
  const next = reduceGame(state, freeze(action), content);
  assert.deepEqual(next, reduceGame(state, action, content), 'deterministic transition');
  assert.ok(next.tray.length <= 6, 'tray bounds');
  assert.ok(next.tray.every(foodId => content.foods.some(food => food.id === foodId)));
  assert.equal(next.served, next.customers.filter(customer => customer.phase === 'served').length);
  assert.equal(next.ended, next.served === 4);
  assert.ok(Number.isSafeInteger(next.earnings) && next.earnings >= state.earnings);
  if (next.day === state.day) {
    for (let index = 0; index < 4; index++) {
      assert.equal(next.customers[index].orderId, state.customers[index].orderId);
      const advance = ranks.indexOf(next.customers[index].phase) - ranks.indexOf(state.customers[index].phase);
      assert.ok(advance === 0 || advance === 1, 'ordered phase progression');
    }
    const charged = next.served > state.served ? totalFor(orderFor(state, action.table)) : 0;
    assert.equal(next.earnings, state.earnings + charged, 'exactly-once earnings');
  } else {
    assert.equal(action.type, 'next-day');
    assert.equal(state.ended, true);
    assert.equal(next.day, state.day + 1);
    assert.equal(next.level, Math.min(next.day, 3));
    assert.equal(next.earnings, state.earnings);
    assert.deepEqual(next.journal, state.journal);
    assert.deepEqual(next.tray, []);
    assert.equal(next.mistakes, 0);
    assert.equal(next.activeTable, null);
    assert.equal(next.receipt, null);
    assert.ok(next.customers.every(customer => customer.phase === 'seated'));
  }
  if (state.ended && !['lookup', 'next-day'].includes(action.type)) assert.deepEqual(next, state);
  transitions++;
  return next;
}
function move(state, position) { return step(state, { type: 'move', position }); }
function fill(state, foods) {
  state = move(state, kitchen);
  while (state.tray.length) state = step(state, { type: 'return-food', index: 0 });
  for (const foodId of foods) state = step(state, { type: 'pickup', foodId });
  return state;
}
function permutations(values) {
  return values.length ? values.flatMap(value => permutations(values.filter(other => other !== value)).map(rest => [value, ...rest])) : [[]];
}
for (const sequence of permutations([1, 2, 3, 4])) {
  let state = createGame(content, completedDays + 42);
  for (let day = 1; day <= 5; day++) {
    for (const table of sequence) {
      state = step(move(state, positions[table - 1]), { type: 'interact', table });
      state = step(state, { type: 'lookup', wordId, now: ++now });
      assert.equal(state.journal[wordId].lookups, (day - 1) * 4 + sequence.indexOf(table) + 1);
    }
    for (const table of sequence) {
      const order = orderFor(state, table), total = totalFor(order);
      coveredOrders.add(order.id);
      const foods = order.items.flatMap(item => Array(item.quantity).fill(item.foodId));
      const wrongFood = content.foods.find(food => !foods.includes(food.id)).id;
      const invalidTrays = [...Array(foods.length)].map((_, length) => foods.slice(0, length));
      invalidTrays.push(foods.map(() => wrongFood));
      if (foods.length < 6) invalidTrays.push([...foods, wrongFood]);
      for (const tray of invalidTrays) {
        state = move(fill(state, tray), positions[table - 1]);
        const previous = state;
        state = step(state, { type: 'deliver', table });
        assert.equal(state.feedback, 'wrong-food');
        assert.equal(state.customers[table - 1].phase, 'ordered');
        assert.deepEqual(state.tray, tray);
        assert.equal(state.earnings, previous.earnings);
        assert.equal(state.mistakes, previous.mistakes + 1);
        rejectedTrays++;
      }
      state = fill(state, Array(6).fill(wrongFood));
      const full = state;
      state = step(state, { type: 'pickup', foodId: wrongFood });
      assert.deepEqual(state.tray, full.tray);
      assert.equal(state.feedback, 'full');
      state = move(fill(state, foods.reverse()), positions[table - 1]);
      state = step(state, { type: 'deliver', table });
      assert.equal(state.customers[table - 1].phase, 'checkout');
      assert.deepEqual(state.tray, []);
      const bill = state;
      state = step(state, { type: 'pay', table, change: order.paid - total + 1 });
      assert.equal(state.feedback, 'wrong-change');
      assert.equal(state.customers[table - 1].phase, 'checkout');
      assert.equal(state.earnings, bill.earnings);
      for (const change of [NaN, Infinity, -1]) assert.deepEqual(step(state, { type: 'pay', table, change }), state);
      state = step(state, { type: 'pay', table, change: order.paid - total });
      assert.deepEqual(state.receipt, { table, total, change: order.paid - total });
      assert.deepEqual(step(state, { type: 'pay', table, change: order.paid - total }), state);
    }
    assert.equal(state.ended, true);
    completedDays++;
    state = step(state, { type: 'next-day' });
  }
}
let randomSeed = 0x320032;
const random = maximum => {
  randomSeed = (Math.imul(randomSeed, 1103515245) + 12345) >>> 0;
  return Math.floor(randomSeed / 0x100000000 * maximum);
};
for (let seed = 0; seed < 24; seed++) {
  let state = createGame(content, seed);
  for (let index = 0; index < 2000; index++) {
    const table = random(6), order = table >= 1 && table <= 4 ? orderFor(state, table) : null;
    const actions = [
      { type: 'move', position: [kitchen, ...positions, { x: NaN, y: 0 }, { x: -1, y: 4 }][random(7)] },
      { type: 'interact', table }, { type: 'deliver', table },
      { type: 'pickup', foodId: [...content.foods.map(food => food.id), 'missing'][random(content.foods.length + 1)] },
      { type: 'return-food', index: random(9) - 1 },
      { type: 'pay', table, change: order && random(2) ? order.paid - totalFor(order) : random(20) },
      { type: 'lookup', wordId: random(2) ? wordId : '__proto__', now: ++now },
      { type: 'next-day' },
    ];
    state = step(state, actions[random(actions.length)]);
  }
}
assert.equal(completedDays, 120);
assert.equal(coveredOrders.size, content.orders.length);
console.log(JSON.stringify({ transitions, rejectedTrays, completedDays, coveredOrders: coveredOrders.size, adversarialActions: 48000 }));
```
