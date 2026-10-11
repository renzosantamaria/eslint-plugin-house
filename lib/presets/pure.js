import { SCRIPT_EXTENSIONS } from './files.js';
import { requireFolder, requireOptions, requireTexts } from './options.js';

const DEPTHS = 5;

// `./` and an empty segment lead nowhere and may sit before any step of a path.
const NOWHERE = String.raw`(?:\.?/)*`;

// Only the climb a path opens with is counted. A folder name followed by two
// climbs may leave the folder further on, so that shape is reported by itself.
const DETOUR = String.raw`(?:^|/)(?!\.{1,2}(?:/|$))[^/]+/${NOWHERE}\.\./${NOWHERE}\.\.(?:/|$)`;

const OUTSIDE =
  'This folder stays pure: it imports nothing from outside itself.';

// Files below the last depth share its block, where a climb that long may stay
// inside the folder and is reported all the same.
const sayLeaves = (depth) =>
  depth < DEPTHS - 1
    ? OUTSIDE
    : `${OUTSIDE} ${DEPTHS} levels up counts as outside, however deep the file is.`;

const restrictGlobal = (name) => ({
  message: 'This folder stays pure: take what you need as an argument.',
  name,
});

const PLAIN_NAME = /^[^/*?[\\!]+$/;

// A gitignore-style pattern without a slash matches at any depth, so a plain
// `vue` would also ban `./vue` inside the folder. The slash ties a name to the
// start: the module itself and what is under it.
const fromTheStart = (pattern) =>
  PLAIN_NAME.test(pattern) ? `/${pattern}` : pattern;

// A relative import leaves the folder when it climbs more levels than its file
// is deep, and a glob cannot count that. So each depth gets a block for the
// files at that depth or below it, and the deepest block that matches wins.
function restrictImportsAt(depth, folder, imports) {
  const patterns = [
    {
      message: sayLeaves(depth),
      regex: String.raw`^${NOWHERE}\.\.(?:/${NOWHERE}\.\.){${depth}}(?:/|$)`,
    },
    {
      message:
        'This folder stays pure: write this import without stepping into a folder and back out of it.',
      regex: DETOUR,
    },
  ];

  if (imports.length > 0) {
    patterns.push({
      group: imports.map(fromTheStart),
      message: 'This folder stays pure: this module is banned here.',
    });
  }

  return {
    files: [`${folder}/${'*/'.repeat(depth)}**/*.{${SCRIPT_EXTENSIONS}}`],
    rules: { 'no-restricted-imports': ['error', { patterns }] },
  };
}

export function pure(options = {}) {
  const { banned = {}, folder: given } = requireOptions('pure()', options, [
    'banned',
    'folder',
  ]);
  const { globals = [], imports = [] } = requireOptions(
    'pure({ banned })',
    banned,
    ['globals', 'imports'],
  );
  const folder = requireFolder('pure({ folder })', given);

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
