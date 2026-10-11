export const NO_STYLE_COMMENTS = 'No comments in stylesheets.';

const LANGUAGES_WITH_LINE_COMMENTS = new Set([
  'less',
  'sass',
  'scss',
  'styl',
  'stylus',
]);

const BLOCK_COMMENT = String.raw`\/\*[\s\S]*?(?:\*\/|$)`;
const LINE_COMMENT = String.raw`\/\/[^\n]*`;

// A `//` or `/*` inside a string or an unquoted url() is not a comment, so
// those are matched first and thrown away.
const NOT_A_COMMENT = [
  String.raw`"(?:\\[\s\S]|[^"\\])*"`,
  String.raw`'(?:\\[\s\S]|[^'\\])*'`,
  String.raw`url\((?!\s*["'])[^)]*\)`,
];

const BLOCK_COMMENTS_ONLY = new RegExp(
  [...NOT_A_COMMENT, BLOCK_COMMENT].join('|'),
  'gi',
);
const BLOCK_AND_LINE_COMMENTS = new RegExp(
  [...NOT_A_COMMENT, BLOCK_COMMENT, LINE_COMMENT].join('|'),
  'gi',
);

export function locateStyleComments(css, language) {
  const tokens = LANGUAGES_WITH_LINE_COMMENTS.has(language)
    ? BLOCK_AND_LINE_COMMENTS
    : BLOCK_COMMENTS_ONLY;

  return [...css.matchAll(tokens)]
    .filter(([token]) => token.startsWith('/'))
    .map((match) => [match.index, match.index + match[0].length]);
}
