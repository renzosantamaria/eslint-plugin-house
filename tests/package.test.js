import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import house from '../lib/index.js';

const locate = (path) => new URL(`../${path}`, import.meta.url);
const manifest = JSON.parse(readFileSync(locate('package.json'), 'utf8'));

const isPublished = (path) =>
  path === './package.json' ||
  manifest.files.some((folder) =>
    path.replace(/^\.\//, '').startsWith(`${folder}/`),
  );

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
  const entries = [
    ...Object.values(manifest.exports),
    ...Object.values(manifest.bin),
  ];

  assert.deepEqual(
    entries.filter(
      (entry) => !existsSync(locate(entry)) || !isPublished(entry),
    ),
    [],
  );
});

test('the plugin names itself after the package', () => {
  assert.deepEqual(house.meta, {
    name: 'eslint-plugin-house',
    namespace: 'house',
    version: manifest.version,
  });
});
