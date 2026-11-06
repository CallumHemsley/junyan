import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Cats from './index';
import { initialState, reduce } from './rules';

describe('cat presentation in the connected world', () => {
  it('keeps the default standalone scene and exposes controls without a second world', () => {
    const state = reduce(initialState(), { type: 'select', target: 'white' }, 1);
    const props = { state, day: 1, onAction() {}, onLookup() {}, onRecover() {}, onPlay() {} };
    const standalone = renderToStaticMarkup(createElement(Cats, props));
    const controls = renderToStaticMarkup(createElement(Cats, { ...props, presentation: 'controls' }));
    expect(standalone).toContain('<canvas');
    expect(standalone).toContain('data-testid="cats-white"');
    expect(controls).not.toContain('<canvas');
    expect(controls).not.toContain('cats-landmarks');
    expect(controls).not.toContain('data-testid="cats-white"');
    expect(controls).toContain('data-testid="cats-dialogue"');
    expect(controls).toContain('data-testid="cats-action-crouch"');
    expect(controls).toContain('cats-replay');
    expect(controls).toContain('data-presentation="controls"');
  });
});
