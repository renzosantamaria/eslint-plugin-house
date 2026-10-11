import assert from 'node:assert/strict';
import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import vuePlugin from 'eslint-plugin-vue';

import { time, timeSelectors } from '../../lib/index.js';
import { Linter } from '../eslint.js';
import { plantFiles } from '../plant-files.js';
import { lintFixture, parseVue, reportsIn } from './lint-fixture.js';

const utils = ['src/time.js'];

test('time() bans locale formatting outside the time utility', async () => {
  const config = [parseVue, ...time({ utils, vue: false })];

  assert.deepEqual(await reportsIn('time', config), [
    'src/Receipt.vue:3 no-restricted-syntax',
    'src/receipt.js:1 no-restricted-syntax',
    'src/receipt.js:2 no-restricted-syntax',
    'src/receipt.js:3 no-restricted-syntax',
    'src/receipt.js:4 no-restricted-syntax',
    'src/receipt.js:5 no-restricted-syntax',
  ]);
});

test('time() bans locale formatting in templates when told Vue is there', async () => {
  const config = [
    { ...parseVue, plugins: { vue: vuePlugin } },
    ...time({ utils, vue: true }),
  ];

  assert.deepEqual(await reportsIn('time', config), [
    'src/Receipt.vue:3 no-restricted-syntax',
    'src/Receipt.vue:7 vue/no-restricted-syntax',
    'src/Receipt.vue:8 vue/no-restricted-syntax',
    'src/receipt.js:1 no-restricted-syntax',
    'src/receipt.js:2 no-restricted-syntax',
    'src/receipt.js:3 no-restricted-syntax',
    'src/receipt.js:4 no-restricted-syntax',
    'src/receipt.js:5 no-restricted-syntax',
  ]);
});

test('time() counts on the project to register the vue plugin for templates', async () => {
  await assert.rejects(
    reportsIn('time', [parseVue, ...time({ utils, vue: true })]),
    /could not find plugin "vue"/i,
  );
});

test('time() covers templates by itself when eslint-plugin-vue is installed', () => {
  assert.deepEqual(
    time({ utils }).map(({ name }) => name),
    ['house/time', 'house/time/vue'],
  );
});

test('time() leaves templates alone by itself when only the Vue parser is installed', async (t) => {
  const root = plantFiles(t, {
    'node_modules/vue-eslint-parser/index.js': '',
    'package.json': '{ "type": "module" }',
  });

  cpSync(new URL('../../lib/', import.meta.url), join(root, 'lib'), {
    recursive: true,
  });

  const elsewhere = await import(
    pathToFileURL(join(root, 'lib/presets/time.js'))
  );

  assert.deepEqual(
    elsewhere.time({ utils }).map(({ name }) => name),
    ['house/time'],
  );
});

test('time() leaves a component alone when it is listed as a utility', async () => {
  const config = [
    { ...parseVue, plugins: { vue: vuePlugin } },
    ...time({
      utils: ['src/time.js', 'src/receipt.js', 'src/Receipt.vue'],
      vue: true,
    }),
  ];

  assert.deepEqual(await reportsIn('time', config), []);
});

test('time() takes several utilities', async () => {
  const config = [
    parseVue,
    ...time({ utils: ['src/time.js', 'src/receipt.js'], vue: false }),
  ];

  assert.deepEqual(await reportsIn('time', config), [
    'src/Receipt.vue:3 no-restricted-syntax',
  ]);
});

test('time() says where formatting belongs, whatever the formatter', async () => {
  const reports = await lintFixture('time', time({ utils, vue: false }));

  assert.deepEqual(
    [...new Set(reports.map(({ message }) => message))],
    [
      "Format dates and times in the project's time utility, where the time zone is explicit. For a number, use Intl.NumberFormat.",
    ],
  );
});

for (const [given, options] of [
  ['no options', undefined],
  ['no utilities', {}],
  ['an empty list of utilities', { utils: [] }],
  ['a blank utility', { utils: ['src/time.js', ' '] }],
  ['a utility that is not a list', { utils: 'src/time.js' }],
  ['a utility that is not text', { utils: [5] }],
]) {
  test(`time() refuses ${given}`, () => {
    assert.throws(
      () => time(options),
      new TypeError(
        'time({ utils }) must be an array of at least 1 non-empty strings.',
      ),
    );
  });
}

for (const [given, vue] of [
  ['a word', 'false'],
  ['a number', 0],
  ['nothing', null],
]) {
  test(`time() refuses ${given} where it is told whether Vue is there`, () => {
    assert.throws(
      () => time({ utils, vue }),
      new TypeError('time({ vue }) must be true or false.'),
    );
  });
}

test('time() refuses an option it does not know', () => {
  assert.throws(
    () => time({ util: 'src/time.js', utils }),
    new TypeError('time() does not take util; it takes utils, vue.'),
  );
});

test('timeSelectors merge into a list a project already has', () => {
  const messages = new Linter().verify('with (a) b.toLocaleString();', [
    {
      languageOptions: { sourceType: 'script' },
      rules: {
        'no-restricted-syntax': [
          'error',
          { message: 'No with.', selector: 'WithStatement' },
          ...timeSelectors,
        ],
      },
    },
  ]);

  assert.deepEqual(
    messages.map(({ column, ruleId }) => `${column} ${ruleId}`),
    ['1 no-restricted-syntax', '10 no-restricted-syntax'],
  );
});
