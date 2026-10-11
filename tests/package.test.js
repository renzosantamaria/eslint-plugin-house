import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import house from '../lib/index.js';
import { locate, manifest } from './project.js';

const entries = [
  ...Object.values(manifest.exports),
  ...Object.values(manifest.bin),
];

const isPublished = (path) =>
  path === './package.json' ||
  manifest.files.some((folder) =>
    path.replace(/^\.\//, '').startsWith(`${folder}/`),
  );

const importsOf = (module) =>
  Array.from(
    readFileSync(module, 'utf8').matchAll(/ from '(\.[^']+)'/g),
    ([, path]) => new URL(path, module),
  );

function reach(module, reached) {
  if (reached.has(module.href)) return;

  reached.add(module.href);

  for (const imported of importsOf(module)) reach(imported, reached);
}

test('npm installs the package from a git tarball without preparing it', () => {
  const preparing = [
    'build',
    'install',
    'postinstall',
    'preinstall',
    'prepack',
    'prepare',
  ];

  assert.deepEqual(
    Object.keys(manifest.scripts).filter((script) =>
      preparing.includes(script),
    ),
    [],
  );
  assert.equal(manifest.workspaces, undefined);
});

test('every entry point exists and is published', () => {
  assert.deepEqual(
    entries.filter(
      (entry) => !existsSync(locate(entry)) || !isPublished(entry),
    ),
    [],
  );
});

test('the package gives its plugin and its presets when imported by name', async () => {
  assert.deepEqual(Object.keys(await import('eslint-plugin-house')).sort(), [
    'comments',
    'default',
    'pure',
    'specs',
    'time',
    'timeSelectors',
    'vue',
  ]);
});

test('the command is installed as house-stylesheets', () => {
  assert.deepEqual(Object.keys(manifest.bin), ['house-stylesheets']);
});

test('the Vue parser is a peer that a project may leave out', () => {
  assert.deepEqual(manifest.peerDependenciesMeta, {
    'vue-eslint-parser': { optional: true },
  });
});

test('every module in lib is reached from an entry point', () => {
  const reached = new Set();

  for (const entry of entries.filter((path) => path.endsWith('.js'))) {
    reach(locate(entry), reached);
  }

  assert.deepEqual(
    readdirSync(locate('lib/'), { recursive: true }).filter(
      (path) =>
        path.endsWith('.js') && !reached.has(locate(`lib/${path}`).href),
    ),
    [],
  );
});

test('npm test runs the tests on ESLint 10 and then on ESLint 9', () => {
  assert.equal(
    manifest.scripts.test,
    'npm run test:eslint-10 && npm run test:eslint-9',
  );
  assert.equal(manifest.scripts['test:eslint-9'], 'ESLINT_MAJOR=9 node --test');
});

test('the plugin names itself after the package', () => {
  assert.deepEqual(house.meta, {
    name: 'eslint-plugin-house',
    namespace: 'house',
    version: manifest.version,
  });
});
