import { basename } from 'node:path';

import { readStaticAttribute } from '../vue-attributes.js';

const kebab = (name) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const elementChildren = (element) =>
  element.children.filter((child) => child.type === 'VElement');

const staticClasses = (element) =>
  readStaticAttribute(element, 'class')?.split(/\s+/).filter(Boolean) ?? [];

// Every component's root carries its own name in kebab-case, so a class in the
// browser says which file drew it and BEM has one block per component.
export const componentRootClass = {
  create(context) {
    const { templateBody } = context.sourceCode.ast;

    if (!templateBody) return {};

    const drawsOwnRoot = new Set(context.options[0].drawsOwnRoot);

    // Neither draws anything of its own: <template> only groups, and a child
    // component's root belongs to that component. <component :is> is absent
    // on purpose — it renders whatever it is told to.
    const isComponent = (element) =>
      !drawsOwnRoot.has(element.rawName) &&
      (/^[A-Z]/.test(element.rawName) || element.rawName === 'template');

    // The outermost element this component actually renders, looking past
    // wrappers that render nothing themselves.
    function drawnRoot(element, depth = 0) {
      if (depth > 4 || !isComponent(element)) return element;

      const [first] = elementChildren(element);

      return first ? drawnRoot(first, depth + 1) : element;
    }

    return {
      'Program:exit'() {
        const component = basename(context.filename, '.vue');
        const expected = kebab(component);
        const roots = elementChildren(templateBody).map((root) =>
          drawnRoot(root),
        );

        if (roots.length === 0) return;
        if (roots.some((root) => staticClasses(root).includes(expected)))
          return;

        const present = staticClasses(roots[0]);

        context.report({
          data: {
            component,
            expected,
            found: present.length ? ` — it has "${present.join(' ')}"` : '',
          },
          messageId: 'missing',
          node: roots[0].startTag,
        });
      },
    };
  },
  meta: {
    defaultOptions: [{ drawsOwnRoot: [] }],
    docs: { description: "Root element carries the component's own name." },
    messages: {
      missing:
        'The root element of {{component}} should carry class "{{expected}}"{{found}}.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          drawsOwnRoot: { items: { type: 'string' }, type: 'array' },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
};
