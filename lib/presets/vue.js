import house from '../plugin.js';
import { VUE_FILES } from './files.js';

export const vue = () => [
  {
    files: VUE_FILES,
    name: 'house/vue',
    plugins: { house },
    rules: {
      'house/no-style-comments': 'error',
      'house/no-template-comments': 'error',
    },
  },
];
