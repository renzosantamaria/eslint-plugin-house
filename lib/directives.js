const IN_ANY_COMMENT = [
  '@ts-(?:check|expect-error|ignore|nocheck)',
  '@(?:jest|vitest)-environment(?:-options)?',
  '(?:c8|istanbul|v8) ignore',
  'eslint-disable-(?:next-)?line',
  'prettier-ignore',
  '@vite-ignore',
  '[@#]__PURE__',
  '@type',
];

const IN_BLOCK_COMMENT = [
  'eslint(?:-disable|-enable|-env)?',
  'exported',
  'globals?',
];

const IN_LINE_COMMENT = ['/\\s*<(?:amd-dependency|amd-module|reference)'];

const IN_HTML_COMMENT = [
  'eslint-(?:disable(?:-next-line|-line)?|enable)',
  'prettier-ignore(?:-attribute)?',
];

const startsWithOneOf = (directives) =>
  new RegExp(`^[\\s*]*(?:${directives.join('|')})(?![\\w-])`);

const BLOCK_DIRECTIVE = startsWithOneOf([
  ...IN_ANY_COMMENT,
  ...IN_BLOCK_COMMENT,
]);
const LINE_DIRECTIVE = startsWithOneOf([...IN_ANY_COMMENT, ...IN_LINE_COMMENT]);
const HTML_DIRECTIVE = startsWithOneOf(IN_HTML_COMMENT);

// ESLint reads `eslint`, `global` and `exported` only from block comments, so
// a line comment that opens with one of those words is prose.
export function isDirective(comment) {
  if (comment.type === 'Shebang') return true;

  const directive = comment.type === 'Block' ? BLOCK_DIRECTIVE : LINE_DIRECTIVE;

  return directive.test(comment.value);
}

export const isTemplateDirective = (comment) =>
  HTML_DIRECTIVE.test(comment.value);
