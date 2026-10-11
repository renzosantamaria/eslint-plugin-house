import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ESLint, major } from './eslint.js';

const helper = fileURLToPath(new URL('./eslint.js', import.meta.url));
const printVersion = `console.log((await import(${JSON.stringify(helper)})).ESLint.version)`;

const loadEslintFor = (ESLINT_MAJOR) =>
  spawnSync(process.execPath, ['--input-type=module', '--eval', printVersion], {
    encoding: 'utf8',
    env: { ...process.env, ESLINT_MAJOR },
  });

test('this run uses the ESLint major it was asked for', () => {
  assert.equal(ESLint.version.split('.')[0], major);
});

test('ESLint 10 is loaded when no major is asked for', () => {
  assert.match(loadEslintFor('').stdout, /^10\./);
});

test('ESLint 9.39 is loaded when major 9 is asked for', () => {
  assert.match(loadEslintFor('9').stdout, /^9\.39\./);
});

test('a major with no installed ESLint is refused', () => {
  const { status, stderr } = loadEslintFor('8');

  assert.equal(status, 1);
  assert.match(stderr, /ESLINT_MAJOR must be one of 9, 10; got "8"/);
});
