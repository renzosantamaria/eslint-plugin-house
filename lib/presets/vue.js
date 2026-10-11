import house from '../plugin.js';
import { VUE_FILES } from './files.js';

export function vue(...options) {
  if (options.length > 0) throw new TypeError('vue() takes no options.');

  return [
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
}
