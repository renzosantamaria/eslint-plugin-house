import { SCRIPT_EXTENSIONS } from './files.js';
import { requireOptions, requireText, requireTexts } from './options.js';

const DEPTHS = 5;

const restrictGlobal = (name) => ({
  message: 'This folder stays pure: take what you need as an argument.',
  name,
});

// A relative import leaves the folder when it climbs more levels than its file
// is deep, and a glob cannot count that. So each depth gets a block for the
// files at that depth or below it, and the deepest block that matches wins.
function restrictImportsAt(depth, folder, imports) {
  const patterns = [
    {
      message:
        'This folder stays pure: it imports nothing from outside itself.',
      regex: `^(?:\\./)*\\.\\.(?:/\\.\\.){${depth}}(?:/|$)`,
    },
  ];

  if (imports.length > 0) {
    patterns.push({
      group: imports,
      message: 'This folder stays pure: this module is banned here.',
    });
  }

  return {
    files: [`${folder}/${'*/'.repeat(depth)}**/*.{${SCRIPT_EXTENSIONS}}`],
    rules: { 'no-restricted-imports': ['error', { patterns }] },
  };
}

export function pure(options = {}) {
  const { banned = {}, folder } = requireOptions('pure()', options, [
    'banned',
    'folder',
  ]);
  const { globals = [], imports = [] } = requireOptions(
    'pure({ banned })',
    banned,
    ['globals', 'imports'],
  );

  requireText('pure({ folder })', folder);
  requireTexts('pure({ banned: { globals } })', globals);
  requireTexts('pure({ banned: { imports } })', imports);

  const blocks = Array.from({ length: DEPTHS }, (_, depth) =>
    restrictImportsAt(depth, folder, imports),
  );

  if (globals.length > 0) {
    blocks.push({
      files: [`${folder}/**/*.{${SCRIPT_EXTENSIONS}}`],
      rules: {
        'no-restricted-globals': ['error', ...globals.map(restrictGlobal)],
      },
    });
  }

  return blocks.map((block) => ({ ...block, name: `house/pure/${folder}` }));
}
