import { locateCommentBlocks } from '../comment-blocks.js';

export const noComments = {
  create(context) {
    return {
      Program() {
        for (const loc of locateCommentBlocks(context.sourceCode)) {
          context.report({ loc, messageId: 'comment' });
        }
      },
    };
  },
  meta: {
    docs: { description: 'Allow no comments except tool directives.' },
    messages: {
      comment:
        'No comments in this file; say it in the name of the test or the variable.',
    },
    schema: [],
    type: 'suggestion',
  },
};
