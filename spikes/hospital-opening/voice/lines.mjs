// Prints variant A's voiced lines as JSON: [{ key, who, lang, text }].
// `key` is the exact string in content.js; `text` is what the model speaks.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const here = new URL('..', import.meta.url);
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(new URL('content.js', here), 'utf8'), sandbox);
const C = sandbox.window.CONTENT;
const variant = process.argv[2] || 'A';

const run = C.variants[variant].intro.concat(C.shared).filter((s) => !s.only || s.only === variant);
const lines = [];
const add = (key, who, lang) => {
  if (key && !lines.some((l) => l.key === key)) {
    lines.push({ key, who, lang, text: lang === 'zh' ? key.split(' ').join('') : key });
  }
};
let lastWho = null;
for (const s of run) {
  if (s.who) lastWho = s.who;
  if (s.type === 'say') add(s.en || s.zh, s.who, s.en ? 'en' : 'zh');
  if (s.type === 'request') for (const k of [s.zh, s.wrongZh, s.okZh]) add(k, s.who, 'zh');
  if (s.type === 'reply') for (const o of s.options) add(o.answerZh, lastWho, 'zh');
}
const words = Object.keys(C.words).map((h) => ({ key: h, who: 'word', lang: 'zh', text: h }));
process.stdout.write(JSON.stringify({ variant, lines, words }, null, 2));
