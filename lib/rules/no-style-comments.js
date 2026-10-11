import { locateStyleComments, NO_STYLE_COMMENTS } from '../style-comments.js';
import { readStaticAttribute } from '../vue-attributes.js';

const isClosedStyleBlock = (node) => node.name === 'style' && node.endTag;

export const noStyleComments = {
  create(context) {
    const { sourceCode } = context;
    const fragment = sourceCode.parserServices.getDocumentFragment?.();

    if (!fragment) return {};

    return {
      Program() {
        for (const block of fragment.children.filter(isClosedStyleBlock)) {
          const start = block.startTag.range[1];
          const css = sourceCode.text.slice(start, block.endTag.range[0]);
          const language = readStaticAttribute(block, 'lang');

          for (const [from, to] of locateStyleComments(css, language)) {
            context.report({
              loc: {
                end: sourceCode.getLocFromIndex(start + to),
                start: sourceCode.getLocFromIndex(start + from),
              },
              messageId: 'comment',
            });
          }
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'Allow no comments in the <style> blocks of a Vue single-file component.',
    },
    messages: { comment: NO_STYLE_COMMENTS },
    schema: [],
    type: 'suggestion',
  },
};
