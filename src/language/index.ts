import type { Line, Word } from '../contracts';

export type LanguagePolicy = {
  id: string;
  locale: string;
  direction: 'ltr' | 'rtl';
  tokenSeparator: string;
  wordPattern: RegExp;
  speechPattern: RegExp;
  punctuationPattern: RegExp;
  pronunciationRequired: boolean;
  targetVoiceLanguages: readonly string[];
  renderAuthoredText: boolean;
};

export const mandarin: LanguagePolicy = {
  id: 'zh-CN',
  locale: 'zh-CN',
  direction: 'ltr',
  tokenSeparator: '',
  wordPattern: /^[\p{Script=Han}]+$/u,
  speechPattern: /^[\p{Script=Han}，。！？·]+$/u,
  punctuationPattern: /[，。！？·]/gu,
  pronunciationRequired: true,
  targetVoiceLanguages: ['Chinese', 'z'],
  renderAuthoredText: false,
};

export const language = mandarin;

export type LinePart = { kind: 'word'; word: Word } | { kind: 'text'; text: string };
export type TokenLine = Pick<Line, 'tokens' | 'text'>;

export function lineText(line: TokenLine, policy: LanguagePolicy = language): string {
  return line.text ?? line.tokens.map(word => word.text).join(policy.tokenSeparator);
}

export function lineParts(line: TokenLine, policy: LanguagePolicy = language): LinePart[] {
  if (policy.renderAuthoredText && line.text !== undefined) {
    const parts: LinePart[] = [];
    let cursor = 0;
    for (const word of line.tokens) {
      const start = line.text.indexOf(word.text, cursor);
      if (start > cursor) parts.push({ kind: 'text', text: line.text.slice(cursor, start) });
      parts.push({ kind: 'word', word });
      cursor = start + word.text.length;
    }
    if (cursor < line.text.length) parts.push({ kind: 'text', text: line.text.slice(cursor) });
    return parts;
  }
  return line.tokens.flatMap((word, index): LinePart[] => [
    ...(index > 0 && policy.tokenSeparator ? [{ kind: 'text' as const, text: policy.tokenSeparator }] : []),
    { kind: 'word', word },
  ]);
}
