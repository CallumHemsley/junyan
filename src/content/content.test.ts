import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { content, contentSchema } from './index';

const lines = [...content.orders.map(order => order.line), content.thanks, content.retry];
const words = [...content.foods.map(food => food.word), ...lines.flatMap(line => line.tokens)];

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
    ]) {
      const copy = structuredClone(content);
      modify(copy);
      expect(contentSchema.safeParse(copy).success).toBe(false);
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
    const customers = ['王奶奶', '小李', '张老师', '小周'];
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
      expect(order.line.tokens.map(word => word.hanzi).join('')).toBe(`我要${requested}`);
      for (const item of order.items) {
        expect(order.line.tokens).toContainEqual(content.foods.find(food => food.id === item.foodId)!.word);
      }
    }
    expect(content.thanks.tokens.map(word => word.hanzi).join('')).toBe('多谢');
    expect(content.retry.tokens.map(word => word.hanzi).join('')).toBe('再试试');
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

  it('resolves every full line and word to a nonempty local M4A file', () => {
    const audio = new Set([...words, ...lines].map(entry => entry.audio));
    for (const path of audio) {
      const file = new URL(`../../public${path}`, import.meta.url);
      expect(statSync(file).size, path).toBeGreaterThan(100);
      const bytes = readFileSync(file);
      expect(bytes.subarray(4, 8).toString(), path).toBe('ftyp');
      expect(bytes.includes(Buffer.from('mp4a')), path).toBe(true);
    }
  });
});
