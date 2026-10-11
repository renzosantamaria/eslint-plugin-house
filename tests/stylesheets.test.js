import assert from 'node:assert/strict';
import fs, { symlinkSync } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { join, relative } from 'node:path';
import { test } from 'node:test';

import { locateStylesheetComments } from '../lib/stylesheets.js';
import { plantFiles } from './plant-files.js';

const locateIn = (root, paths = ['.']) =>
  locateStylesheetComments(paths.map((path) => join(root, path))).map(
    ({ column, file, line }) => `${relative(root, file)}:${line}:${column}`,
  );

test('comments are located by file, line and column', (t) => {
  const root = plantFiles(t, {
    'app.scss': 'a {\n  color: red; // brand\n}\n/* end */\n',
  });

  assert.deepEqual(locateIn(root), ['app.scss:2:15', 'app.scss:4:1']);
});

test('comments that share a line or follow a comment of several lines are located', (t) => {
  const root = plantFiles(t, {
    'a.css': '/* a */ /* b */\n/* c\n   d */ /* e */\n',
  });

  assert.deepEqual(locateIn(root), [
    'a.css:1:1',
    'a.css:1:9',
    'a.css:2:1',
    'a.css:3:9',
  ]);
});

test('a hundred thousand comments in one stylesheet are located in one pass', (t) => {
  const root = plantFiles(t, { 'a.css': '/* a */\n'.repeat(100_000) });
  const started = Date.now();

  assert.equal(locateIn(root).at(-1), 'a.css:100000:1');
  assert.ok(Date.now() - started < 2000);
});

test('a folder is listed in name order, whatever order it comes in', (t) => {
  const root = plantFiles(t, {
    'a.css': '/* a */',
    'b.css': '/* b */',
    'c.css': '/* c */',
  });
  const { readdirSync } = fs;

  t.mock.method(fs, 'readdirSync', (...given) =>
    readdirSync(...given).reverse(),
  );
  syncBuiltinESMExports();
  t.after(() => {
    t.mock.restoreAll();
    syncBuiltinESMExports();
  });

  assert.deepEqual(locateIn(root), ['a.css:1:1', 'b.css:1:1', 'c.css:1:1']);
});

test('folders are searched to any depth, in name order', (t) => {
  const root = plantFiles(t, {
    'b.css': '/* b */',
    'a/deep/er/c.scss': '// c',
    'a/a.css': '/* a */',
  });

  assert.deepEqual(locateIn(root), [
    'a/a.css:1:1',
    'a/deep/er/c.scss:1:1',
    'b.css:1:1',
  ]);
});

test('a // line counts in .scss and not in .css', (t) => {
  const root = plantFiles(t, { 'a.css': '// a', 'a.scss': '// a' });

  assert.deepEqual(locateIn(root), ['a.scss:1:1']);
});

test('files that are not stylesheets are left alone', (t) => {
  const root = plantFiles(t, {
    'a.js': '/* a */',
    'a.sass': '// a',
    'a.vue': '<style>/* a */</style>',
    css: '/* a */',
  });

  assert.deepEqual(locateIn(root), []);
});

test('node_modules and hidden folders are skipped', (t) => {
  const root = plantFiles(t, {
    '.cache/a.css': '/* a */',
    'node_modules/pkg/a.css': '/* a */',
    'src/node_modules/pkg/a.css': '/* a */',
    'src/a.css': '/* a */',
  });

  assert.deepEqual(locateIn(root), ['src/a.css:1:1']);
});

test('a link is not followed', (t) => {
  const root = plantFiles(t, { 'a.css': '/* a */' });

  symlinkSync(join(root, 'gone.css'), join(root, 'dangling.css'));
  symlinkSync(root, join(root, 'loop'));

  assert.deepEqual(locateIn(root), ['a.css:1:1']);
});

test('a link that is named directly is followed', (t) => {
  const root = plantFiles(t, { 'src/a.css': '/* a */' });

  symlinkSync(join(root, 'src'), join(root, 'styles'));
  symlinkSync(join(root, 'src/a.css'), join(root, 'b.css'));

  assert.deepEqual(locateIn(root, ['styles', 'b.css']), [
    'styles/a.css:1:1',
    'b.css:1:1',
  ]);
});

test('a file can be named directly', (t) => {
  const root = plantFiles(t, { 'a.css': '/* a */', 'b.css': '/* b */' });

  assert.deepEqual(locateIn(root, ['b.css']), ['b.css:1:1']);
});

test('a named file that is not a stylesheet is left alone', (t) => {
  const root = plantFiles(t, { 'a.js': '/* a */' });

  assert.deepEqual(locateIn(root, ['a.js']), []);
});

test('several paths are searched in the order given', (t) => {
  const root = plantFiles(t, { 'a/a.css': '/* a */', 'b/b.css': '/* b */' });

  assert.deepEqual(locateIn(root, ['b', 'a']), ['b/b.css:1:1', 'a/a.css:1:1']);
});
