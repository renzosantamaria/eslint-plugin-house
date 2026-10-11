import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

import { locateStyleComments } from './style-comments.js';

const STYLESHEET_EXTENSIONS = new Set(['.css', '.scss']);

const isStylesheet = (path) => STYLESHEET_EXTENSIONS.has(extname(path));

const isSkippedFolder = (name) =>
  name === 'node_modules' || name.startsWith('.');

function listFiles(folder) {
  return readdirSync(folder, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : 1))
    .flatMap((entry) => {
      const path = join(folder, entry.name);

      if (entry.isDirectory()) {
        return isSkippedFolder(entry.name) ? [] : listFiles(path);
      }

      return entry.isFile() ? [path] : [];
    });
}

const LINE_BREAK = /\n/g;

// Comments come in order, so the line count only ever moves forward.
function locateCommentsIn(file) {
  const css = readFileSync(file, 'utf8');
  const language = extname(file).slice(1);
  const lineStarts = [
    0,
    ...Array.from(css.matchAll(LINE_BREAK), ({ index }) => index + 1),
  ];
  let line = 0;

  return locateStyleComments(css, language).map(([from]) => {
    while (lineStarts[line + 1] <= from) line += 1;

    return { column: from - lineStarts[line] + 1, file, line: line + 1 };
  });
}

export function locateStylesheetComments(paths) {
  return paths
    .flatMap((path) =>
      statSync(path).isDirectory() ? listFiles(path) : [path],
    )
    .filter(isStylesheet)
    .flatMap(locateCommentsIn);
}
