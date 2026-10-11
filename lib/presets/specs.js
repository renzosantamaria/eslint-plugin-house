import house from '../plugin.js';
import { SCRIPT_EXTENSIONS } from './files.js';
import { requireOptions, requireTexts } from './options.js';

const SPEC_FILES = [`**/*.{spec,test,e2e-spec}.{${SCRIPT_EXTENSIONS}}`];

export function specs(options = {}) {
  const { files = SPEC_FILES } = requireOptions('specs()', options, ['files']);

  return [
    {
      files: requireTexts('specs({ files })', files, { atLeast: 1 }),
      name: 'house/specs',
      plugins: { house },
      rules: { 'house/no-comments': 'error' },
    },
  ];
}
