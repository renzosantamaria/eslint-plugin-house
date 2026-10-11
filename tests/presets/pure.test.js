import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pure } from '../../lib/index.js';
import { lintFixture, reportsIn } from './lint-fixture.js';

const folder = 'src/domain';

const LEAVES_THE_FOLDER = [
  'src/domain/a/b/c/d/e/five-deep.js:1 no-restricted-imports',
  'src/domain/a/b/c/d/four-deep.js:1 no-restricted-imports',
  'src/domain/order.js:1 no-restricted-imports',
  'src/domain/order.js:2 no-restricted-imports',
  'src/domain/parent.js:1 no-restricted-imports',
  'src/domain/tax/vat.js:1 no-restricted-imports',
];

test('pure() bans imports that leave the folder', async () => {
  assert.deepEqual(
    await reportsIn('pure', pure({ folder })),
    LEAVES_THE_FOLDER,
  );
});

test('pure() takes a folder written with a closing slash', async () => {
  assert.deepEqual(
    await reportsIn('pure', pure({ folder: 'src/domain/' })),
    LEAVES_THE_FOLDER,
  );
});

test('pure({ banned }) bans the listed modules and globals inside the folder', async () => {
  const config = pure({
    banned: { globals: ['process', 'window'], imports: ['@nestjs/*', 'vue'] },
    folder,
  });

  assert.deepEqual(await reportsIn('pure', config), [
    'src/domain/a/b/c/d/e/five-deep.js:1 no-restricted-imports',
    'src/domain/a/b/c/d/e/five-deep.js:5 no-restricted-globals',
    'src/domain/a/b/c/d/four-deep.js:1 no-restricted-imports',
    'src/domain/ambient.js:1 no-restricted-globals',
    'src/domain/ambient.js:2 no-restricted-globals',
    'src/domain/framework.js:1 no-restricted-imports',
    'src/domain/framework.js:2 no-restricted-imports',
    'src/domain/framework.js:3 no-restricted-imports',
    'src/domain/order.js:1 no-restricted-imports',
    'src/domain/order.js:2 no-restricted-imports',
    'src/domain/parent.js:1 no-restricted-imports',
    'src/domain/tax/vat.js:1 no-restricted-imports',
  ]);
});

test('pure() says why each report is there', async () => {
  const config = pure({
    banned: { globals: ['window'], imports: ['vue'] },
    folder,
  });
  const reports = await lintFixture('pure', config);
  const messageAt = (place) =>
    reports.find(({ where }) => where.startsWith(place)).message;

  assert.equal(
    messageAt('src/domain/ambient.js:1'),
    "Unexpected use of 'window'. This folder stays pure: take what you need as an argument.",
  );
  assert.equal(
    messageAt('src/domain/framework.js:2'),
    "'vue' import is restricted from being used by a pattern. This folder stays pure: this module is banned here.",
  );
  assert.equal(
    messageAt('src/domain/order.js:1'),
    "'../http/client.js' import is restricted from being used by a pattern. This folder stays pure: it imports nothing from outside itself.",
  );
});

test('pure() leaves no-restricted-globals alone when no global is banned', () => {
  const rules = pure({ banned: { imports: ['vue'] }, folder }).flatMap(
    ({ rules }) => Object.keys(rules),
  );

  assert.deepEqual(rules, [
    'no-restricted-imports',
    'no-restricted-imports',
    'no-restricted-imports',
    'no-restricted-imports',
    'no-restricted-imports',
  ]);
});

for (const [given, options, message] of [
  ['no options', undefined, 'pure({ folder }) must be a non-empty string.'],
  [
    'a blank folder',
    { folder: ' ' },
    'pure({ folder }) must be a non-empty string.',
  ],
  [
    'an option it does not know',
    { folder, folders: [folder] },
    'pure() does not take folders; it takes banned, folder.',
  ],
  [
    'a plain list of banned names',
    { banned: ['vue'], folder },
    'pure({ banned }) does not take 0; it takes globals, imports.',
  ],
  [
    'a blank banned module',
    { banned: { imports: ['vue', ''] }, folder },
    'pure({ banned: { imports } }) must be an array of non-empty strings.',
  ],
  [
    'banned modules that are not a list',
    { banned: { imports: 'vue' }, folder },
    'pure({ banned: { imports } }) must be an array of non-empty strings.',
  ],
  [
    'a blank banned global',
    { banned: { globals: [''] }, folder },
    'pure({ banned: { globals } }) must be an array of non-empty strings.',
  ],
]) {
  test(`pure() refuses ${given}`, () => {
    assert.throws(() => pure(options), new TypeError(message));
  });
}
