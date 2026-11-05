# 0060 Grandpa performance evidence

## 2026-11-05 — ownership and boundaries

Owner: Codex cloud worker. Branch `codex/0060-subdue-grandpa-opening`; checkout `/workspace/junyan-0060`; base `66ac123`; strict ports 5408/5409. Follow harness-adapted pstack poteto-mode/autopilot-full bug-fix discipline. No bundled pstack playbook found in tracked files. Production audio/content and scene leases are held by 0058/0059; this checkpoint changes only this ticket and its own evidence. No AWS writes, main writes or merges.

## 2026-11-05 — initial cause investigation

State shapes: `OpeningState` selects step and feedback; `WardFrame` holds elder/player posture, present cast, table foods and held item. `wardFrame` always sets elder sitting and makes a wrong offered food his held item. `ward.js` draws elder with fixed crouch 1, scale .88, lean .08, armL .3, armR .35 or raised held-item elbow/hand. No elder pose property depends on time. A raised food pose is static until the next item. Do not describe this as a waving/bouncing animation without browser evidence.

Six line references across two requests (script must stay intact):

| Role | Text | ID |
| --- | --- | --- |
| Milk request | 早上好，年轻人。请给我一杯豆浆。 | elder-milk |
| Milk wrong | 不对，我要豆浆。 | elder-milk-wrong |
| Milk thanks | 谢谢你！ | elder-milk-thanks |
| Egg request | 我还想要一个鸡蛋。 | elder-egg |
| Egg wrong | 不对，我要鸡蛋。 | elder-egg-wrong |
| Egg thanks | 谢谢，谢谢！ | elder-egg-thanks |

Cast uses `uncle-fu-levelled`: pinned Qwen 0.6B CustomVoice, Uncle_Fu, Chinese, speed 1, instructions null, -20 dBFS active RMS / -1 dBFS peak ceiling. Restaurant uses `uncle-fu`; do not recast shared restaurant consumers. Exclamation/repeated thanks are possible semantic contributors, not listening findings.

## 2026-11-05 — expressive-limit evidence

Upstream Qwen README model matrix explicitly leaves Instruction Control blank for **0.6B-CustomVoice**, while 1.7B-CustomVoice has a checkmark. Source read directly on this date: https://github.com/QwenLM/Qwen3-TTS/blob/main/README.md#released-model-description-and-download . The generic API accepts `instruct`, but that is not evidence that this pinned small model supports useful delivery control. Local adapter passes `instructions` to `generate_custom_voice` and rejects Qwen speed != 1. Consequently, a calm/frail instruction-only preset is not a credible fix, and lowering gain alone does not address delivery. Parent reports Ryan+calm and Aiden doctor auditions rejected; no claim of listening by this worker.

Decision: do not spend Mac synthesis on more emotion prompts without checking actual adapter/model behavior and a listening plan. Preserve script/model pins. Audition must compare ordinary conversational phrasing, warmth, pauses, exact Mandarin, no caricature, and audible speech. A model change needs root coordination and explicit justification; no candidate has been accepted.
