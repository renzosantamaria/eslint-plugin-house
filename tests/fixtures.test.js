import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('no fixture has a name that node --test would run', () => {
  const { stdout } = spawnSync(
    process.execPath,
    ['--test', '--test-reporter=tap'],
    {
      cwd: fileURLToPath(new URL('./fixtures/', import.meta.url)),
      encoding: 'utf8',
      env: { ...process.env, NODE_TEST_CONTEXT: undefined },
    },
  );

  assert.match(stdout, /^# tests 0$/m);
});
