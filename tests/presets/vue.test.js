import assert from 'node:assert/strict';
import { test } from 'node:test';

import { vue } from '../../lib/index.js';
import { loadEslintFor, parseVue, reportsIn } from './lint-fixture.js';

test('vue() bans comments in the template and the style blocks', async () => {
  assert.deepEqual(await reportsIn('vue', [parseVue, ...vue()]), [
    'UserCard.vue:13 house/no-style-comments',
    'UserCard.vue:7 house/no-template-comments',
  ]);
});

test('vue() leaves script files alone', async () => {
  const rulesFor = async (file) => {
    const eslint = loadEslintFor('vue', vue());
    const { rules = {} } = await eslint.calculateConfigForFile(file);

    return Object.keys(rules);
  };

  assert.deepEqual(await rulesFor('UserCard.vue'), [
    'house/no-style-comments',
    'house/no-template-comments',
  ]);
  assert.deepEqual(await rulesFor('user.js'), []);
});

test('vue() refuses options, for it has none', () => {
  assert.throws(
    () => vue({ files: ['app/**/*.vue'] }),
    new TypeError('vue() takes no options.'),
  );
});
