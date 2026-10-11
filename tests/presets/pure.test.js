import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pure } from '../../lib/index.js';
import { lintFixture, reportsIn } from './lint-fixture.js';

const folder = 'src/domain';

const TAKEN_FOR_LEAVING = [
  'src/domain/a/b/c/d/e/five-deep.js:1 no-restricted-imports',
  'src/domain/a/b/c/d/e/five-deep.js:3 no-restricted-imports',
  'src/domain/a/b/c/d/four-deep.js:1 no-restricted-imports',
  'src/domain/a/b/c/three-deep.js:1 no-restricted-imports',
  'src/domain/detour.js:1 no-restricted-imports',
  'src/domain/detour.js:4 no-restricted-imports',
  'src/domain/detour.js:5 no-restricted-imports',
  'src/domain/order.js:1 no-restricted-imports',
  'src/domain/order.js:2 no-restricted-imports',
  'src/domain/parent.js:1 no-restricted-imports',
  'src/domain/rate.ts:1 no-restricted-imports',
  'src/domain/tax/detour.js:1 no-restricted-imports',
  'src/domain/tax/detour.js:2 no-restricted-imports',
  'src/domain/tax/detour.js:3 no-restricted-imports',
  'src/domain/tax/detour.js:5 no-restricted-imports',
  'src/domain/tax/vat.js:1 no-restricted-imports',
];

test('pure() bans imports that leave the folder', async () => {
  assert.deepEqual(
    await reportsIn('pure', pure({ folder })),
    TAKEN_FOR_LEAVING,
  );
});

test('pure() takes a folder written with a closing slash', async () => {
  assert.deepEqual(
    await reportsIn('pure', pure({ folder: 'src/domain/' })),
    TAKEN_FOR_LEAVING,
  );
});

test('pure() takes a folder written with blanks around it', async () => {
  assert.deepEqual(
    await reportsIn('pure', pure({ folder: ' src/domain ' })),
    TAKEN_FOR_LEAVING,
  );
});

test('pure({ banned }) bans the listed modules and globals inside the folder', async () => {
  const config = pure({
    banned: {
      globals: ['process', 'window'],
      imports: ['$lib', '@nestjs/*', 'events', 'vue'],
    },
    folder,
  });

  assert.deepEqual(await reportsIn('pure', config), [
    'src/domain/a/b/c/d/e/five-deep.js:1 no-restricted-imports',
    'src/domain/a/b/c/d/e/five-deep.js:3 no-restricted-imports',
    'src/domain/a/b/c/d/e/five-deep.js:6 no-restricted-globals',
    'src/domain/a/b/c/d/four-deep.js:1 no-restricted-imports',
    'src/domain/a/b/c/three-deep.js:1 no-restricted-imports',
    'src/domain/ambient.js:1 no-restricted-globals',
    'src/domain/ambient.js:2 no-restricted-globals',
    'src/domain/detour.js:1 no-restricted-imports',
    'src/domain/detour.js:4 no-restricted-imports',
    'src/domain/detour.js:5 no-restricted-imports',
    'src/domain/framework.js:1 no-restricted-imports',
    'src/domain/framework.js:2 no-restricted-imports',
    'src/domain/framework.js:3 no-restricted-imports',
    'src/domain/framework.js:5 no-restricted-imports',
    'src/domain/framework.js:6 no-restricted-imports',
    'src/domain/order.js:1 no-restricted-imports',
    'src/domain/order.js:2 no-restricted-imports',
    'src/domain/parent.js:1 no-restricted-imports',
    'src/domain/rate.ts:1 no-restricted-imports',
    'src/domain/rate.ts:3 no-restricted-globals',
    'src/domain/tax/detour.js:1 no-restricted-imports',
    'src/domain/tax/detour.js:2 no-restricted-imports',
    'src/domain/tax/detour.js:3 no-restricted-imports',
    'src/domain/tax/detour.js:5 no-restricted-imports',
    'src/domain/tax/vat.js:1 no-restricted-imports',
  ]);
});

test('pure({ banned }) lets a pattern with a wildcard match at any depth', async () => {
  const config = pure({ banned: { imports: ['*.vue'] }, folder });

  assert.deepEqual(
    await reportsIn('pure', config),
    [
      ...TAKEN_FOR_LEAVING,
      'src/domain/local.js:3 no-restricted-imports',
    ].sort(),
  );
});

test('pure() and a block of the project that sets the same rule replace each other', async () => {
  const own = { rules: { 'no-restricted-imports': ['error', 'vue'] } };

  assert.deepEqual(await reportsIn('pure', [own, ...pure({ folder })]), [
    ...TAKEN_FOR_LEAVING,
    'src/http/client.js:1 no-restricted-imports',
  ]);
  assert.deepEqual(await reportsIn('pure', [...pure({ folder }), own]), [
    'src/domain/framework.js:2 no-restricted-imports',
    'src/http/client.js:1 no-restricted-imports',
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
  assert.equal(
    messageAt('src/domain/a/b/c/three-deep.js:1'),
    "'../../../../http/client.js' import is restricted from being used by a pattern. This folder stays pure: it imports nothing from outside itself.",
  );
  assert.equal(
    messageAt('src/domain/a/b/c/d/e/five-deep.js:3'),
    "'../../../../../money.js' import is restricted from being used by a pattern. This folder stays pure: it imports nothing from outside itself. 5 levels up counts as outside, however deep the file is.",
  );
  assert.equal(
    messageAt('src/domain/detour.js:1'),
    "'./tax/../../http/client.js' import is restricted from being used by a pattern. This folder stays pure: write this import without stepping into a folder and back out of it.",
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

const NOT_A_FOLDER_OF_THE_PROJECT =
  'pure({ folder }) must be a path with forward slashes, relative to the config file and inside its folder.';

for (const [given, options, message] of [
  ['no options', undefined, 'pure({ folder }) must be a non-empty string.'],
  ['options that are no object', folder, 'pure() takes an object, not string.'],
  ['no options at all', null, 'pure() takes an object, not null.'],
  [
    'banned names that are no object',
    { banned: null, folder },
    'pure({ banned }) takes an object, not null.',
  ],
  [
    'a folder from the root of the disk',
    { folder: '/src/domain' },
    NOT_A_FOLDER_OF_THE_PROJECT,
  ],
  [
    'a folder on a named drive',
    { folder: 'C:/src/domain' },
    NOT_A_FOLDER_OF_THE_PROJECT,
  ],
  [
    'a folder written with backslashes',
    { folder: 'src\\domain' },
    NOT_A_FOLDER_OF_THE_PROJECT,
  ],
  [
    'a folder above the config file',
    { folder: '../src/domain' },
    NOT_A_FOLDER_OF_THE_PROJECT,
  ],
  [
    'a folder reached by climbing',
    { folder: 'src/../domain' },
    NOT_A_FOLDER_OF_THE_PROJECT,
  ],
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
