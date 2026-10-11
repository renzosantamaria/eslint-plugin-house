import assert from 'node:assert/strict';
import { test } from 'node:test';

import { locateStyleComments } from '../lib/style-comments.js';

const commentsIn = (css, language) =>
  locateStyleComments(css, language).map(([from, to]) => css.slice(from, to));

test('a block comment is found in plain CSS', () => {
  assert.deepEqual(commentsIn('a { color: red; } /* brand */ b {}', 'css'), [
    '/* brand */',
  ]);
});

test('a block comment of several lines is found whole', () => {
  assert.deepEqual(commentsIn('/* one\n   two */\na {}', 'css'), [
    '/* one\n   two */',
  ]);
});

test('a block comment that is never closed runs to the end', () => {
  assert.deepEqual(commentsIn('a {}\n/* one\nb {}', 'css'), ['/* one\nb {}']);
});

test('the slash that opens a block comment does not close it', () => {
  assert.deepEqual(commentsIn('/*/ a */ b {}', 'css'), ['/*/ a */']);
});

test('every comment is found, in order', () => {
  assert.deepEqual(locateStyleComments('/* a */ b {} // c\n/* d */', 'scss'), [
    [0, 7],
    [13, 17],
    [18, 25],
  ]);
});

for (const language of ['less', 'sass', 'scss', 'styl', 'stylus']) {
  test(`a // line is a comment in ${language}`, () => {
    assert.deepEqual(commentsIn('a { color: red; } // brand\nb {}', language), [
      '// brand',
    ]);
  });
}

for (const language of ['css', 'postcss']) {
  test(`a // line is not a comment in ${language}`, () => {
    assert.deepEqual(
      commentsIn('a { color: red; } // brand\nb {}', language),
      [],
    );
  });
}

test('comment markers inside a double-quoted string are text', () => {
  assert.deepEqual(
    commentsIn('a::after { content: "/* x */ // y"; }', 'scss'),
    [],
  );
});

test('comment markers inside a single-quoted string are text', () => {
  assert.deepEqual(
    commentsIn("a::after { content: '/* x */ // y'; }", 'scss'),
    [],
  );
});

test('an escaped quote does not end the string', () => {
  assert.deepEqual(
    commentsIn('a::after { content: "\\" /* x */"; }', 'scss'),
    [],
  );
});

test('a comment after a string is found', () => {
  assert.deepEqual(commentsIn('a::after { content: "x"; } /* y */', 'css'), [
    '/* y */',
  ]);
});

test('an apostrophe inside a comment does not open a string', () => {
  assert.deepEqual(commentsIn("/* don't */ a {} /* stop */", 'css'), [
    "/* don't */",
    '/* stop */',
  ]);
});

test('the slashes of an address in an unquoted url() are text', () => {
  assert.deepEqual(
    commentsIn(
      'a { background: url(https://example.com/a.png); } // b',
      'scss',
    ),
    ['// b'],
  );
});

test('the slashes of an address in an upper-case URL() are text', () => {
  assert.deepEqual(
    commentsIn('a { background: URL(//example.com/a.png); }', 'scss'),
    [],
  );
});

test('a quoted url() is read as a string', () => {
  assert.deepEqual(
    commentsIn('a { background: url("a)//b.png"); } // c', 'scss'),
    ['// c'],
  );
});

test('a quoted url() after a blank is read as a string', () => {
  assert.deepEqual(
    commentsIn('a { background: url( "a)//b.png" ); } // c', 'scss'),
    ['// c'],
  );
});

test('a block comment marker inside an upper-case URL() is text in plain CSS', () => {
  assert.deepEqual(commentsIn('a { background: URL(/*x*/); }', 'css'), []);
});

test('an escaped quote does not end a single-quoted string', () => {
  assert.deepEqual(
    commentsIn("a::after { content: '\\' /* x */'; }", 'scss'),
    [],
  );
});

test('an escaped quote outside a string opens none', () => {
  assert.deepEqual(
    commentsIn(
      ".it\\'s { color: red; } /* a */ b::after { content: 'x'; }",
      'css',
    ),
    ['/* a */'],
  );
});

test('a string ends with its line, so a stray apostrophe hides nothing below it', () => {
  const css = [
    ".a { color: red; } // don't",
    '/* one */',
    ".b::after { content: 'x'; }",
    '/* two */',
  ].join('\n');

  assert.deepEqual(commentsIn(css, 'css'), ['/* one */', '/* two */']);
});

test('a backslash at the end of a line carries the string onto the next', () => {
  assert.deepEqual(
    commentsIn('a::after { content: "one \\\n/* two */"; }', 'css'),
    [],
  );
});

test('a quote that is never closed ends with the stylesheet', () => {
  assert.deepEqual(commentsIn('/* a */ b::after { content: "x', 'css'), [
    '/* a */',
  ]);
});

test('a url( that is never closed hides no more than its line', () => {
  const css = [
    'a { background: url(//a.png; }',
    '/* one */',
    'b { color: rgb(0, 0, 0); }',
  ].join('\n');

  assert.deepEqual(commentsIn(css, 'scss'), ['/* one */']);
});

test('an address without quotes on a line of its own inside url() is taken for a comment', () => {
  assert.deepEqual(
    commentsIn('a { background: url(\n  //example.com/a.png\n); }', 'scss'),
    ['//example.com/a.png'],
  );
});

for (const [what, opened] of [
  ['url( that are never closed', 'url('.repeat(20_000)],
  [
    'escaped quotes in a string that is never closed',
    `"${'\\"'.repeat(60_000)}`,
  ],
]) {
  test(`thousands of ${what} are read in one pass`, () => {
    const started = Date.now();

    assert.deepEqual(commentsIn(`${opened}\n/* a */`, 'scss'), ['/* a */']);
    assert.ok(Date.now() - started < 2000);
  });
}

test('a string of nine million characters is read to its end', () => {
  const css = `a::after { content: "${'x'.repeat(9_000_000)}"; } /* a */`;

  assert.deepEqual(commentsIn(css, 'css'), ['/* a */']);
});
