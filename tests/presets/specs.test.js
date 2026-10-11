import assert from 'node:assert/strict';
import { test } from 'node:test';

import { specs } from '../../lib/index.js';
import { loadEslintFor, reportsIn } from './lint-fixture.js';

const SPEC_FILES = [
  'src/cart.spec.js',
  'src/cart.spec.mjs',
  'src/cart.spec.cjs',
  'src/cart.spec.jsx',
  'src/cart.spec.ts',
  'src/cart.spec.mts',
  'src/cart.spec.cts',
  'src/cart.spec.tsx',
  'src/cart.test.ts',
  'src/cart.nuxt.spec.ts',
  'test/app.e2e-spec.ts',
  'cart.spec.ts',
];

const OTHER_FILES = [
  'src/cart.ts',
  'src/spec.ts',
  'src/cart.spec.json',
  'src/cart.specs.ts',
  'test/helpers.ts',
];

const isCommentFree = async (file) => {
  const config = await loadEslintFor('specs', specs()).calculateConfigForFile(
    file,
  );

  return config?.rules?.['house/no-comments']?.[0] === 2;
};

test('specs() bans comments in spec files only', async () => {
  assert.deepEqual(await reportsIn('specs', specs()), [
    'cart.nuxt.spec.ts:4 house/no-comments',
    'cart.spec.js:3 house/no-comments',
  ]);
});

for (const file of SPEC_FILES) {
  test(`specs() takes ${file} for a spec file`, async () => {
    assert.equal(await isCommentFree(file), true);
  });
}

for (const file of OTHER_FILES) {
  test(`specs() leaves ${file} alone`, async () => {
    assert.equal(await isCommentFree(file), false);
  });
}

test('specs({ files }) replaces the spec globs', async () => {
  assert.deepEqual(
    await reportsIn('specs', specs({ files: ['e2e/**/*.js'] })),
    ['e2e/checkout.js:1 house/no-comments'],
  );
});

test('specs() refuses an option it does not know', () => {
  assert.throws(
    () => specs({ file: ['e2e/**/*.js'] }),
    new TypeError('specs() does not take file; it takes files.'),
  );
});
