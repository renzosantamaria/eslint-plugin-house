import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const bin = fileURLToPath(
  new URL('../bin/house-stylesheets.js', import.meta.url),
);
const fixtures = fileURLToPath(
  new URL('./fixtures/stylesheets/', import.meta.url),
);

function checkStylesheets(...paths) {
  const { status, stderr, stdout } = spawnSync(
    process.execPath,
    [bin, ...paths],
    {
      cwd: fixtures,
      encoding: 'utf8',
    },
  );

  return { status, stderr, stdout };
}

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
