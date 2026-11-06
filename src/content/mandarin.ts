// Keep the audio authoring files in their original format while runtime words stay language-neutral.
export function adaptMandarinContent(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(adaptMandarinContent);
  if (value === null || typeof value !== 'object') return value;
  const entries = Object.entries(value);
  if (entries.some(([key]) => key === 'hanzi') && entries.some(([key]) => key === 'text')) return value;
  if (entries.some(([key]) => key === 'pinyin') && entries.some(([key]) => key === 'pronunciation')) return value;
  return Object.fromEntries(entries.map(([key, entry]) => [
    key === 'hanzi' ? 'text' : key === 'pinyin' ? 'pronunciation' : key,
    adaptMandarinContent(entry),
  ]));
}
