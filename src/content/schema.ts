import { z } from 'zod';
import type { CastMember, Character, Food, Line, Opening, OpeningStep, Order, Phrase, Word } from '../contracts';
import type { LanguagePolicy } from '../language';
import type { VoiceCatalog } from './voices';
import { stepPhrasePaths } from './words';

const audio = z.string().regex(/^\/audio\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(m4a|wav)$/);
const contentId = z.string().regex(/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)*$/);
export function createWordSchema(policy: LanguagePolicy): z.ZodType<Word> {
  return z.strictObject({
    id: contentId,
    text: z.string().min(1).regex(policy.wordPattern),
    pronunciation: policy.pronunciationRequired ? z.string().trim().min(1) : z.string().trim().min(1).optional(),
    gloss: z.string().trim().min(1),
    audio,
  });
}

function matchesTokens(line: Line, policy: LanguagePolicy): boolean {
  if (line.text === undefined) return true;
  if (!policy.renderAuthoredText) {
    return line.text.replace(policy.punctuationPattern, '') === line.tokens.map(word => word.text).join('');
  }
  let cursor = 0;
  for (const word of line.tokens) {
    const start = line.text.indexOf(word.text, cursor);
    if (start < cursor || line.text.slice(cursor, start).replace(policy.punctuationPattern, '') !== '') return false;
    cursor = start + word.text.length;
  }
  return line.text.slice(cursor).replace(policy.punctuationPattern, '') === '';
}

export function createLineSchema(policy: LanguagePolicy): z.ZodType<Line> {
  const wordSchema = createWordSchema(policy);
  return z.strictObject({
    id: contentId, tokens: z.array(wordSchema).min(1), audio, text: z.string().min(1).regex(policy.speechPattern).optional(),
  }).refine(line => matchesTokens(line, policy), 'Line text must equal its tokens plus punctuation');
}

export function createPhraseSchema(policy: LanguagePolicy): z.ZodType<Phrase> {
  return z.strictObject({
    id: contentId, tokens: z.array(createWordSchema(policy)).min(1), audio, text: z.string().min(1).regex(policy.speechPattern),
  }).refine(line => matchesTokens(line, policy), 'Phrase text must equal its tokens plus punctuation');
}

export function createContentSchema(policy: LanguagePolicy, voices: VoiceCatalog) {
  const wordSchema = createWordSchema(policy);
  const lineSchema = createLineSchema(policy);
  const phraseSchema = createPhraseSchema(policy);
  const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
  const castSchema: z.ZodType<CastMember> = z.strictObject({
    id, name: z.string().regex(policy.wordPattern), voices: z.strictObject({ zh: id, en: id.optional() }),
  });
  const staging = { enter: z.array(id).optional(), leave: z.array(id).optional() };
  const recover = z.array(id);
  const openingStepSchema: z.ZodType<OpeningStep> = z.discriminatedUnion('type', [
    z.strictObject({ type: z.literal('say-en'), who: id, en: z.string(), audio, ...staging }),
    z.strictObject({ type: z.literal('say'), who: id, line: phraseSchema, recover, ...staging }),
    z.strictObject({ type: z.literal('request'), who: id, line: phraseSchema, want: id, wrong: phraseSchema, ok: phraseSchema, recover, ...staging }),
    z.strictObject({ type: z.literal('reply'), who: id, options: z.array(z.strictObject({ word: wordSchema, answer: phraseSchema, recover })), ...staging }),
    z.strictObject({ type: z.literal('end'), title: phraseSchema }),
  ]);
  const openingSchema: z.ZodType<Opening> = z.strictObject({
    cast: z.array(castSchema).min(1), tray: z.array(id).min(1), steps: z.array(openingStepSchema).min(1),
  });

  const foodSchema: z.ZodType<Food> = z.strictObject({
    id, word: wordSchema, price: z.number().int().positive(),
    kind: z.enum(['bun', 'bread', 'egg', 'milk', 'porridge', 'youtiao', 'dumpling']),
  });
  const orderSchema: z.ZodType<Order> = z.strictObject({
    id, level: z.number().int().min(1).max(3),
    customer: z.string().min(1),
    table: z.number().int().min(1).max(4), line: lineSchema,
    items: z.array(z.strictObject({ foodId: id, quantity: z.number().int().positive() })).min(1),
    paid: z.number().int().positive(),
  });

  const rgb = z.tuple([z.number().int().min(0).max(255), z.number().int().min(0).max(255), z.number().int().min(0).max(255)]);
  const characterSchema: z.ZodType<Character> = z.strictObject({
    id, name: z.string().regex(policy.wordPattern), voiceId: id,
    personality: z.string().min(1),
    appearance: z.strictObject({shirt: rgb, hair: rgb, accessory: z.enum(['bun', 'tie', 'glasses', 'backpack'])}),
    greeting: lineSchema, thanks: lineSchema, retry: lineSchema,
  });

  const schema = z.strictObject({
    language: z.literal(policy.id).default(policy.id),
    neighbourhood: z.strictObject({
      words: z.array(wordSchema),
      lines: z.array(lineSchema),
    }).optional(),
    help: z.strictObject({
      welcome: lineSchema, lookup: lineSchema, pace: lineSchema,
      steps: z.tuple([
        z.strictObject({id: z.literal('order'), line: lineSchema}),
        z.strictObject({id: z.literal('kitchen'), line: lineSchema}),
        z.strictObject({id: z.literal('deliver'), line: lineSchema}),
      ]),
    }),
    characters: z.array(characterSchema).min(1),
    foods: z.array(foodSchema).min(1), orders: z.array(orderSchema).min(1),
    thanks: lineSchema, retry: lineSchema,
    opening: openingSchema,
  }).superRefine((value, ctx) => {
    const names = new Set(value.characters.map(character => character.name));
    if (names.size !== value.characters.length || new Set(value.characters.map(c => c.id)).size !== value.characters.length) {
      ctx.addIssue({code: 'custom', message: 'Duplicate character names or IDs', path: ['characters']});
    }
    value.characters.forEach((character, index) => {
      if (!policy.targetVoiceLanguages.includes(voices.voices[character.voiceId]?.language)) ctx.addIssue({code: 'custom', message: 'Unknown target-language character voice', path: ['characters', index, 'voiceId']});
    });
    const foods = new Map(value.foods.map(food => [food.id, food]));
    if (foods.size !== value.foods.length) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate food IDs', path: ['foods'] });
    }
    if (new Set(value.orders.map(order => order.id)).size !== value.orders.length) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate order IDs', path: ['orders'] });
    }
    value.orders.forEach((order, index) => {
      if (!names.has(order.customer)) ctx.addIssue({code: 'custom', message: 'Unknown character', path: ['orders', index, 'customer']});
      let total = 0;
      order.items.forEach((item, itemIndex) => {
        const food = foods.get(item.foodId);
        if (!food) {
          ctx.addIssue({ code: 'custom', message: 'Unknown food', path: ['orders', index, 'items', itemIndex, 'foodId'] });
        } else {
          total += food.price * item.quantity;
        }
      });
      if (order.paid < total) {
        ctx.addIssue({ code: 'custom', message: 'Payment does not cover order', path: ['orders', index, 'paid'] });
      }
    });
    refineOpening(value.opening, foods, ctx);
  });

  function refineOpening(opening: Opening, foods: Map<string, Food>, ctx: z.RefinementCtx) {
    const issue = (message: string, ...path: (string | number)[]) => ctx.addIssue({ code: 'custom', message, path: ['opening', ...path] });
    const cast = new Map(opening.cast.map(member => [member.id, member]));
    if (cast.size !== opening.cast.length) issue('Duplicate cast IDs', 'cast');
    opening.cast.forEach((member, index) => {
      const slots: ['zh' | 'en', readonly string[]][] = [['zh', policy.targetVoiceLanguages], ['en', ['English']]];
      for (const [slot, languages] of slots) {
        const voiceId = member.voices[slot];
        if (voiceId === undefined) continue;
        if (!languages.includes(voices.voices[voiceId]?.language)) issue(`Cast ${slot} voice must be a known ${slot === 'zh' ? policy.id : 'English'} preset`, 'cast', index, 'voices', slot);
      }
    });
    opening.tray.forEach((foodId, index) => {
      if (!foods.has(foodId)) issue('Unknown tray food', 'tray', index);
    });
    const firstTarget = opening.steps.findIndex(step => step.type !== 'say-en');
    opening.steps.forEach((step, index) => {
      const phrases = stepPhrasePaths(step);
      if (step.type === 'end') {
        if (index !== opening.steps.length - 1) issue('The end step must be last', 'steps', index);
        return;
      }
      if (!cast.has(step.who)) issue('Unknown cast member', 'steps', index, 'who');
      for (const key of ['enter', 'leave'] as const) {
        step[key]?.forEach((castId, castIndex) => {
          if (!cast.has(castId)) issue('Unknown cast member', 'steps', index, key, castIndex);
        });
      }
      if (step.type === 'say-en') {
        if (!cast.get(step.who)?.voices.en) issue('An English step needs a speaker with an English voice', 'steps', index, 'who');
        if (!/^[\x20-\x7E]{1,180}$/.test(step.en)) issue('English text must be 1 to 180 printable ASCII characters', 'steps', index, 'en');
        if (firstTarget !== -1 && index > firstTarget) issue('English steps must come before the first target-language step', 'steps', index);
        return;
      }
      const stepWords = new Set(phrases.flatMap(([, phrase]) => phrase.tokens.map(word => word.id)));
      const recovers = step.type === 'reply' ? step.options.map((option, optionIndex) => {
        stepWords.add(option.word.id);
        return [['options', optionIndex, 'recover'], option.recover] as const;
      }) : [[['recover'], step.recover] as const];
      for (const [path, ids] of recovers) {
        ids.forEach((wordId, wordIndex) => {
          if (!stepWords.has(wordId)) issue('Recovered word is not in this step', 'steps', index, ...path, wordIndex);
        });
      }
      if (step.type === 'request') {
        const wanted = foods.get(step.want)?.word.id;
        if (!opening.tray.includes(step.want)) issue('Wanted food is not on the tray', 'steps', index, 'want');
        if (!step.line.tokens.some(word => word.id === wanted) || !step.wrong.tokens.some(word => word.id === wanted)) {
          issue('Wanted food must be named in the request and the correction', 'steps', index, 'want');
        }
      }
      if (step.type === 'reply' && (step.options.length < 2 || new Set(step.options.map(option => option.word.id)).size !== step.options.length)) {
        issue('A reply needs at least two options with distinct words', 'steps', index, 'options');
      }
    });
    if (opening.steps.filter(step => step.type === 'end').length !== 1) issue('The opening needs exactly one end step', 'steps');
  }

  return schema;
}
