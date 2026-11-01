import type { Content, Word } from '../contracts';

export function contentWords(content: Content): Word[] {
  const lines = [
    content.help.welcome, content.help.lookup, content.help.pace,
    ...content.help.steps.map(step => step.line),
    ...content.orders.map(order => order.line), content.thanks, content.retry,
    ...content.characters.flatMap(character => [character.greeting, character.thanks, character.retry]),
  ];
  return [...content.foods.map(food => food.word), ...lines.flatMap(line => line.tokens)];
}
