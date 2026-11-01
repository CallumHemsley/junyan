import { z } from 'zod';
import type { Content, Food, Line, Order, Word } from '../contracts';
import data from './content.json';

const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
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
  customer: z.enum(['王奶奶', '小李', '张老师', '小周']),
  table: z.number().int().min(1).max(4), line: lineSchema,
  items: z.array(z.strictObject({ foodId: id, quantity: z.number().int().positive() })).min(1),
  paid: z.number().int().positive(),
});

export const contentSchema = z.strictObject({
  foods: z.array(foodSchema).min(1), orders: z.array(orderSchema).min(1),
  thanks: lineSchema, retry: lineSchema,
}).superRefine((value, ctx) => {
  const foods = new Map(value.foods.map(food => [food.id, food]));
  if (foods.size !== value.foods.length) {
    ctx.addIssue({ code: 'custom', message: 'Duplicate food IDs', path: ['foods'] });
  }
  if (new Set(value.orders.map(order => order.id)).size !== value.orders.length) {
    ctx.addIssue({ code: 'custom', message: 'Duplicate order IDs', path: ['orders'] });
  }
  value.orders.forEach((order, index) => {
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
