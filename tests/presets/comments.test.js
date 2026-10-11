import assert from 'node:assert/strict';
import { test } from 'node:test';

import { comments } from '../../lib/index.js';
import { reportsIn } from './lint-fixture.js';

test('comments() caps a comment at three lines', async () => {
  assert.deepEqual(await reportsIn('comments', comments()), [
    'four-line-run.js:1 house/short-comments',
    'six-line-block.js:1 house/short-comments',
  ]);
});

test('comments({ max }) moves the cap', async () => {
  assert.deepEqual(await reportsIn('comments', comments({ max: 4 })), [
    'six-line-block.js:1 house/short-comments',
  ]);
});
