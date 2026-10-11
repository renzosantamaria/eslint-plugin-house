import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isInstalled } from '../lib/installed.js';

test('a package in node_modules is installed', () => {
  assert.equal(isInstalled('eslint-plugin-vue'), true);
});

test('a package that is nowhere is not installed', () => {
  assert.equal(isInstalled('eslint-plugin-that-nobody-installed'), false);
});
