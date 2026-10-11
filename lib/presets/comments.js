import house from '../plugin.js';

export const comments = (options = {}) => [
  {
    name: 'house/comments',
    plugins: { house },
    rules: { 'house/short-comments': ['error', options] },
  },
];
