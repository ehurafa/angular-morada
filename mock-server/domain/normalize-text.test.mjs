import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { normalizeText } from './normalize-text.mjs';

describe('normalizeText', () => {
  it('normalizes accents and letter case', () => {
    assert.equal(normalizeText('São Paulo'), 'sao paulo');
  });

  it('normalizes repeated whitespace', () => {
    assert.equal(normalizeText('  Metrô   Vila Madalena  '), 'metro vila madalena');
  });

  it('normalizes an absent value to an empty string', () => {
    assert.equal(normalizeText(null), '');
  });
});
