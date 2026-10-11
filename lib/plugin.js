import { createRequire } from 'node:module';

import { componentRootClass } from './rules/component-root-class.js';
import { noComments } from './rules/no-comments.js';
import { noStyleComments } from './rules/no-style-comments.js';
import { noTemplateComments } from './rules/no-template-comments.js';
import { shortComments } from './rules/short-comments.js';

const { name, version } = createRequire(import.meta.url)('../package.json');

export default {
  meta: { name, namespace: 'house', version },
  rules: {
    'component-root-class': componentRootClass,
    'no-comments': noComments,
    'no-style-comments': noStyleComments,
    'no-template-comments': noTemplateComments,
    'short-comments': shortComments,
  },
};
