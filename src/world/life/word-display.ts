export function wordText(word: { text?: string; hanzi?: string }): string {
  return word.text ?? word.hanzi ?? '';
}

export function wordPronunciation(word: { pronunciation?: string; pinyin?: string }): string {
  return word.pronunciation ?? word.pinyin ?? '';
}

export function lineLabel(line: { text?: string; tokens: { text?: string; hanzi?: string }[] }): string {
  return line.text ?? line.tokens.map(wordText).join('');
}
