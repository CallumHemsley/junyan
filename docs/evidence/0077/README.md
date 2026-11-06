# Language foundation verification

The runtime now uses neutral words, language policies, typed interface catalogs and stable feature IDs. Mandarin authored JSON and audio are unchanged. `docs/adding-a-language.md` describes static pack selection. The French fixture tests contracts and gameplay; its placeholder audio is not a production language pack.

## Checks

- Baseline `8cd5bc2`: 308 unit tests and six desktop/phone waiter browser cases passed before changes.
- Integrated `9231a4b`: all 332 unit tests passed on Node 22.23.4. TypeScript and Vite production builds passed. Existing Zod annotation and bundle-size warnings remain.
- The broader Node 22 browser run passed 46 cases covering help, native playback, all four neighbourhood routes, gifts, legacy saves/checkpoints, corrupted saves, full opening/service/change/journal, word switching and focus on desktop and phone. Its two production-only offline cases rejected the invocation because the preview environment flag was missing. Both then passed with the required production preview config, giving 48 passing selected cases across the two runs.
- Independent GPT-6.1 Sol verifier ran exact `a204ec0`: six waiter cases plus two reduced-motion cases passed on Node 22.23.4. Journeys assert no console/page errors and no horizontal overflow. Screenshots were inspected against the pre-change baseline. No material visual regression was found.

The source after `a204ec0` adds tests and tightens only repairs speaker validation. It does not change valid authored content or its rendered output. Final offline verification at `9231a4b` passed both desktop and phone cases with that stricter validator in the production build.

```sh
pnpm test
pnpm build
JUNYAN_DEV_PORT=5300 JUNYAN_PREVIEW_PORT=5301 pnpm test:e2e e2e/waiter.spec.ts e2e/learning-help.spec.ts e2e/word-switch.spec.ts e2e/neighbourhood.spec.ts e2e/neighbourhood-save.spec.ts e2e/save.spec.ts
JUNYAN_NEIGHBOURHOOD_PREVIEW=1 JUNYAN_PREVIEW_PORT=5301 pnpm exec playwright test e2e/neighbourhood-offline.spec.ts --config playwright.neighbourhood.config.ts
```

## Independent review

All writers and reviewers used GPT-6.1 Sol as requested. Reviewers did not edit code.

- Root UI and persistence review passed for `8cd5bc2..cb7cafb`. The reviewer ran 60 UI/save tests and checked unchanged source against the integrated head.
- Content and neighbourhood review at `a204ec0` found one P2. Repair speaker names and voice IDs had become unrestricted strings. Unknown and English voices, and English or blank names, were accepted under the Mandarin policy.
- The original writer fixed that boundary in `085c0f7`, using the selected policy and voice catalog. Six new tests reject those values and accept valid Mandarin and French speaker metadata.
- A fresh GPT-6.1 Sol reviewer passed exact `085c0f7` after running all six tests, TypeScript, and independent invalid/missing/prototype-key voice and mixed-script name probes. No review findings remain.

## Screenshots

The independent verifier captured these at `a204ec0`. Both the verifier and coordinator inspected the actual phone and desktop images.

| Desktop | Phone |
|---|---|
| ![Restaurant desktop](desktop-restaurant.png) | ![Restaurant phone](phone-restaurant.png) |
| ![Hospital opening](desktop-opening.png) | ![Journal phone](phone-journal.png) |

Browsers were muted. Playback tests exercise native media and existing real assets, but this refactor does not add an auditory-quality assessment. No dependencies, lockfile, authored Mandarin JSON or audio assets changed.
