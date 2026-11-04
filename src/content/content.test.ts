import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { content, contentSchema, voices, voicesSchema } from './index';
import { contentLines, contentWords, stepPhrases } from './words';
import { createGame, reduceGame } from '../game';
import type { Content, OpeningStep } from '../contracts';

const lines = contentLines(content);
const words = contentWords(content);
const opening = content.opening;
const englishSteps = opening.steps.flatMap(step => step.type === 'say-en' ? [step] : []);
const restaurantWords = contentWords({...content, opening: {...opening, steps: []}});
const nth = <T extends OpeningStep['type']>(copy: Content, type: T) =>
  copy.opening.steps.find((step): step is Extract<OpeningStep, {type: T}> => step.type === type)!;

describe('offline Mandarin content', () => {
  it('validates the shared contract and rejects malformed or unsafe content', () => {
    expect(contentSchema.safeParse(content).success).toBe(true);
    for (const modify of [
      (copy: typeof content) => { copy.foods[0].price = 1.5; },
      (copy: typeof content) => { copy.foods[0].word.audio = 'https://example.com/audio.m4a'; },
      (copy: typeof content) => { copy.orders[0].line.tokens = []; },
      (copy: typeof content) => { copy.orders[0].items[0].foodId = 'unknown'; },
      (copy: typeof content) => { copy.orders[0].items[0].quantity = 0; },
      (copy: typeof content) => { copy.orders[0].paid = 1; },
      (copy: typeof content) => { copy.foods.push(copy.foods[0]); },
      (copy: typeof content) => { copy.orders.push(copy.orders[0]); },
      (copy: typeof content) => { copy.characters.push(copy.characters[0]); },
      (copy: typeof content) => { copy.characters[0].voiceId = 'missing'; },
      (copy: typeof content) => { copy.orders[0].customer = '不存在'; },
      (copy: typeof content) => { copy.help.lookup.tokens = []; },
      (copy: typeof content) => { copy.help.steps.reverse(); },
      (copy: typeof content) => { copy.help.pace.audio = 'https://example.com/help.wav'; },
      (copy: Content) => { copy.opening.steps.splice(5, 0, copy.opening.steps.shift()!); },
      (copy: Content) => { nth(copy, 'say').who = 'ghost'; },
      (copy: Content) => { nth(copy, 'say-en').who = 'nurse'; },
      (copy: Content) => { copy.opening.cast[0].voices.zh = 'ryan-en'; },
      (copy: Content) => { nth(copy, 'say').line.text = 'OK人醒了。我明天再来看看。'; },
      (copy: Content) => { nth(copy, 'say').line.text = '人醒了。'; },
      (copy: Content) => { nth(copy, 'say').line.tokens[2].hanzi = '。'; },
      (copy: Content) => { nth(copy, 'request').recover = ['bun']; },
      (copy: Content) => { nth(copy, 'request').want = 'bun'; },
      (copy: Content) => { copy.opening.steps.splice(-2, 0, copy.opening.steps.pop()!); },
      (copy: Content) => { copy.opening.steps.push(structuredClone(copy.opening.steps.at(-1)!)); },
      (copy: Content) => { copy.opening.cast.push(structuredClone(copy.opening.cast[1])); },
    ]) {
      const copy = structuredClone(content);
      modify(copy);
      expect(contentSchema.safeParse(copy).success, modify.toString()).toBe(false);
    }
  });

  it('authors the complete help sequence and journals its vocabulary', () => {
    expect(content.help.steps.map(step => [step.id, step.line.tokens.map(word => word.hanzi).join('')])).toEqual([
      ['order', '点桌子听客人点餐'], ['kitchen', '去厨房拿早饭'], ['deliver', '送早饭再找零'],
    ]);
    const knownWords = contentWords(content);
    for (const line of [content.help.welcome, content.help.lookup, content.help.pace, ...content.help.steps.map(step => step.line)]) {
      for (const word of line.tokens) {
        expect(knownWords).toContainEqual(word);
        const state = reduceGame(createGame(content, 42), {type: 'lookup', wordId: word.id, now: 123}, content);
        expect(state.journal[word.id]).toEqual({lookups: 1, lastSeen: 123, recovered: false});
      }
    }
  });

  it('casts each regular with a stable voice, unique reactions and data-driven appearance', () => {
    expect(voicesSchema.safeParse(voices).success).toBe(true);
    expect(voicesSchema.safeParse({...voices, wordVoice: 'missing'}).success).toBe(false);
    for (const [voiceId, update] of [
      ['serena', {speed: 1.2}], ['yunxi', {instructions: 'Speak warmly'}], ['xiaobei', {revision: 'main'}],
    ] as const) {
      expect(voicesSchema.safeParse({...voices, voices: {...voices.voices,
        [voiceId]: {...voices.voices[voiceId], ...update},
      }}).success).toBe(false);
    }
    const levelled = voices.voices['ryan-en'];
    expect(levelled.loudness).toEqual({targetActiveRmsDbfs: -20, peakCeilingDbfs: -1});
    expect(voicesSchema.safeParse({wordVoice: 'ryan-en', voices: {'ryan-en': levelled}}).success).toBe(true);
    for (const loudness of [
      {targetActiveRmsDbfs: 0, peakCeilingDbfs: -1}, {targetActiveRmsDbfs: -20, peakCeilingDbfs: 1},
      {targetActiveRmsDbfs: -20, peakCeilingDbfs: -1, gain: 3},
    ]) {
      expect(voicesSchema.safeParse({...voices, voices: {...voices.voices,
        'ryan-en': {...levelled, loudness},
      }}).success).toBe(false);
    }
    expect(content.characters.map(c => [c.name, c.voiceId, c.appearance.accessory])).toEqual([
      ['林姐', 'serena', 'bun'], ['小李', 'yunxi', 'tie'],
      ['张老师', 'uncle-fu', 'glasses'], ['小周', 'xiaobei', 'backpack'],
    ]);
    for (const kind of ['greeting', 'thanks', 'retry'] as const) {
      expect(new Set(content.characters.map(c => c[kind].tokens.map(w => w.hanzi).join(''))).size).toBe(4);
      expect(new Set(content.characters.map(c => c[kind].audio)).size).toBe(4);
    }
  });

  it('supplies all seven foods with matching render kinds and spoken vocabulary', () => {
    expect(content.foods.map(food => [food.id, food.kind, food.word.hanzi])).toEqual([
      ['bun', 'bun', '包子'], ['bread', 'bread', '馒头'], ['egg', 'egg', '鸡蛋'],
      ['milk', 'milk', '豆浆'], ['porridge', 'porridge', '粥'],
      ['youtiao', 'youtiao', '油条'], ['dumpling', 'dumpling', '饺子'],
    ]);
    expect(new Set(content.orders.flatMap(order => order.items.map(item => item.foodId))).size).toBe(7);
  });

  it('keeps the four regulars at fixed tables at every level', () => {
    const customers = ['林姐', '小李', '张老师', '小周'];
    for (const level of [1, 2, 3]) {
      const orders = content.orders.filter(order => order.level === level);
      expect(orders).toHaveLength(4);
      expect(orders.map(order => order.customer)).toEqual(customers);
      expect(orders.map(order => order.table)).toEqual([1, 2, 3, 4]);
    }
  });

  it('increases recall difficulty while respecting tray capacity and integer change', () => {
    for (const order of content.orders) {
      const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
      expect(new Set(order.items.map(item => item.foodId)).size).toBe(order.items.length);
      expect(quantity).toBeLessThanOrEqual(6);
      if (order.level === 1) {
        expect(order.items).toHaveLength(1);
        expect(quantity).toBe(1);
      } else if (order.level === 2) {
        expect(quantity).toBe(2);
      } else {
        expect(order.items).toHaveLength(3);
        expect(quantity).toBeGreaterThanOrEqual(3);
      }
      const total = order.items.reduce((sum, item) =>
        sum + content.foods.find(food => food.id === item.foodId)!.price * item.quantity, 0);
      expect([5, 10, 20]).toContain(order.paid);
      expect(Number.isInteger(order.paid - total)).toBe(true);
      expect(order.paid - total).toBeGreaterThanOrEqual(0);
    }
  });

  it('pre-segments exactly the foods and quantities requested, with natural classifiers', () => {
    const measures: Record<string, string> = {
      bun: '个', bread: '个', egg: '个', milk: '杯', porridge: '碗', youtiao: '根', dumpling: '碗',
    };
    const numbers: Record<number, string> = { 1: '一', 2: '两', 3: '三' };
    for (const order of content.orders) {
      const requested = order.items.map(item => [
        numbers[item.quantity], measures[item.foodId],
        content.foods.find(food => food.id === item.foodId)!.word.hanzi,
      ].join('')).join('和');
      const prefix = {1: '我想要', 2: '来', 3: '请给我', 4: '我要'}[order.table];
      expect(order.line.tokens.map(word => word.hanzi).join('')).toBe(`${prefix}${requested}`);
      for (const item of order.items) {
        expect(order.line.tokens).toContainEqual(content.foods.find(food => food.id === item.foodId)!.word);
      }
    }
    expect(content.thanks.tokens.map(word => word.hanzi).join('')).toBe('多谢');
    expect(content.retry.tokens.map(word => word.hanzi).join('')).toBe('再试试');
  });

  it('keeps English inside the premise steps', () => {
    const displayed = [
      ...lines.flatMap(line => ['text' in line ? line.text : '', ...line.tokens.map(word => word.hanzi)]),
      ...opening.steps.flatMap(step => step.type === 'reply' ? step.options.map(option => option.word.hanzi) : []),
      ...opening.cast.map(member => member.name),
    ];
    expect(displayed.filter(text => /[A-Za-z]/.test(text))).toEqual([]);
    expect(opening.steps.flatMap((step, index) => step.type === 'say-en' ? [index] : [])).toEqual([0, 1, 2, 3]);
  });

  it('reuses restaurant words and adds 22', () => {
    const tokens = new Map(opening.steps.flatMap(stepPhrases).flatMap(phrase => phrase.tokens).map(word => [word.hanzi, word]));
    const restaurant = new Map(restaurantWords.map(word => [word.id, word]));
    for (const [hanzi, id] of [['来', 'bring'], ['想', 'think'], ['个', 'piece'], ['呀', 'ha'], ['豆浆', 'milk'], ['鸡蛋', 'egg']]) {
      expect(tokens.get(hanzi)).toEqual(restaurant.get(id));
    }
    expect(opening.tray.map(id => content.foods.find(food => food.id === id)!.word))
      .toEqual(['milk', 'egg', 'bread'].map(id => restaurant.get(id)));
    expect(new Set(words.filter(word => !restaurant.has(word.id)).map(word => word.id)).size).toBe(22);
  });

  it('journals an opening word through the game rules', () => {
    const state = reduceGame(createGame(content, 42), {type: 'lookup', wordId: 'doctor', now: 123}, content);
    expect(state.journal.doctor).toMatchObject({lookups: 1, lastSeen: 123});
  });

  it('uses stable word IDs and lookup metadata without English or pinyin in display text', () => {
    const seen = new Map<string, typeof words[number]>();
    expect(new Set(lines.map(line => line.id)).size).toBe(lines.length);
    for (const word of words) {
      expect(word.hanzi).toMatch(/^[\p{Script=Han}]+$/u);
      expect(word.pinyin.length).toBeGreaterThan(0);
      expect(word.gloss).toMatch(/[a-z]/i);
      if (seen.has(word.id)) expect(word).toEqual(seen.get(word.id));
      seen.set(word.id, word);
    }
  });

  it('matches each generated line to its character voice and every word to the dictionary voice', () => {
    const manifest = JSON.parse(readFileSync(new URL('../../public/audio/manifest.json', import.meta.url), 'utf8'));
    const records = new Map<string, {text: string; voice: unknown; sha256: string}>(manifest.clips.map((clip: {filename: string}) => [`/audio/${clip.filename}`, clip]));
    const expected = content.characters.flatMap(character => [
      ...[character.greeting, character.thanks, character.retry],
      ...content.orders.filter(order => order.customer === character.name).map(order => order.line),
    ].map(line => ({entry: line, voiceId: character.voiceId, text: line.tokens.map(word => word.hanzi).join('')})));
    expected.push(...[content.thanks, content.retry, content.help.welcome, content.help.lookup, content.help.pace,
      ...content.help.steps.map(step => step.line)].map(line => ({entry: line, voiceId: voices.wordVoice, text: line.tokens.map(word => word.hanzi).join('')})));
    const cast = new Map(opening.cast.map(member => [member.id, member.voices]));
    for (const step of opening.steps) {
      if (step.type === 'say-en') {
        expect(records.get(step.audio)?.text).toBe(step.en);
        expect(records.get(step.audio)?.voice).toEqual(voices.voices[cast.get(step.who)!.en!]);
      }
      const voiceId = step.type === 'end' ? voices.wordVoice : cast.get(step.who)!.zh;
      expected.push(...stepPhrases(step).map(phrase => ({entry: phrase, voiceId, text: phrase.text})));
    }
    for (const {entry, voiceId, text} of expected) {
      expect(records.get(entry.audio)?.text).toBe(text);
      expect(records.get(entry.audio)?.voice).toEqual(voices.voices[voiceId]);
    }
    for (const word of words) {
      expect(records.get(word.audio)?.text).toBe(word.hanzi);
      expect(records.get(word.audio)?.voice).toEqual(voices.voices[voices.wordVoice]);
    }
    for (const path of new Set([...words, ...lines, ...englishSteps].map(entry => entry.audio))) {
      const bytes = readFileSync(new URL(`../../public${path}`, import.meta.url));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(records.get(path)?.sha256);
    }
  });

  it('resolves every full line and word to a real mono PCM16 24kHz WAV', () => {
    const audio = new Set([...words, ...lines, ...englishSteps].map(entry => entry.audio));
    for (const path of audio) {
      const file = new URL(`../../public${path}`, import.meta.url);
      expect(statSync(file).size, path).toBeGreaterThan(100);
      const bytes = readFileSync(file);
      expect(path).toMatch(/^\/audio\/(english|line|word)-[a-f0-9]+\.wav$/);
      expect(bytes.subarray(0, 4).toString(), path).toBe('RIFF');
      expect(bytes.subarray(8, 12).toString(), path).toBe('WAVE');
      expect(bytes.readUInt16LE(20), path).toBe(1);
      expect(bytes.readUInt16LE(22), path).toBe(1);
      expect(bytes.readUInt32LE(24), path).toBe(24000);
      expect(bytes.readUInt16LE(34), path).toBe(16);
    }
  });

  it('ships exactly the WAVs that content references and the manifest records', () => {
    const manifest = JSON.parse(readFileSync(new URL('../../public/audio/manifest.json', import.meta.url), 'utf8'));
    const referenced = new Set([...words, ...lines, ...englishSteps].map(entry => entry.audio.slice('/audio/'.length)));
    const files = readdirSync(new URL('../../public/audio/', import.meta.url)).filter(name => name.endsWith('.wav'));
    expect(files.length).toBe(manifest.clips.length);
    expect(new Set(files)).toEqual(referenced);
    expect(new Set(manifest.clips.map((clip: {filename: string}) => clip.filename))).toEqual(referenced);
  });
});
