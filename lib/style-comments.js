export const NO_STYLE_COMMENTS = 'No comments in stylesheets.';

const LANGUAGES_WITH_LINE_COMMENTS = new Set([
  'less',
  'sass',
  'scss',
  'styl',
  'stylus',
]);

const OPENERS = String.raw`\\|["']|url\((?!\s*["'])|\/\*`;

const BLOCK_COMMENTS_ONLY = new RegExp(OPENERS, 'gi');
const BLOCK_AND_LINE_COMMENTS = new RegExp(String.raw`${OPENERS}|\/\/`, 'gi');

function endOfLine(css, from) {
  const lineBreak = css.indexOf('\n', from);

  return lineBreak === -1 ? css.length : lineBreak;
}

function endOfBlockComment(css, from) {
  const close = css.indexOf('*/', from + 2);

  return close === -1 ? css.length : close + 2;
}

// Ends after `closer` or with the line, whichever comes first. A backslash
// takes the next character with it, a line break included.
function endOnLine(css, from, closer) {
  let at = from;

  while (at < css.length && css[at] !== '\n') {
    if (css[at] === closer) return at + 1;

    at += css[at] === '\\' ? 2 : 1;
  }

  return at;
}

const endOfString = (css, from) => endOnLine(css, from + 1, css[from]);

const END_OF = {
  '"': endOfString,
  "'": endOfString,
  '/*': endOfBlockComment,
  '//': endOfLine,
  '\\': (css, from) => from + 2,
  'url(': (css, from) => endOnLine(css, from, ')'),
};

// One pass, left to right: whatever opens first owns the text up to its end,
// so a `//` inside a string is text and a quote inside a comment opens nothing.
// A string or url( left open ends with its line and hides no more than that.
export function locateStyleComments(css, language) {
  const openers = LANGUAGES_WITH_LINE_COMMENTS.has(language)
    ? BLOCK_AND_LINE_COMMENTS
    : BLOCK_COMMENTS_ONLY;
  const comments = [];
  let at = 0;

  while (at < css.length) {
    openers.lastIndex = at;

    const opener = openers.exec(css);

    if (!opener) break;

    const from = opener.index;
    const token = opener[0].toLowerCase();

    at = END_OF[token](css, from);

    if (token.startsWith('/')) comments.push([from, at]);
  }

  return comments;
}
