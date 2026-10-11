import assert from 'node:assert/strict';
import { test } from 'node:test';

import vueParser from 'vue-eslint-parser';

import house from '../../lib/index.js';
import { RuleTester } from '../eslint.js';
import { lintWithOptions } from './helpers.js';

const rule = house.rules['component-root-class'];

const template = (...markup) =>
  ['<template>', ...markup, '</template>'].join('\n');

const wrapped = (wrappers, markup) =>
  wrappers.reduceRight(
    (inner, wrapper) => `<${wrapper}>${inner}</${wrapper}>`,
    markup,
  );

new RuleTester({ languageOptions: { parser: vueParser } }).run(
  'component-root-class',
  rule,
  {
    valid: [
      {
        name: 'a root that carries the name of the component',
        filename: 'components/UserCard.vue',
        code: template('<div class="user-card">Ada</div>'),
      },
      {
        name: 'a root that carries the name among other classes',
        filename: 'components/UserCard.vue',
        code: template('<div class="card  user-card is-active">Ada</div>'),
      },
      {
        name: 'a root whose classes are spread over two lines',
        filename: 'components/UserCard.vue',
        code: template('<div class="card\nuser-card">Ada</div>'),
      },
      {
        name: 'a name with a digit before a capital',
        filename: 'components/Step2Panel.vue',
        code: template('<section class="step2-panel" />'),
      },
      {
        name: 'a name that opens with a single letter',
        filename: 'components/AButton.vue',
        code: template('<button class="a-button" />'),
      },
      {
        name: 'a name that opens with an acronym',
        filename: 'components/FAQList.vue',
        code: template('<ul class="faq-list" />'),
      },
      {
        name: 'a name with a single letter in the middle',
        filename: 'components/UserAButton.vue',
        code: template('<button class="user-a-button" />'),
      },
      {
        name: 'a name with a Nuxt suffix',
        filename: 'components/MapView.client.vue',
        code: template('<div class="map-view" />'),
      },
      {
        name: 'a name that is already lower case',
        filename: 'pages/index.vue',
        code: template('<main class="index" />'),
      },
      {
        name: 'one of two roots carries the name',
        filename: 'components/UserCard.vue',
        code: template(
          '<p v-if="loading">Loading</p>',
          '<div v-else class="user-card">Ada</div>',
        ),
      },
      {
        name: 'the first element inside a child component carries the name',
        filename: 'components/UserCard.vue',
        code: template(
          '<Teleport to="body"><div class="user-card">Ada</div></Teleport>',
        ),
      },
      {
        name: 'the first element inside a <template> wrapper carries the name',
        filename: 'components/UserCard.vue',
        code: template(
          '<template v-if="user"><div class="user-card">Ada</div></template>',
        ),
      },
      {
        name: 'a named slot before the content of a child component',
        filename: 'components/UserCard.vue',
        code: template(
          '<ClientOnly>',
          '  <template #fallback><p>Loading</p></template>',
          '  <div class="user-card">Ada</div>',
          '</ClientOnly>',
        ),
      },
      {
        name: 'a default slot written out under a named one',
        filename: 'components/UserCard.vue',
        code: template(
          '<BaseCard>',
          '  <template #header><h2>Ada</h2></template>',
          '  <template #default><div class="user-card">Ada</div></template>',
          '</BaseCard>',
        ),
      },
      {
        name: 'a slot without a name under a named one',
        filename: 'components/UserCard.vue',
        code: template(
          '<BaseList>',
          '  <template #empty><p>Nobody</p></template>',
          '  <template v-slot="{ user }"><li class="user-card">{{ user }}</li></template>',
          '</BaseList>',
        ),
      },
      {
        name: 'the first of the named slots when a child component has no other content',
        filename: 'components/UserCard.vue',
        code: template(
          '<BaseCard>',
          '  <template #header><h2 class="user-card">Ada</h2></template>',
          '  <template #footer><p>Online</p></template>',
          '</BaseCard>',
        ),
      },
      {
        name: 'a component that only hands on its slot',
        filename: 'components/UserCard.vue',
        code: template('<slot />'),
      },
      {
        name: 'the element inside five wrappers carries the name',
        filename: 'components/UserCard.vue',
        code: template(
          wrapped(['A', 'B', 'C', 'D', 'E'], '<div class="user-card" />'),
        ),
      },
      {
        name: 'a child component without children is given the name',
        filename: 'components/UserCard.vue',
        code: template('<BaseCard class="user-card" />'),
      },
      {
        name: 'a component listed as drawing its own root is given the name',
        filename: 'components/UserCard.vue',
        code: template(
          '<NuxtLink class="user-card" to="/users"><span>Ada</span></NuxtLink>',
        ),
        options: [{ drawsOwnRoot: ['BaseButton', 'NuxtLink'] }],
      },
      {
        name: 'a template without elements',
        filename: 'components/UserCard.vue',
        code: template('Ada'),
      },
      {
        name: 'a component without a template',
        filename: 'components/UserCard.vue',
        code: '<script setup>\nconst name = "Ada";\n</script>',
      },
      {
        name: 'a script file',
        filename: 'components/user.js',
        code: 'export const name = "Ada";',
      },
    ],
    invalid: [
      {
        name: 'a root without classes',
        filename: 'components/UserCard.vue',
        code: template('<div>Ada</div>'),
        errors: [
          {
            message:
              'The root element of UserCard should carry class "user-card".',
            line: 2,
            column: 1,
            endLine: 2,
            endColumn: 6,
          },
        ],
      },
      {
        name: 'a root with other classes',
        filename: 'components/UserCard.vue',
        code: template('<div class="card is-active">Ada</div>'),
        errors: [
          {
            message:
              'The root element of UserCard should carry class "user-card" — it has "card is-active".',
          },
        ],
      },
      {
        name: 'a root with an empty class attribute',
        filename: 'components/UserCard.vue',
        code: template('<div class="">Ada</div>'),
        errors: [
          {
            message:
              'The root element of UserCard should carry class "user-card".',
          },
        ],
      },
      {
        name: 'a root with a class attribute without a value',
        filename: 'components/UserCard.vue',
        code: template('<div class>Ada</div>'),
        errors: [
          {
            message:
              'The root element of UserCard should carry class "user-card".',
          },
        ],
      },
      {
        name: 'a name of several words',
        filename: 'components/OrderLineItem.vue',
        code: template('<li class="order-line">Tea</li>'),
        errors: [
          {
            message:
              'The root element of OrderLineItem should carry class "order-line-item" — it has "order-line".',
          },
        ],
      },
      {
        name: 'a name with a Nuxt suffix on a root without it',
        filename: 'components/MapView.server.vue',
        code: template('<div class="map">Ada</div>'),
        errors: [
          {
            message:
              'The root element of MapView should carry class "map-view" — it has "map".',
          },
        ],
      },
      {
        name: 'a root whose classes only contain the name',
        filename: 'components/UserCard.vue',
        code: template('<div class="user-card__inner my-user-card">Ada</div>'),
        errors: [{ messageId: 'missing' }],
      },
      {
        name: 'the name on the second element inside a child component',
        filename: 'components/UserCard.vue',
        code: template(
          '<Teleport to="body"><p>Hi</p><div class="user-card">Ada</div></Teleport>',
        ),
        errors: [{ messageId: 'missingInside', line: 2, column: 21 }],
      },
      {
        name: 'a root without the name under a slot',
        filename: 'components/UserCard.vue',
        code: template('<slot name="before" />', '<div>Ada</div>'),
        errors: [{ messageId: 'missing', line: 3, column: 1 }],
      },
      {
        name: 'a root that only binds the name',
        filename: 'components/UserCard.vue',
        code: template(`<div :class="'user-card'">Ada</div>`),
        errors: [
          {
            messageId: 'missing',
            data: { component: 'UserCard', expected: 'user-card', found: '' },
          },
        ],
      },
      {
        name: 'the name on a child component whose own root is drawn below it',
        filename: 'components/UserCard.vue',
        code: template('<BaseCard class="user-card"><div>Ada</div></BaseCard>'),
        errors: [{ messageId: 'missingInside', line: 2, column: 29 }],
      },
      {
        name: 'the name on a <template> wrapper',
        filename: 'components/UserCard.vue',
        code: template(
          '<template v-if="user" class="user-card"><div>Ada</div></template>',
        ),
        errors: [{ messageId: 'missing' }],
      },
      {
        name: 'the name on an element in lower case inside another',
        filename: 'components/UserCard.vue',
        code: template('<section><div class="user-card">Ada</div></section>'),
        errors: [{ messageId: 'missing', line: 2, column: 1 }],
      },
      {
        name: 'the element inside six wrappers carries the name',
        filename: 'components/UserCard.vue',
        code: template(
          wrapped(['A', 'B', 'C', 'D', 'E', 'F'], '<div class="user-card" />'),
        ),
        errors: [
          {
            messageId: 'missingInside',
            data: {
              component: 'UserCard',
              expected: 'user-card',
              found: '',
              through: 'A',
            },
            line: 2,
            column: 16,
          },
        ],
      },
      {
        name: 'a link that is not listed as drawing its own root is given the name',
        filename: 'components/UserCard.vue',
        code: template(
          '<NuxtLink class="user-card" to="/users"><span>Ada</span></NuxtLink>',
        ),
        errors: [
          {
            message:
              'The root element of UserCard should carry class "user-card". It was looked for inside <NuxtLink>; if <NuxtLink> draws an element of its own, list it in drawsOwnRoot.',
            line: 2,
            column: 41,
          },
        ],
      },
      {
        name: 'a root without the name inside a child component under a <template> wrapper',
        filename: 'components/UserCard.vue',
        code: template(
          '<template v-if="user"><BaseCard><div class="card">Ada</div></BaseCard></template>',
        ),
        errors: [
          {
            message:
              'The root element of UserCard should carry class "user-card" — it has "card". It was looked for inside <BaseCard>; if <BaseCard> draws an element of its own, list it in drawsOwnRoot.',
          },
        ],
      },
      {
        name: 'the element inside a component listed as drawing its own root carries the name',
        filename: 'components/UserCard.vue',
        code: template(
          '<NuxtLink to="/users"><span class="user-card">Ada</span></NuxtLink>',
        ),
        options: [{ drawsOwnRoot: ['NuxtLink'] }],
        errors: [{ messageId: 'missing', line: 2, column: 1 }],
      },
      {
        name: 'no root carries the name',
        filename: 'components/UserCard.vue',
        code: template(
          '<p v-if="loading" class="loading">Loading</p>',
          '<div v-else class="card">Ada</div>',
        ),
        errors: [
          {
            message:
              'The root element of UserCard should carry class "user-card" — it has "loading".',
            line: 2,
          },
        ],
      },
    ],
  },
);

new RuleTester().run('component-root-class without the Vue parser', rule, {
  valid: [
    {
      name: 'a script file',
      filename: 'components/user.js',
      code: 'export const name = "Ada";',
    },
  ],
  invalid: [],
});

const lintWith = (options) => lintWithOptions('component-root-class', options);

test('a list of names that is not a list is refused', () => {
  assert.throws(
    lintWith({ drawsOwnRoot: 'NuxtLink' }),
    /Value "NuxtLink" should be array/,
  );
});

test('a name that is not text is refused', () => {
  assert.throws(lintWith({ drawsOwnRoot: [1] }), /Value 1 should be string/);
});

test('an option the rule does not know is refused', () => {
  assert.throws(
    lintWith({ drawOwnRoot: ['NuxtLink'] }),
    /Unexpected property "drawOwnRoot"/,
  );
});
