import { isInstalled } from '../installed.js';
import { VUE_FILES } from './files.js';
import { requireFlag, requireOptions, requireTexts } from './options.js';

const message =
  "Format dates and times in the project's time utility, where the time zone is explicit. For a number, use Intl.NumberFormat.";

export const timeSelectors = [
  {
    message,
    selector:
      'CallExpression[callee.property.name=/^toLocale(Date|Time)?String$/]',
  },
  {
    message,
    selector:
      ":matches(NewExpression, CallExpression)[callee.object.name='Intl'][callee.property.name='DateTimeFormat']",
  },
];

export function time(options = {}) {
  const { utils, vue = isInstalled('eslint-plugin-vue') } = requireOptions(
    'time()',
    options,
    ['utils', 'vue'],
  );
  const ignores = requireTexts('time({ utils })', utils, { atLeast: 1 });
  const blocks = [
    {
      ignores,
      name: 'house/time',
      rules: { 'no-restricted-syntax': ['error', ...timeSelectors] },
    },
  ];

  if (requireFlag('time({ vue })', vue)) {
    blocks.push({
      files: VUE_FILES,
      ignores,
      name: 'house/time/vue',
      rules: { 'vue/no-restricted-syntax': ['error', ...timeSelectors] },
    });
  }

  return blocks;
}
