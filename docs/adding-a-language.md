# Add a learning language

Ship a complete offline content pack with matching interface copy and audio. Mandarin remains the active production language. The French files in `src/content/fixtures/` prove the content and rendering contracts in tests. Their audio paths and voice presets are placeholders, so they are not a playable production pack.

1. Define a `LanguagePolicy` in `src/language/index.ts` and select it with the `language` export.

   Give the policy a stable locale ID, document locale and text direction. Set the token separator, word and speech patterns, removable punctuation, pronunciation requirement and accepted voice-provider language names. Mandarin accepts the provider names `Chinese` and `z`. A spaced script can set `tokenSeparator: ' '` and `renderAuthoredText: true` to preserve authored spaces and punctuation around tappable words. `lineParts` uses the supplied tokens. It never segments dialogue.

2. Author the main pack and voice catalog, then select both in `src/content/index.ts`.

   Use neutral words with `{ id, text, pronunciation?, gloss, audio }`. Lines contain those complete words in spoken order. Set `text` when spacing or punctuation needs exact authoring. Opening phrases require it. Add local audio files under `public/audio/` and validate provider presets with `voicesSchema` before passing the catalog to `createContentSchema(language, catalog)`. The parser supplies the pack's `language` ID and rejects a mismatched one.

   Keep word, food, order and character IDs stable within a language. Orders refer to character display names, so translate the matching character names and order references together. The opening's `say-en` steps remain a bounded English premise. In its legacy `voices` object, `zh` is the target-language voice slot and `en` is the English-premise slot. The parser checks `zh` against the selected policy's accepted voice languages. A new target language does not require a Chinese voice.

   The existing Mandarin JSON retains `{ hanzi, pinyin }` for its audio generators. `adaptMandarinContent` converts those keys once at the loading boundary and leaves IDs and audio paths intact. New neutral packs can pass directly into the schema. Do not change the Mandarin authoring files just to translate runtime field names.

3. Replace the feature content and all four interface catalogs in the same change.

   Select the translated `UiCopy` through `ui` in `src/language/ui.ts`. Select the feature copy through `featureUi` in `src/features/copy.ts` and the neighbourhood copy through `neighbourhoodUi` in `src/neighbourhood/copy.ts`. Select progression labels and money formatting through `progressionUi` in `src/progression/copy.ts`. Include accessible names, money and day formatting, word-card controls and loading or audio messages. Keep pronunciation inside the word card.

   Progression catalog labels, modifiers, and targets reference stable word IDs. `src/progression/identities.json` assigns those IDs to opaque semantic keys. Never translate those keys or compare them with displayed text. New words use an ID-based fallback until their semantic identity is reviewed. Preserve existing identities when adding aliases or another sense.

   Supply translated content for `src/features/{apartment,cats,repairs,garden}/content.json` and update their selected voice references. The feature loaders use the shared policy schemas. `registerFeatureContent` and `attachFeatureContent` in `src/neighbourhood/content.ts` accept the selected policy and verify shared word IDs and metadata. Supply the translated neighbourhood dialogue too. Keeping a Mandarin feature bundle while switching only the root policy causes validation failures or mixed-language play.

4. Update static page and install metadata, then check fonts and layout.

   `src/main.tsx` sets the live document language, direction and title from the selected policy and UI catalog. Also update `index.html` and `public/manifest.webmanifest` for the static title, install name and manifest language. Inspect the chosen script with the fonts in `docs/design/tokens.css`, including accents, punctuation, long labels and right-to-left layout when applicable. Keep dialogue as real DOM text and preserve the design system's touch targets and reduced-motion behavior.

5. Prove the new pack through rules, persistence and a browser journey.

   Start from `src/content/language.test.ts`. Parse the authored pack, reject invalid voice and word references, preserve exact display text through `lineParts`, complete the opening, serve customers, give change and journal a word. Add audio-manifest checks for every production recording. Run `pnpm test` and `pnpm build`, then run Playwright against an explicit Vite port with `strictPort: true`. Inspect phone and desktop screenshots and check the browser console.

   Save and recovery keys use `content.language`. Mandarin retains its existing keys and IDs, while another language receives its own progress slots. Test that switching packs preserves both sets of progress. A language selector and a translated setting require separate product work. Static selection must switch policy, content, voice catalog and interface catalogs together.
