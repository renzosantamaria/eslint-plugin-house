import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { plantFiles } from './plant-files.js';

const bin = fileURLToPath(
  new URL('../bin/house-stylesheets.js', import.meta.url),
);
const fixtures = fileURLToPath(
  new URL('./fixtures/stylesheets/', import.meta.url),
);

function run(command, args, cwd = fixtures) {
  const { status, stderr, stdout } = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
  });

  return { status, stderr, stdout };
}

const checkStylesheets = (...paths) => run(process.execPath, [bin, ...paths]);

const isRoot = process.getuid?.() === 0;

test('stylesheets without comments pass', () => {
  assert.deepEqual(checkStylesheets('clean'), {
    status: 0,
    stderr: '',
    stdout: '',
  });
});

test('every comment in a stylesheet is listed and the check fails', () => {
  assert.deepEqual(checkStylesheets('commented'), {
    status: 1,
    stderr: '',
    stdout: [
      'commented/app.scss:1:1: No comments in stylesheets.',
      'commented/app.scss:4:24: No comments in stylesheets.',
      'commented/print/page.css:4:1: No comments in stylesheets.',
      '',
    ].join('\n'),
  });
});

test('several paths are checked together', () => {
  assert.deepEqual(checkStylesheets('clean', 'commented/print/page.css'), {
    status: 1,
    stderr: '',
    stdout: 'commented/print/page.css:4:1: No comments in stylesheets.\n',
  });
});

test('a call without paths is refused', () => {
  assert.deepEqual(checkStylesheets(), {
    status: 2,
    stderr: 'Usage: house-stylesheets <file or folder>...\n',
    stdout: '',
  });
});

test('a path that does not exist is refused', () => {
  assert.deepEqual(checkStylesheets('clean', 'styles', 'assets'), {
    status: 2,
    stderr: 'house-stylesheets: no such path: styles, assets\n',
    stdout: '',
  });
});

test('a stylesheet that cannot be read is refused', { skip: isRoot }, (t) => {
  const root = plantFiles(t, { 'locked.css': '/* a */' });

  chmodSync(join(root, 'locked.css'), 0o000);

  assert.deepEqual(run(process.execPath, [bin, 'locked.css'], root), {
    status: 2,
    stderr: "house-stylesheets: EACCES: permission denied, open 'locked.css'\n",
    stdout: '',
  });
});

test('the command runs by itself, without naming node', () => {
  assert.deepEqual(run(bin, ['clean']), { status: 0, stderr: '', stdout: '' });
});
