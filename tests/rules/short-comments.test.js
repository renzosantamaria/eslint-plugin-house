import assert from 'node:assert/strict';
import { test } from 'node:test';

import vueParser from 'vue-eslint-parser';

import house from '../../lib/index.js';
import { RuleTester } from '../eslint.js';
import { lines, lintWithOptions } from './helpers.js';

const rule = house.rules['short-comments'];

new RuleTester().run('short-comments', rule, {
  valid: [
    {
      name: 'a block comment of three lines',
      code: lines('/*', ' * One line of reasoning.', ' */', 'run();'),
    },
    {
      name: 'a run of three // lines',
      code: lines('// one', '// two', '// three', 'run();'),
    },
    {
      name: 'two runs of three // lines with a blank line between them',
      code: lines(
        '// one',
        '// two',
        '// three',
        '',
        '// four',
        '// five',
        '// six',
        'run();',
      ),
    },
    {
      name: 'two runs of three // lines with code between them',
      code: lines(
        '// one',
        '// two',
        '// three',
        'run();',
        '// four',
        '// five',
        '// six',
        'stop();',
      ),
    },
    {
      name: 'a comment at the end of each of four lines of code',
      code: lines(
        'one(); // one',
        'two(); // two',
        'three(); // three',
        'four(); // four',
      ),
    },
    {
      name: 'a run of three // lines under a comment at the end of a line of code',
      code: lines(
        'one(); // about one',
        '// two',
        '// three',
        '// four',
        'two();',
      ),
    },
    {
      name: 'a comment at the end of a line of code under a run of three // lines',
      code: lines('// one', '// two', '// three', 'run(); // four'),
    },
    {
      name: 'a block comment directly under a run of three // lines',
      code: lines('// one', '// two', '// three', '/* four */', 'run();'),
    },
    {
      name: 'a directive directly under a run of three // lines',
      code: lines(
        '// one',
        '// two',
        '// three',
        '// eslint-disable-next-line no-console',
        'console.log(1);',
      ),
    },
    {
      name: 'a directive of five lines',
      code: lines(
        '/* eslint-disable no-console --',
        '   The reasons for this exception',
        '   take up more lines',
        '   than a comment',
        '   may. */',
        'console.log(1);',
      ),
    },
    {
      name: 'a run of three // lines directly under a shebang',
      code: lines(
        '#!/usr/bin/env node',
        '// one',
        '// two',
        '// three',
        'run();',
      ),
    },
    {
      name: 'a run of five // lines when max is 5',
      code: lines(
        '// one',
        '// two',
        '// three',
        '// four',
        '// five',
        'run();',
      ),
      options: [{ max: 5 }],
    },
    {
      name: 'a single // line when max is 1',
      code: lines('// one', 'run();'),
      options: [{ max: 1 }],
    },
  ],
  invalid: [
    {
      name: 'a block comment of four lines',
      code: lines(
        '/*',
        ' * One line of reasoning,',
        ' * and one more.',
        ' */',
        'run();',
      ),
      errors: [
        {
          messageId: 'tooLong',
          data: { lines: 4, max: 3 },
          line: 1,
          column: 1,
          endLine: 4,
          endColumn: 4,
        },
      ],
    },
    {
      name: 'a run of four // lines',
      code: lines('// one', '// two', '// three', '// four', 'run();'),
      errors: [
        {
          messageId: 'tooLong',
          data: { lines: 4, max: 3 },
          line: 1,
          column: 1,
          endLine: 4,
          endColumn: 8,
        },
      ],
    },
    {
      name: 'an indented run of four // lines',
      code: lines(
        'function run() {',
        '  // one',
        '  // two',
        '  // three',
        '  // four',
        '  stop();',
        '}',
      ),
      errors: [{ messageId: 'tooLong', line: 2, column: 3, endLine: 5 }],
    },
    {
      name: 'a run of four // lines under a comment at the end of a line of code',
      code: lines(
        'one(); // about one',
        '// two',
        '// three',
        '// four',
        '// five',
        'two();',
      ),
      errors: [
        {
          messageId: 'tooLong',
          data: { lines: 4, max: 3 },
          line: 2,
          endLine: 5,
        },
      ],
    },
    {
      name: 'a run of four // lines above a directive and one more // line',
      code: lines(
        '// one',
        '// two',
        '// three',
        '// four',
        '// @ts-expect-error',
        '// five',
        'run();',
      ),
      errors: [
        {
          messageId: 'tooLong',
          data: { lines: 4, max: 3 },
          line: 1,
          endLine: 4,
        },
      ],
    },
    {
      name: 'a run of four // lines that opens with the word eslint',
      code: lines(
        '// eslint is set up in the root folder',
        '// two',
        '// three',
        '// four',
        'run();',
      ),
      errors: [{ messageId: 'tooLong', line: 1, endLine: 4 }],
    },
    {
      name: 'a run of two // lines when max is 1',
      code: lines('// one', '// two', 'run();'),
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'tooLong',
          data: { lines: 2, max: 1 },
          line: 1,
          endLine: 2,
        },
      ],
    },
    {
      name: 'a run of six // lines when max is 5',
      code: lines(
        '// one',
        '// two',
        '// three',
        '// four',
        '// five',
        '// six',
        'run();',
      ),
      options: [{ max: 5 }],
      errors: [
        {
          messageId: 'tooLong',
          data: { lines: 6, max: 5 },
          line: 1,
          endLine: 6,
        },
      ],
    },
    {
      name: 'two comments that are each too long',
      code: lines(
        '// one',
        '// two',
        '// three',
        '// four',
        'run();',
        '/*',
        ' * five',
        ' * six',
        ' */',
        'stop();',
      ),
      errors: [
        { messageId: 'tooLong', line: 1, endLine: 4 },
        { messageId: 'tooLong', line: 6, endLine: 9 },
      ],
    },
  ],
});

new RuleTester({ languageOptions: { parser: vueParser } }).run(
  'short-comments in a Vue single-file component',
  rule,
  {
    valid: [
      {
        name: 'a run of three // lines in the script block',
        filename: 'UserCard.vue',
        code: lines(
          '<script setup>',
          '// one',
          '// two',
          '// three',
          'const name = "Ada";',
          '</script>',
        ),
      },
    ],
    invalid: [
      {
        name: 'a run of four // lines in the script block',
        filename: 'UserCard.vue',
        code: lines(
          '<template>',
          '  <p>{{ name }}</p>',
          '</template>',
          '',
          '<script setup>',
          '// one',
          '// two',
          '// three',
          '// four',
          'const name = "Ada";',
          '</script>',
        ),
        errors: [{ messageId: 'tooLong', line: 6, endLine: 9 }],
      },
    ],
  },
);

const lintWith = (options) => lintWithOptions('short-comments', options);

test('a max below 1 is refused', () => {
  assert.throws(lintWith({ max: 0 }), /Value 0 should be >= 1/);
});

test('a max that is not a whole number is refused', () => {
  assert.throws(lintWith({ max: 2.5 }), /Value 2.5 should be integer/);
});

test('an option the rule does not know is refused', () => {
  assert.throws(lintWith({ maximum: 5 }), /Unexpected property "maximum"/);
});
