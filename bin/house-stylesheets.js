#!/usr/bin/env node
import { existsSync } from 'node:fs';

import { NO_STYLE_COMMENTS } from '../lib/style-comments.js';
import { locateStylesheetComments } from '../lib/stylesheets.js';

const paths = process.argv.slice(2);
const missing = paths.filter((path) => !existsSync(path));

if (paths.length === 0) {
  console.error('Usage: house-stylesheets <file or folder>...');
  process.exit(2);
}

if (missing.length > 0) {
  console.error(`house-stylesheets: no such path: ${missing.join(', ')}`);
  process.exit(2);
}

const comments = locateStylesheetComments(paths);

for (const { column, file, line } of comments) {
  console.log(`${file}:${line}:${column}: ${NO_STYLE_COMMENTS}`);
}

process.exitCode = comments.length > 0 ? 1 : 0;
