import house from '../../lib/index.js';
import { RuleTester } from '../eslint.js';
import { lines } from './helpers.js';

new RuleTester().run('no-comments', house.rules['no-comments'], {
  valid: [
    { name: 'a file without comments', code: 'run();' },
    {
      name: 'a shebang',
      code: lines('#!/usr/bin/env node', 'run();'),
    },
    {
      name: 'an eslint-disable-next-line directive',
      code: lines(
        '// eslint-disable-next-line no-console -- the reason',
        'console.log(1);',
      ),
    },
    {
      name: 'an eslint-disable block directive',
      code: lines('/* eslint-disable no-console */', 'console.log(1);'),
    },
    {
      name: 'a @ts-expect-error directive',
      code: lines(
        '// @ts-expect-error the argument is wrong on purpose',
        'run(1);',
      ),
    },
    {
      name: 'a test-environment docblock',
      code: lines('/** @vitest-environment happy-dom */', 'run();'),
    },
    {
      name: 'a coverage directive',
      code: lines('/* v8 ignore next */', 'run();'),
    },
    {
      name: 'a triple-slash reference',
      code: lines('/// <reference types="node" />', 'run();'),
    },
    {
      name: 'two directives in a row',
      code: lines(
        '// @ts-nocheck',
        '/* eslint-disable no-console */',
        'console.log(1);',
      ),
    },
  ],
  invalid: [
    {
      name: 'a // line',
      code: lines('// Adds the first item.', 'run();'),
      errors: [
        { messageId: 'comment', line: 1, column: 1, endLine: 1, endColumn: 24 },
      ],
    },
    {
      name: 'a block comment',
      code: lines('run(); /* twice */', 'run();'),
      errors: [
        { messageId: 'comment', line: 1, column: 8, endLine: 1, endColumn: 19 },
      ],
    },
    {
      name: 'a documentation block',
      code: lines(
        '/**',
        ' * @param {string} id The id of the cart.',
        ' */',
        'run();',
      ),
      errors: [{ messageId: 'comment', line: 1, endLine: 3 }],
    },
    {
      name: 'a run of three // lines is reported once',
      code: lines('// one', '// two', '// three', 'run();'),
      errors: [{ messageId: 'comment', line: 1, endLine: 3 }],
    },
    {
      name: 'a // line of prose under a directive',
      code: lines(
        '// eslint-disable-next-line no-console',
        '// Logs the total.',
        'console.log(1);',
      ),
      errors: [{ messageId: 'comment', line: 2, endLine: 2 }],
    },
    {
      name: 'a // line that opens with the word global',
      code: lines('// global state lives in the store', 'run();'),
      errors: [{ messageId: 'comment', line: 1 }],
    },
    {
      name: 'every comment in the file',
      code: lines('// one', 'run();', '', '/* two */', 'run(); // three'),
      errors: [
        { messageId: 'comment', line: 1 },
        { messageId: 'comment', line: 4 },
        { messageId: 'comment', line: 5 },
      ],
    },
  ],
});
