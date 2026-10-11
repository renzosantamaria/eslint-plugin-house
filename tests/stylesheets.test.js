import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { test } from 'node:test';

import { locateStylesheetComments } from '../lib/stylesheets.js';

function plantFiles(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'house-stylesheets-'));

  t.after(() => rmSync(root, { force: true, recursive: true }));

  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }

  return root;
}

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
