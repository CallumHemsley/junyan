# Repair workshop

Ticket 0069. Worker `/root/repair_writer`. Branch `codex/0069-repair-workshop`. Cloud checkout `/workspace/junyan-repairs`. Strict dev port 5469, preview 5569. Estimate 1–2 engineering days plus voice synthesis and independent review.

## Player experience

A warm apartment workshop brings Mandarin back through visible mechanical cause and effect. Two objects are enough for the first release. No shopping, currency, timers, quiz gates or restaurant day advancement.

The first ten minutes begin with Lin Jie beside a worn table lamp. Her line is “能亮，但是一直闪。” The player tests it and sees weak uneven light. The large visible bulb and threaded fitting invite selection. With power off, 拧紧 seats the bulb visibly deeper; 转松 reverses it. Testing a seated bulb makes a warm steady pool. Returning it puts the working lamp on the workshop shelf. The player can also switch freely to Xiao Zhou’s toy van and says “这个玩具不动了。” Opening its cover exposes a disconnected lead and exhausted cell. 接上 and 换电池 may happen in either order. Closing and testing with only one fix still leaves the wheels still. Both fixes make the wheels move. Returning both objects grants the optional apartment stool once. No spoken instruction is a correctness gate.

## Controls and choices

All operations use DOM targets at least 44px. Select a visible part, then choose its action. Touch and keyboard use the same controls. No drag is required. Selected parts receive an outline and a separate action strip. Replay and word lookup remain available. The lamp switch is an explicit action. Power must be off before changing its fitting. The toy must be open before changing lead or cell. Closing its cover precedes a useful test. Wrong actions give causal Mandarin feedback and preserve a reversible state. Each object has a local reset. Both unfinished objects retain their physical state when switching or reloading. A shelf practice control restarts either completed job without removing its completion or duplicating gifts.

## Mandarin and inference

Bounded action vocabulary includes 灯泡, 电池, 线, 拧紧, 转松, 接上, 拔下, 换, 打开, 盖上, 试试, 先, 再, 好了 and 不动. “先关掉，再拧紧。” follows an attempted powered manipulation. “线接上了。电池呢？” follows connecting the lead while the old battery remains. “电池换好了。线呢？” follows replacing the cell while the lead remains loose. Feedback names visible outcomes. It does not grade the player. All lines and words are segmented JSON and validated against feature-local schemas permitting dotted IDs and nested audio paths. Pinyin and gloss stay in lookup data. Existing genuinely identical canonical words are reused.

## Architecture and persistence

`rules.ts` owns a pure reducer and explicit object union in a fixed lamp/toy record with active job. Lamp power and fitting, toy cover/lead/cell, selected part and feedback are the physical record. Completed IDs are unique and known. A successful test is invalidated by every physical manipulation. Returning requires the current successful test. A return is idempotent. `gifts(state)` derives exactly `repairs.stool` after both jobs. Unknown or semantically inconsistent saves return null. No localStorage or independent IndexedDB is added. Integration saves the entire neighbourhood envelope atomically. Optional `recoveredWordIds` and `freshWordIds` props drive the existing WordToken presentation. Recovery is calculated from meaningful before/action/after transitions in event handling, never in render or effects. Lookup and repeated invalid actions do not recover words.

`content.ts` validates JSON and exports words and lines. `index.tsx` is a thin controlled view with the agreed callbacks. `scene.ts` uses the current software rasterizer and existing cast appearances. `RepairScene.tsx` owns rendering lifetime, reduced motion, hidden-tab suspension and cleanup. An evidence-only HTML harness exercises the controlled view without adding a production debug route. Shared App, saves, renderer, registry and offline tooling remain integration-owned.

## Art, sound and accessibility

The room uses token cream, tea wood, jade and cool-window colours. Pixel shelves, tools, parts trays and an isometric workbench establish a real workshop. Lin Jie and Xiao Zhou use their established cast appearance and voice identity. The enlarged lamp visibly seats its bulb and throws warm light after repair. The toy exposes a loose lead and dull cell, then travels a short distance with moving wheels after its successful test. Never rapid flashing. Reduced motion uses static differences and no wheel motion. All Chinese remains DOM text, focus is visible, selection uses aria-pressed, outcomes use a polite live region, and state changes leave controls predictable. Animations pause in hidden tabs.

Offline natural voices are mandatory. Existing Linux audit found no usable synthesis model/runtime. Exact pending assets are recorded early; no silent clips, browser TTS or unrelated reused dialogue will disguise the blocker. Central lead coordinates synthesis. Feature is not shippable until every new audio reference exists and is listened to.

## Delivery and verification

1. Refined plan, ticket, decision trail, exact content/audio manifest.
2. Pure reducer, semantic save validation and meaningful tests for reversals, partial fixes, stale actions and duplicate rewards. Run tests and commit.
3. Pixel scene, controlled DOM view and local harness. Build and verify actual desktop/phone controls, focus, screenshots, reduced motion, reload and callback behaviour. Commit.
4. Feature journey and baseline test/build runs. Independent read-only review and writer fixes. Material fixes receive another review.
5. Lead owns PR and serialized integration. Verify actual hospital to three customers to change to journal, feature navigation/day preservation, old saves/reload, offline assets/audio and clean console after integration. Missing checks remain pending.

## Release boundary

Only lamp and toy. Radios, umbrellas, soldering, material crafting, extra faults, time limits, tool shops and additional rewards are deferred. Practice provides repetition without a new economy. Ticket remains doing or blocked while required audio or integrated checks are incomplete.
