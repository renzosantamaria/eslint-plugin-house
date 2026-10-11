import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isDirective, isTemplateDirective } from '../lib/directives.js';

const DIRECTIVES = [
  ['Line', ' @ts-check'],
  ['Line', ' @ts-expect-error the fixture is wrong on purpose'],
  ['Line', ' @ts-ignore'],
  ['Line', ' @ts-nocheck'],
  ['Line', ' @vitest-environment happy-dom'],
  ['Block', '* @vitest-environment happy-dom '],
  ['Block', '*\n * @jest-environment jsdom\n '],
  ['Block', '* @vitest-environment-options { "url": "https://example.com" } '],
  ['Block', ' c8 ignore next '],
  ['Block', ' istanbul ignore next '],
  ['Block', ' v8 ignore start '],
  ['Line', ' eslint-disable-line no-console'],
  ['Line', ' eslint-disable-next-line no-console -- the reason'],
  ['Block', ' eslint-disable-next-line no-console '],
  ['Line', ' prettier-ignore'],
  ['Block', ' @vite-ignore '],
  ['Block', ' @__PURE__ '],
  ['Block', ' #__PURE__ '],
  ['Block', '* @type {import("eslint").Linter.Config[]} '],
  ['Block', '*\n * @type {Cart}\n '],
  ['Block', ' eslint eqeqeq: "off" '],
  ['Block', ' eslint-disable no-console '],
  ['Block', ' eslint-enable no-console '],
  ['Block', ' eslint-env node '],
  ['Block', ' exported start '],
  ['Block', ' global window '],
  ['Block', ' globals window, document '],
  ['Line', '/ <reference types="node" />'],
  ['Line', '/<reference types="node" />'],
  ['Line', '/  <reference types="node" />'],
  ['Line', '/ <amd-module name="cart" />'],
  ['Line', '/ <amd-dependency path="legacy" />'],
  ['Shebang', '/usr/bin/env node'],
];

const PROSE = [
  ['Line', ' The cart is empty until the first item is added.'],
  ['Line', ' eslint is configured in the root folder'],
  ['Line', ' global state lives in the store'],
  ['Line', ' globals are declared below'],
  ['Line', ' exported for the checkout page'],
  ['Line', ' eslint-disable no-console'],
  ['Block', ' eslint-disabled for now '],
  ['Block', ' globalThis is patched here '],
  ['Block', '* @typedef {object} Cart '],
  ['Block', '* @param {string} id The id of the cart. '],
  ['Line', ' prettier-ignored on purpose'],
  ['Line', ' TODO: @ts-ignore this later'],
  ['Block', '/ <reference types="node" /> '],
  ['Line', ' @type {Cart}'],
  ['Block', ' @type {Cart} '],
];

const TEMPLATE_DIRECTIVES = [
  ' eslint-disable ',
  ' eslint-disable vue/no-v-html ',
  ' eslint-disable-next-line vue/no-v-html ',
  ' eslint-disable-line vue/no-v-html ',
  ' eslint-enable ',
  ' prettier-ignore ',
  ' prettier-ignore-attribute ',
  ' @vue-expect-error ',
  ' @vue-generic {T} ',
  ' @vue-ignore ',
  ' @vue-skip ',
];

const TEMPLATE_PROSE = [
  ' The list is empty until the first order arrives. ',
  ' eslint-disabled ',
  ' eslint ',
  ' prettier-ignore-everything ',
  ' @ts-expect-error ',
  ' @vue-ignored ',
  ' @vue-next ',
];

for (const [type, value] of DIRECTIVES) {
  test(`a ${type} comment reading "${value.trim()}" is a directive`, () => {
    assert.equal(isDirective({ type, value }), true);
  });
}

for (const [type, value] of PROSE) {
  test(`a ${type} comment reading "${value.trim()}" is prose`, () => {
    assert.equal(isDirective({ type, value }), false);
  });
}

for (const value of TEMPLATE_DIRECTIVES) {
  test(`an HTML comment reading "${value.trim()}" is a directive`, () => {
    assert.equal(isTemplateDirective({ value }), true);
  });
}

for (const value of TEMPLATE_PROSE) {
  test(`an HTML comment reading "${value.trim()}" is prose`, () => {
    assert.equal(isTemplateDirective({ value }), false);
  });
}
