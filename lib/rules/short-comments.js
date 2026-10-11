import { locateCommentBlocks } from '../comment-blocks.js';

export const shortComments = {
  create(context) {
    const [{ max }] = context.options;

    return {
      Program() {
        for (const loc of locateCommentBlocks(context.sourceCode)) {
          const lines = loc.end.line - loc.start.line + 1;

          if (lines > max) {
            context.report({
              data: { lines, max },
              loc,
              messageId: 'tooLong',
            });
          }
        }
      },
    };
  },
  meta: {
    defaultOptions: [{ max: 3 }],
    docs: {
      description:
        'Keep a comment to a few lines, counting a run of `//` lines as one comment.',
    },
    messages: {
      tooLong:
        'Comment is {{lines}} lines; the limit is {{max}}. Say it in a better name, or put the reasoning in the commit message.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: { max: { minimum: 1, type: 'integer' } },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
};
