import assert from 'node:assert/strict';
import { test } from 'node:test';

import { comments, pure, specs, time, vue } from '../../lib/index.js';

test('every block is named after the preset it came from', () => {
  const blocks = [
    ...comments(),
    ...specs(),
    ...vue(),
    ...time({ utils: ['src/time.js'], vue: true }),
    ...pure({ banned: { globals: ['window'] }, folder: 'src/domain' }),
  ];

  assert.deepEqual(
    blocks.map(({ name }) => name),
    [
      'house/comments',
      'house/specs',
      'house/vue',
      'house/time',
      'house/time/vue',
      'house/pure/src/domain',
      'house/pure/src/domain',
      'house/pure/src/domain',
      'house/pure/src/domain',
      'house/pure/src/domain',
      'house/pure/src/domain',
    ],
  );
});
