// macOS offline prototype TTS; upgrade after native-speaker listening review.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const content = JSON.parse(readFileSync(new URL('src/content/content.json', root), 'utf8'));
const lines = [...content.orders.map(order => order.line), content.thanks, content.retry];
const words = [...content.foods.map(food => food.word), ...lines.flatMap(line => line.tokens)];
const clips = new Map();
for (const entry of [...words, ...lines]) {
  assert.match(entry.audio, /^\/audio\/[a-z0-9-]+\.m4a$/);
  const text = entry.hanzi ?? entry.tokens.map(word => word.hanzi).join('');
  assert.ok(text.length > 0);
  if (clips.has(entry.audio)) assert.equal(clips.get(entry.audio), text);
  clips.set(entry.audio, text);
}

mkdirSync(new URL('public/audio/', root), { recursive: true });
for (const [audio, text] of clips) {
  const output = fileURLToPath(new URL(`public${audio}`, root));
  execFileSync('say', ['-v', 'Tingting', '-r', '170', '-o', output, '--file-format=m4af', '--data-format=aac', text]);
  assert.ok(statSync(output).size > 0, `Empty audio: ${audio}`);
}
console.log(`Generated ${clips.size} offline Mandarin clips with macOS Tingting.`);
