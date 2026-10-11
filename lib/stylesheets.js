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

function locatePosition(text, index) {
  const linesBefore = text.slice(0, index).split('\n');

  return { column: linesBefore.at(-1).length + 1, line: linesBefore.length };
}

function locateCommentsIn(file) {
  const css = readFileSync(file, 'utf8');
  const language = extname(file).slice(1);

  return locateStyleComments(css, language).map(([from]) => ({
    file,
    ...locatePosition(css, from),
  }));
}

export function locateStylesheetComments(paths) {
  return paths
    .flatMap((path) =>
      statSync(path).isDirectory() ? listFiles(path) : [path],
    )
    .filter(isStylesheet)
    .flatMap(locateCommentsIn);
}
