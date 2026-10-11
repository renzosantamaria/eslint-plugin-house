import { isDirective } from './directives.js';

const standsAlone = (comment, sourceCode) =>
  comment.type === 'Line' &&
  sourceCode.lines[comment.loc.start.line - 1]
    .slice(0, comment.loc.start.column)
    .trim() === '';

// ESLint hands over every `//` line as a comment of its own. A run of them on
// consecutive lines, with no code beside them, is one comment to a reader, so
// it comes back as one location. Tool directives are left out.
export function locateCommentBlocks(sourceCode) {
  const blocks = [];
  let run = null;

  for (const comment of sourceCode.getAllComments()) {
    if (isDirective(comment)) continue;

    const alone = standsAlone(comment, sourceCode);

    if (alone && run?.end.line === comment.loc.start.line - 1) {
      run.end = comment.loc.end;
      continue;
    }

    const block = { end: comment.loc.end, start: comment.loc.start };

    blocks.push(block);
    run = alone ? block : null;
  }

  return blocks;
}
