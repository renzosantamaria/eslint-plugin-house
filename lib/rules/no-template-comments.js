import { isTemplateDirective } from '../directives.js';

export const noTemplateComments = {
  create(context) {
    const fragment = context.sourceCode.parserServices.getDocumentFragment?.();

    if (!fragment) return {};

    return {
      Program() {
        for (const comment of fragment.comments) {
          if (comment.type !== 'HTMLComment') continue;
          if (isTemplateDirective(comment)) continue;

          context.report({ loc: comment.loc, messageId: 'comment' });
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'Allow no HTML comments in a Vue single-file component except tool directives.',
    },
    messages: {
      comment:
        'No HTML comments in a component; explain in <script setup> or with a better name.',
    },
    schema: [],
    type: 'suggestion',
  },
};
