import { readFileSync, writeFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const spikePath = new URL('./content.js', import.meta.url);
const contentPath = new URL('../../src/content/content.json', import.meta.url);
const pending = '/audio/pending.wav';

const sandbox = { window: {} };
runInNewContext(readFileSync(spikePath, 'utf8'), sandbox);
const spike = sandbox.window.CONTENT;
const content = JSON.parse(readFileSync(contentPath, 'utf8'));
delete content.opening;

const known = new Map();
(function collect(value) {
  if (Array.isArray(value)) return value.forEach(collect);
  if (!value || typeof value !== 'object') return;
  if (typeof value.hanzi === 'string' && typeof value.id === 'string') {
    const existing = known.get(value.hanzi);
    if (existing && existing.id !== value.id) throw new Error(`${value.hanzi} maps to both ${existing.id} and ${value.id}`);
    known.set(value.hanzi, value);
  }
  Object.values(value).forEach(collect);
})(content);

const minted = {
  人: 'person', 醒: 'wake', 好的: 'okay', 王: 'wang', 医生: 'doctor', 年轻人: 'young-person', 还: 'still',
  记得: 'remember', 吗: 'ma', 是: 'be', 小姨: 'aunt', 别: 'dont', 担心: 'worry', 店: 'shop', 里: 'inside',
  帮: 'help', 好: 'good', 太好了: 'great', 谢: 'thank', 什么: 'what', 第一天: 'day-one', 早安小馆: 'shop-name',
};
const titleWords = {
  第一天: { pinyin: 'dì yī tiān', gloss: 'day one' },
  早安小馆: { pinyin: "Zǎo'ān Xiǎoguǎn", gloss: 'Good Morning Diner' },
};
function word(hanzi) {
  if (known.has(hanzi)) return known.get(hanzi);
  const id = minted[hanzi];
  const entry = spike.words[hanzi] ?? titleWords[hanzi];
  if (!id || !entry) throw new Error(`No id or dictionary entry for ${hanzi}`);
  return { id, hanzi, pinyin: entry.pinyin, gloss: entry.gloss, audio: pending };
}

const lineIds = new Set();
function phrase(id, zh) {
  if (lineIds.has(id)) throw new Error(`Duplicate line id ${id}`);
  lineIds.add(id);
  const parts = zh.split(' ');
  const text = parts.join('');
  return { id, tokens: parts.filter(part => !/^[，。！？·]$/u.test(part)).map(word), audio: pending, text };
}

const cast = { grandpa: 'elder' };
const who = name => cast[name] ?? name;
const ids = hanzi => hanzi.map(h => word(h).id);
const staging = step => ({
  ...(step.enter && { enter: step.enter.map(who) }),
  ...(step.leave && { leave: step.leave.map(who) }),
});

const names = {
  '人 醒 了 。 我 明天 再 来 看看 。': 'doctor-awake',
  '好的 ， 王 医生 。': 'nurse-okay',
  '早上好 ， 年轻人 。 请 给 我 一 杯 豆浆 。': 'elder-milk',
  '不 对 ， 我 要 豆浆 。': 'elder-milk-wrong',
  '谢谢 你 ！': 'elder-milk-thanks',
  '我 还 想 要 一 个 鸡蛋 。': 'elder-egg',
  '不 对 ， 我 要 鸡蛋 。': 'elder-egg-wrong',
  '谢谢 ， 谢谢 ！': 'elder-egg-thanks',
  '你 醒 了 ！ 还 记得 我 吗 ？ 我 是 你 小姨 。': 'aunt-awake',
  '别 担心 ， 慢慢 来 。': 'aunt-worry',
  '明天 来 店 里 帮 我 ， 好 吗 ？': 'aunt-shop',
  '太好了 ！ 明天 见 。': 'aunt-great',
  '谢 什么 呀 ！ 明天 见 。': 'aunt-welcome',
};
const named = zh => {
  if (!names[zh]) throw new Error(`No line id for ${zh}`);
  return phrase(names[zh], zh);
};
const foodId = hanzi => {
  const food = content.foods.find(item => item.word.hanzi === hanzi);
  if (!food) throw new Error(`No food for ${hanzi}`);
  return food.id;
};

const steps = [...spike.variants.A.intro, ...spike.shared.filter(step => !step.only || step.only === 'A')].map(step => {
  switch (step.type) {
    case 'say':
      return step.en
        ? { type: 'say-en', who: who(step.who), en: step.en, audio: pending, ...staging(step) }
        : { type: 'say', who: who(step.who), line: named(step.zh), recover: ids(step.recover ?? []), ...staging(step) };
    case 'request':
      return {
        type: 'request', who: who(step.who), line: named(step.zh), want: foodId(step.want),
        wrong: named(step.wrongZh), ok: named(step.okZh), recover: ids(step.recover), ...staging(step),
      };
    case 'reply':
      return {
        type: 'reply', who: 'aunt',
        options: step.options.map(option => ({ word: word(option.zh), answer: named(option.answerZh), recover: ids(option.recover) })),
      };
    case 'end':
      return { type: 'end', title: phrase('end-title', '第一天 · 早安小馆') };
    default:
      throw new Error(`Unhandled step type ${step.type}`);
  }
});

content.opening = {
  cast: [
    { id: 'doctor', name: spike.cast.doctor.name, voices: { zh: 'ryan-zh', en: 'ryan-en' } },
    { id: 'nurse', name: spike.cast.nurse.name, voices: { zh: 'vivian' } },
    { id: 'elder', name: spike.cast.grandpa.name, voices: { zh: 'uncle-fu-levelled' } },
    { id: 'aunt', name: spike.cast.aunt.name, voices: { zh: 'serena-levelled' } },
  ],
  tray: spike.items.map(foodId),
  steps,
};
writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\n`);
console.log(`Wrote ${steps.length} opening steps to src/content/content.json`);
