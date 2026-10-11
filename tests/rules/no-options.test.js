import assert from 'node:assert/strict';
import { test } from 'node:test';

import { lintWithOptions } from './helpers.js';

for (const rule of [
  'no-comments',
  'no-style-comments',
  'no-template-comments',
]) {
  test(`${rule} refuses an option`, () => {
    assert.throws(
      lintWithOptions(rule, {}),
      /should NOT have more than 0 items/,
    );
  });
}
