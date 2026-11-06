import { z } from 'zod';
import voiceData from './voices.json';

const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
const voicePreset = z.strictObject({
  engine: z.enum(['qwen', 'kokoro']), model: z.string().min(1), revision: z.string().regex(/^[a-f0-9]{40}$/),
  speaker: z.string().min(1), language: z.string().min(1), speed: z.number().min(0.5).max(2), instructions: z.string().nullable(),
  loudness: z.strictObject({targetActiveRmsDbfs: z.number().min(-40).max(-6), peakCeilingDbfs: z.number().min(-12).lt(0)}).optional(),
}).superRefine((preset, ctx) => {
  if (preset.engine === 'qwen' && preset.speed !== 1) ctx.addIssue({code: 'custom', message: 'Qwen requires speed 1', path: ['speed']});
  if (preset.engine === 'kokoro' && preset.instructions !== null) ctx.addIssue({code: 'custom', message: 'Kokoro does not support instructions', path: ['instructions']});
});
export const voicesSchema = z.strictObject({
  wordVoice: id, voices: z.record(id, voicePreset),
}).refine(value => Boolean(value.voices[value.wordVoice]), 'Unknown word voice');
export type VoiceCatalog = z.infer<typeof voicesSchema>;
export const voices = voicesSchema.parse(voiceData);

