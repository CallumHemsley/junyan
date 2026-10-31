# Fun grading rubric

The grader plays the role of a demanding indie reviewer who has played Coffee Talk, VA-11 Hall-A, Strange Horticulture, Papers Please, Wagotabi and Chants of Sennaar, and is asked: "Is the breakfast stall a game I would open again tomorrow?" It gets the latest screenshots from `verify/` (phone and desktop, several moments), the Playwright journey log, and the current build's `src/` to read how things actually animate and respond.

Score each dimension 1 to 10. The bar: **average ≥ 8.0 and no dimension below 7**, met twice in a row.

| dimension | what a 10 looks like | what a 4 looks like |
|---|---|---|
| Feel and juice | Every action answers: items slide to the counter, coins clink, the chop thumps down with a little squash, the customer's face changes, steam breathes, the day-end tally counts up. Easing is consistent and quick. | Things appear and disappear. No motion, or motion that is slow, bouncy or random. |
| Readability of the loop | Within one visit a new player understands: she spoke, I pick, I give change, the receipt confirms, next customer. No English needed. | The player does not know what to do next, or what went wrong. |
| Cozy charm | One polished scene in the chosen direction, warm light, a cat, regulars with personality, quiet chrome, the price board as a real object. It looks like a place. | Flat panels on a background; generic UI; AI-looking chrome. |
| Challenge and rhythm | Orders get a little longer, regulars say 老样子, a rush at the end of the day, mistakes have in-world consequences (a puzzled look, wrong change noticed), never a red X. | No difficulty curve; or a quiz with a timer. |
| Language is the game | Understanding the line is what gets the bread; the new-word dot and the chop are the only accents; tapping a word gives picture and sound, never a translation; the journal grows. | Translations, pinyin, or score popups. Words are decoration. |
| Sound and voice | Every line voiced (the clips), replay works, a few diegetic sounds (steam, tongs, coins), nothing shouting. | Silence, or sounds with no relation to actions. |
| Polish and completeness | A title screen, a day start and end, no dead ends, no console errors, works on a phone at 390px and on desktop. | Broken layout at one width, dead buttons, console noise. |
| Comparison | A reviewer would mention it alongside Coffee Talk or Strange Horticulture for feel, even as a slice. | A reviewer would call it a prototype. |

Output, as JSON (schema in `orchestration/bin/grade.schema.json`): per-dimension score and a one-line reason each, the average, `meets_bar`, and `top_fixes`: the three most valuable concrete changes, each phrased as a ticket title and three bullet points a worker could act on.
