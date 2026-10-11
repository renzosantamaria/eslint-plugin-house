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
