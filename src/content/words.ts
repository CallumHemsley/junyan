import type { Content, Line, OpeningStep, Phrase, Word } from '../contracts';

export function stepPhrasePaths(step: OpeningStep): [path: (string | number)[], phrase: Phrase][] {
  switch (step.type) {
    case 'say-en': return [];
    case 'say': return [[['line'], step.line]];
    case 'request': return [[['line'], step.line], [['wrong'], step.wrong], [['ok'], step.ok]];
    case 'reply': return step.options.map((option, index) => [['options', index, 'answer'], option.answer]);
    case 'end': return [[['title'], step.title]];
  }
}

export function stepPhrases(step: OpeningStep): Phrase[] {
  return stepPhrasePaths(step).map(([, phrase]) => phrase);
}

export function contentLines(content: Content): (Line | Phrase)[] {
  return [
    content.help.welcome, content.help.lookup, content.help.pace,
    ...content.help.steps.map(step => step.line),
    ...content.orders.map(order => order.line), content.thanks, content.retry,
    ...content.characters.flatMap(character => [character.greeting, character.thanks, character.retry]),
    ...content.opening.steps.flatMap(stepPhrases),
  ];
}

export function contentWords(content: Content): Word[] {
  const replyWords = content.opening.steps.flatMap(step => step.type === 'reply' ? step.options.map(option => option.word) : []);
  return [...content.foods.map(food => food.word), ...contentLines(content).flatMap(line => line.tokens), ...replyWords];
}
