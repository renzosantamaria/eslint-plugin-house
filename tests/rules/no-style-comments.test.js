import vueParser from 'vue-eslint-parser';

import house from '../../lib/index.js';
import { RuleTester } from '../eslint.js';
import { lines } from './helpers.js';

const rule = house.rules['no-style-comments'];

new RuleTester({ languageOptions: { parser: vueParser } }).run(
  'no-style-comments',
  rule,
  {
    valid: [
      {
        name: 'a style block without comments',
        filename: 'UserCard.vue',
        code: lines('<style scoped>', '.user-card { color: red; }', '</style>'),
      },
      {
        name: 'a comment in the script block under a style block',
        filename: 'UserCard.vue',
        code: lines(
          '<style>',
          '.user-card { color: red; }',
          '</style>',
          '<script setup>',
          '/* The first name. */',
          'const name = "Ada";',
          '</script>',
        ),
      },
      {
        name: 'a // in an attribute of the style tag',
        filename: 'UserCard.vue',
        code: lines(
          '<style lang="scss" title=a//b>',
          '.user-card { color: red; }',
          '</style>',
        ),
      },
      {
        name: 'comment markers in the text of a template',
        filename: 'UserCard.vue',
        code: lines('<template>', '  <p>/* Ada */</p>', '</template>'),
      },
      {
        name: 'a protocol-relative address in a plain CSS block',
        filename: 'UserCard.vue',
        code: lines(
          '<style>',
          '.user-card { background: url(//cdn.example.com/a.png); }',
          '</style>',
        ),
      },
      {
        name: 'a style block that is never closed',
        filename: 'UserCard.vue',
        code: lines('<style>', '/* The card. */', '.user-card { color: red; }'),
      },
      {
        name: 'a script file',
        filename: 'user.js',
        code: 'export const name = "Ada"; // the first name',
      },
    ],
    invalid: [
      {
        name: 'a block comment in a plain CSS block',
        filename: 'UserCard.vue',
        code: lines(
          '<style scoped>',
          '/* The card. */',
          '.user-card { color: red; }',
          '</style>',
        ),
        errors: [
          {
            messageId: 'comment',
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 16,
          },
        ],
      },
      {
        name: 'a // line in an SCSS block',
        filename: 'UserCard.vue',
        code: lines(
          '<style scoped lang="scss">',
          '.user-card {',
          '  color: red; // brand',
          '}',
          '</style>',
        ),
        errors: [
          {
            messageId: 'comment',
            line: 3,
            column: 15,
            endLine: 3,
            endColumn: 23,
          },
        ],
      },
      {
        name: 'only the block comment on a plain CSS line that also holds //',
        filename: 'UserCard.vue',
        code: lines(
          '<style>',
          '.user-card { color: red; } // plain CSS has no such comment /* this is one */',
          '</style>',
        ),
        errors: [
          {
            messageId: 'comment',
            line: 2,
            column: 61,
            endLine: 2,
            endColumn: 78,
          },
        ],
      },
      {
        name: 'a comment in the second of two style blocks',
        filename: 'UserCard.vue',
        code: lines(
          '<style>',
          '.user-card { color: red; }',
          '</style>',
          '',
          '<style scoped lang="scss">',
          '// The avatar.',
          '.user-card__avatar { width: 2rem; }',
          '</style>',
        ),
        errors: [
          {
            messageId: 'comment',
            line: 6,
            column: 1,
            endLine: 6,
            endColumn: 15,
          },
        ],
      },
      {
        name: 'every comment in a style block',
        filename: 'UserCard.vue',
        code: lines(
          '<style lang="scss">',
          '/* one */',
          '.user-card {',
          '  // two',
          '  color: red;',
          '}',
          '</style>',
        ),
        errors: [
          { messageId: 'comment', line: 2 },
          { messageId: 'comment', line: 4 },
        ],
      },
    ],
  },
);

new RuleTester().run('no-style-comments without the Vue parser', rule, {
  valid: [{ name: 'a script file', code: 'export const name = "Ada";' }],
  invalid: [],
});
