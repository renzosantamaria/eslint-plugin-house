import house from '../../lib/index.js';
import { Linter } from '../eslint.js';

export const lines = (...text) => text.join('\n');

export const lintWithOptions = (rule, options) => () =>
  new Linter().verify('run();', [
    { plugins: { house }, rules: { [`house/${rule}`]: ['error', options] } },
  ]);
