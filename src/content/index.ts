import { z } from 'zod';
import type { Character, Content, Food, Line, Order, Word } from '../contracts';
import data from './content.json';
import voiceData from './voices.json';

const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
const voicePreset = z.strictObject({
  engine: z.enum(['qwen', 'kokoro']), model: z.string().min(1), revision: z.string().regex(/^[a-f0-9]{40}$/),
  speaker: z.string().min(1), language: z.string().min(1), speed: z.number().min(0.5).max(2), instructions: z.string().nullable(),
}).superRefine((preset, ctx) => {
  if (preset.engine === 'qwen' && preset.speed !== 1) ctx.addIssue({code: 'custom', message: 'Qwen requires speed 1', path: ['speed']});
  if (preset.engine === 'kokoro' && preset.instructions !== null) ctx.addIssue({code: 'custom', message: 'Kokoro does not support instructions', path: ['instructions']});
});
export const voicesSchema = z.strictObject({
  wordVoice: id, voices: z.record(id, voicePreset),
}).refine(value => Boolean(value.voices[value.wordVoice]), 'Unknown word voice');
export const voices = voicesSchema.parse(voiceData);

const audio = z.string().regex(/^\/audio\/[a-z0-9-]+\.(m4a|wav)$/);
const wordSchema: z.ZodType<Word> = z.strictObject({
  id,
  hanzi: z.string().regex(/^[\p{Script=Han}]+$/u),
  pinyin: z.string().trim().min(1),
  gloss: z.string().trim().min(1),
  audio,
});
const lineSchema: z.ZodType<Line> = z.strictObject({
  id, tokens: z.array(wordSchema).min(1), audio,
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
  id, name: z.string().regex(/^[\p{Script=Han}]+$/u), voiceId: id,
  personality: z.string().min(1),
  appearance: z.strictObject({shirt: rgb, hair: rgb, accessory: z.enum(['bun', 'tie', 'glasses', 'backpack'])}),
  greeting: lineSchema, thanks: lineSchema, retry: lineSchema,
});

export const contentSchema = z.strictObject({
  characters: z.array(characterSchema).min(1),
  foods: z.array(foodSchema).min(1), orders: z.array(orderSchema).min(1),
  thanks: lineSchema, retry: lineSchema,
}).superRefine((value, ctx) => {
  const names = new Set(value.characters.map(character => character.name));
  if (names.size !== value.characters.length || new Set(value.characters.map(c => c.id)).size !== value.characters.length) {
    ctx.addIssue({code: 'custom', message: 'Duplicate character names or IDs', path: ['characters']});
  }
  value.characters.forEach((character, index) => {
    if (!voices.voices[character.voiceId]) ctx.addIssue({code: 'custom', message: 'Unknown character voice', path: ['characters', index, 'voiceId']});
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
});

export const content: Content = contentSchema.parse(data);

export function characterFor(customer: string): Character {
  return content.characters.find(character => character.name === customer)!;
}
