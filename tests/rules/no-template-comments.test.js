import vueParser from 'vue-eslint-parser';

import house from '../../lib/index.js';
import { RuleTester } from '../eslint.js';
import { lines } from './helpers.js';

const rule = house.rules['no-template-comments'];

new RuleTester({ languageOptions: { parser: vueParser } }).run(
  'no-template-comments',
  rule,
  {
    valid: [
      {
        name: 'a template without comments',
        filename: 'UserCard.vue',
        code: lines(
          '<template>',
          '  <p class="user-card">Ada</p>',
          '</template>',
        ),
      },
      {
        name: 'an eslint-disable-next-line directive',
        filename: 'UserCard.vue',
        code: lines(
          '<template>',
          '  <!-- eslint-disable-next-line vue/no-v-html -->',
          '  <p v-html="bio" />',
          '</template>',
        ),
      },
      {
        name: 'a prettier-ignore directive',
        filename: 'UserCard.vue',
        code: lines(
          '<template>',
          '  <!-- prettier-ignore -->',
          '  <p>Ada</p>',
          '</template>',
        ),
      },
      {
        name: 'a directive that the Vue type checker reads',
        filename: 'UserCard.vue',
        code: lines(
          '<template>',
          '  <!-- @vue-expect-error the prop is wrong on purpose -->',
          '  <UserName :name="5" />',
          '</template>',
        ),
      },
      {
        name: 'a JavaScript comment inside an expression',
        filename: 'UserCard.vue',
        code: lines(
          '<template>',
          '  <p>{{ /* first name */ name }}</p>',
          '</template>',
        ),
      },
      {
        name: 'a component without a template',
        filename: 'UserCard.vue',
        code: lines('<script setup>', 'const name = "Ada";', '</script>'),
      },
      {
        name: 'a script file',
        filename: 'user.js',
        code: 'export const name = "Ada";',
      },
    ],
    invalid: [
      {
        name: 'an HTML comment',
        filename: 'UserCard.vue',
        code: lines(
          '<template>',
          '  <!-- The name of the user. -->',
          '  <p>Ada</p>',
          '</template>',
        ),
        errors: [
          {
            messageId: 'comment',
            line: 2,
            column: 3,
            endLine: 2,
            endColumn: 33,
          },
        ],
      },
      {
        name: 'an HTML comment of several lines',
        filename: 'UserCard.vue',
        code: lines(
          '<template>',
          '  <!--',
          '    The name of the user.',
          '  -->',
          '  <p>Ada</p>',
          '</template>',
        ),
        errors: [{ messageId: 'comment', line: 2, endLine: 4 }],
      },
      {
        name: 'an HTML comment above the template',
        filename: 'UserCard.vue',
        code: lines(
          '<!-- Shows one user. -->',
          '<template>',
          '  <p>Ada</p>',
          '</template>',
        ),
        errors: [{ messageId: 'comment', line: 1 }],
      },
      {
        name: 'an HTML comment between the template and the script',
        filename: 'UserCard.vue',
        code: lines(
          '<template>',
          '  <p>Ada</p>',
          '</template>',
          '<!-- Shows one user. -->',
          '<script setup>',
          'const name = "Ada";',
          '</script>',
        ),
        errors: [{ messageId: 'comment', line: 4 }],
      },
      {
        name: 'an HTML comment in a component without a template',
        filename: 'UserCard.vue',
        code: lines(
          '<!-- Shows one user. -->',
          '<script setup>',
          'const name = "Ada";',
          '</script>',
        ),
        errors: [{ messageId: 'comment', line: 1, column: 1 }],
      },
      {
        name: 'an HTML comment beside a directive',
        filename: 'UserCard.vue',
        code: lines(
          '<template>',
          '  <!-- eslint-disable-next-line vue/no-v-html -->',
          '  <p v-html="bio" />',
          '  <!-- The biography is sanitised on the server. -->',
          '</template>',
        ),
        errors: [{ messageId: 'comment', line: 4 }],
      },
    ],
  },
);

new RuleTester().run('no-template-comments without the Vue parser', rule, {
  valid: [{ name: 'a script file', code: 'export const name = "Ada";' }],
  invalid: [],
});
