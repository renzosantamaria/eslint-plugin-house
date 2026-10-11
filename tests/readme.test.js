import assert from 'node:assert/strict';
import { test } from 'node:test';

import vuePlugin from 'eslint-plugin-vue';

import { parseVue, reportsIn } from './presets/lint-fixture.js';
import { locate, manifest, readme } from './project.js';

const importingThisCheckout = (example) =>
  example
    .slice('js\n'.length)
    .replace("'eslint-plugin-house'", `'${locate('lib/index.js').href}'`);

async function loadConfigExample(marker) {
  const example = readme
    .split('```')
    .find((block) => block.startsWith('js\n') && block.includes(marker));
  const { default: config } = await import(
    `data:text/javascript,${encodeURIComponent(importingThisCheckout(example))}`
  );

  return config;
}

test('the example that merges the time selectors keeps both lists and the templates', async () => {
  const config = [
    { files: ['**/*.ts'] },
    { ...parseVue, plugins: { vue: vuePlugin } },
    ...(await loadConfigExample('...timeSelectors')),
  ];

  assert.deepEqual(await reportsIn('merge', config), [
    'src/Receipt.vue:3 no-restricted-syntax',
    'src/Receipt.vue:7 vue/no-restricted-syntax',
    'src/receipt.js:1 no-restricted-syntax',
    'src/receipt.js:6 no-restricted-syntax',
    'src/utils/time.ts:8 no-restricted-syntax',
  ]);
});

test('the README states the peer ranges of the manifest', () => {
  assert.deepEqual(
    Object.values(manifest.peerDependencies).filter(
      (range) => !readme.includes(`\`${range}\``),
    ),
    [],
  );
});
