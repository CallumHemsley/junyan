import { describe, expect, it } from 'vitest';
import { content, contentSchema } from './index';
import rawMandarin from './content.json';
import rawFrench from './fixtures/french.json';
import { french, frenchContent, frenchSchema, frenchVoices } from './fixtures/french';
import { adaptMandarinContent } from './mandarin';
import { createContentSchema, createLineSchema, createPhraseSchema, createWordSchema } from './schema';
import { contentWords } from './words';
import { lineParts, lineText, mandarin } from '../language';
import { createGame, getOrder, orderTotal, reduceGame } from '../game';
import { createOpening, reduceOpening } from '../opening';
import { KITCHEN, TABLES } from '../contracts';

describe('language content boundary', () => {
  it('adapts Mandarin without changing saved word IDs or audio references', () => {
    const parsed = contentSchema.parse(adaptMandarinContent(rawMandarin));
    expect(contentWords(parsed)).toEqual(contentWords(content));
    expect(parsed.foods[0].word).toEqual({
      id: rawMandarin.foods[0].word.id,
      text: rawMandarin.foods[0].word.hanzi,
      pronunciation: rawMandarin.foods[0].word.pinyin,
      gloss: rawMandarin.foods[0].word.gloss,
      audio: rawMandarin.foods[0].word.audio,
    });
    expect(contentSchema.safeParse(rawMandarin).success).toBe(false);
    expect(createWordSchema(mandarin).safeParse({ ...parsed.foods[0].word, pronunciation: undefined }).success).toBe(false);
  });

  it('rejects conflicting legacy and neutral keys rather than losing either value', () => {
    const word = rawMandarin.foods[0].word;
    for (const mixed of [{ ...word, text: 'different' }, { ...word, pronunciation: 'different' }]) {
      expect(createWordSchema(mandarin).safeParse(adaptMandarinContent(mixed)).success).toBe(false);
    }
  });

  it('validates an authored French pack without Mandarin fields or pronunciation', () => {
    expect(frenchSchema.parse(rawFrench)).toEqual(frenchContent);
    expect(frenchContent.characters[0].name).toBe('Élodie');
    expect(frenchContent.foods[0].word).toMatchObject({ id: 'tea', text: 'thé' });
    expect(frenchContent.foods[0].word).not.toHaveProperty('pronunciation');
    expect(contentSchema.safeParse(rawFrench).success).toBe(false);
    expect(frenchSchema.safeParse({ ...rawFrench, language: 'zh-CN' }).success).toBe(false);
    expect(frenchSchema.parse({ ...rawFrench, language: undefined }).language).toBe('fr-FR');
  });

  it('checks references against the supplied voice catalog and target language', () => {
    for (const voiceId of ['missing', 'premise']) {
      const character = structuredClone(rawFrench);
      character.characters[0].voiceId = voiceId;
      expect(frenchSchema.safeParse(character).success).toBe(false);
      const cast = structuredClone(rawFrench);
      cast.opening.cast[0].voices.zh = voiceId;
      expect(frenchSchema.safeParse(cast).success).toBe(false);
    }
    const missing = { ...frenchVoices, voices: { premise: frenchVoices.voices.premise } };
    expect(createContentSchema(french, missing).safeParse(rawFrench).success).toBe(false);
  });

  it('preserves French spacing, accents and apostrophes around tappable word tokens', () => {
    const line = frenchContent.orders[0].line;
    const parts = lineParts(line, french);
    expect(lineText(line, french)).toBe('Un thé, s’il vous plaît.');
    expect(parts.map(part => part.kind === 'word' ? part.word.text : part.text).join('')).toBe(lineText(line, french));
    expect(parts.filter(part => part.kind === 'word').map(part => part.word.id)).toEqual(['one', 'tea', 'please', 'you', 'kindly']);
    expect(lineText({ ...line, text: undefined }, french)).toBe('Un thé s’il vous plaît');
    expect(lineParts({ ...line, text: undefined }, french).filter(part => part.kind === 'text')).toHaveLength(4);
    for (const text of ['Un café, s’il vous plaît.', 'U,n thé, s’il vous plaît.', 'Un thé, vous s’il plaît.']) {
      expect(createLineSchema(french).safeParse({ ...line, text }).success).toBe(false);
    }
    expect(createPhraseSchema(french).safeParse({ ...line, text: undefined }).success).toBe(false);
  });

  it('preserves the current Mandarin token display while retaining authored speech', () => {
    const step = content.opening.steps.find(step => step.type === 'say')!;
    if (step.type !== 'say') throw new Error('Missing spoken opening step');
    expect(lineText(step.line)).toBe(step.line.text);
    expect(lineParts(step.line).every(part => part.kind === 'word')).toBe(true);
    expect(lineParts(step.line).map(part => part.kind === 'word' ? part.word.text : part.text).join(''))
      .toBe(step.line.tokens.map(word => word.text).join(''));
  });

  it('serves and gives change to four French customers using unchanged pure rules', () => {
    let state = createGame(frenchContent, 42);
    const act = (action: Parameters<typeof reduceGame>[1]) => { state = reduceGame(state, action, frenchContent); };
    act({ type: 'lookup', wordId: 'tea', now: 100 });
    for (const { table, x, y } of TABLES) {
      act({ type: 'move', position: { x, y: y + 1.5 } });
      act({ type: 'interact', table });
      const order = getOrder(state, table, frenchContent)!;
      expect(state.customers.find(customer => customer.table === table)?.phase).toBe('ordered');
      act({ type: 'move', position: { x: KITCHEN.x, y: KITCHEN.y + 1.5 } });
      act({ type: 'pickup', foodId: 'tea' });
      act({ type: 'move', position: { x, y: y + 1.5 } });
      act({ type: 'deliver', table, now: 200 });
      expect(state.customers.find(customer => customer.table === table)?.phase).toBe('checkout');
      act({ type: 'pay', table, change: order.paid - orderTotal(order, frenchContent) });
      expect(state.receipt).toEqual({ table, total: 3, change: 2 });
    }
    expect(state).toMatchObject({ served: 4, earnings: 12, mistakes: 0, ended: true });
    expect(state.journal.tea).toEqual({ lookups: 1, lastSeen: 100, recovered: true });
  });

  it('uses French words in the opening request and reply through the existing state machine', () => {
    let state = createOpening(frenchContent, 42);
    const act = (action: Parameters<typeof reduceOpening>[1]) => { state = reduceOpening(state, action, frenchContent); };
    act({ type: 'advance', now: 1 });
    act({ type: 'advance', now: 2 });
    act({ type: 'pickup', foodId: 'tea' });
    act({ type: 'deliver', table: 1, now: 3 });
    expect(state.feedback).toBe('thanks');
    act({ type: 'advance', now: 4 });
    act({ type: 'reply', option: 0 });
    act({ type: 'advance', now: 5 });
    expect(frenchContent.opening.steps[state.step].type).toBe('end');
    expect(Object.keys(state.recovered)).toEqual(['welcome', 'tea', 'yes']);
  });
});
