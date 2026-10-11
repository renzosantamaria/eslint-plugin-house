#!/usr/bin/env node
import { existsSync } from 'node:fs';

import { NO_STYLE_COMMENTS } from '../lib/style-comments.js';
import { locateStylesheetComments } from '../lib/stylesheets.js';

const paths = process.argv.slice(2);
const missing = paths.filter((path) => !existsSync(path));

function refuse(message) {
  console.error(message);
  process.exit(2);
}

function locateComments() {
  try {
    return locateStylesheetComments(paths);
  } catch (error) {
    return refuse(`house-stylesheets: ${error.message}`);
  }
}

if (paths.length === 0) refuse('Usage: house-stylesheets <file or folder>...');

if (missing.length > 0) {
  refuse(`house-stylesheets: no such path: ${missing.join(', ')}`);
}

const comments = locateComments();

for (const { column, file, line } of comments) {
  console.log(`${file}:${line}:${column}: ${NO_STYLE_COMMENTS}`);
}

process.exitCode = comments.length > 0 ? 1 : 0;
