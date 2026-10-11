import js from '@eslint/js';

import { comments, specs } from './lib/index.js';

export default [
  { ignores: ['tests/fixtures/**'] },
  js.configs.recommended,
  {
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', URL: 'readonly' },
    },
  },
  ...comments(),
  ...specs(),
];
