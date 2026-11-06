import { z } from 'zod';
import { lineById, words as apartmentWords } from '../apartment/content';
import data from './briefs.json' with { type: 'json' };

export const briefIds = ['window', 'alcove'] as const;
export type BriefId = typeof briefIds[number];
const cell = z.strictObject({ x: z.number().int().min(0).max(4), y: z.number().int().min(0).max(3) });
const schema = z.array(z.strictObject({
  id: z.enum(briefIds), instructions: z.array(z.enum(['window', 'left', 'rotate'])).min(1),
  windowColumns: z.array(z.number().int().min(0).max(4)).min(1), requiresRotation: z.boolean(), fixtures: z.array(cell),
})).length(2).superRefine((briefs, ctx) => {
  if (briefs.some((brief, index) => brief.id !== briefIds[index])) ctx.addIssue({ code: 'custom', message: 'Brief order must match progression' });
});
export const briefs = schema.parse(data);
export function briefFor(id: BriefId) { return briefs.find(brief => brief.id === id)!; }
export const instruction = lineById;
export function instructionsFor(id: BriefId) { return briefFor(id).instructions.map(key => instruction[key]); }
export const words = apartmentWords;
// Speech and words retain their canonical apartment IDs and exact recordings.
export const lines = ['window', 'left', 'rotate', 'blocked', 'okay'].map(key => instruction[key]);
