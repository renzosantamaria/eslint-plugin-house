import { basename } from 'node:path';

import { readStaticAttribute } from '../vue-attributes.js';

const kebab = (name) =>
  name
    .replace(/([a-z0-9])(?=[A-Z])|([A-Z])(?=[A-Z][a-z])/g, '$1$2-')
    .toLowerCase();

const elementChildren = (element) =>
  element.children.filter((child) => child.type === 'VElement');

const isNamedSlot = (element) =>
  element.startTag.attributes.some(
    ({ key }) =>
      key.name.name === 'slot' &&
      key.argument &&
      key.argument.name !== 'default',
  );

const staticClasses = (element) =>
  readStaticAttribute(element, 'class')?.split(/\s+/).filter(Boolean) ?? [];

const childComponent = (element) =>
  element.rawName === 'template' ? null : element.rawName;

const MISSING =
  'The root element of {{component}} should carry class "{{expected}}"{{found}}.';

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
    // wrappers that render nothing themselves and past the named slots of a
    // child component. `through` is the first child component looked past.
    function drawnRoot(element, through = null, depth = 0) {
      if (depth > 4 || !isComponent(element)) return { element, through };

      const children = elementChildren(element);
      const first =
        children.find((child) => !isNamedSlot(child)) ?? children[0];

      return first
        ? drawnRoot(first, through ?? childComponent(element), depth + 1)
        : { element, through };
    }

    return {
      'Program:exit'() {
        const [component] = basename(context.filename).split('.');
        const expected = kebab(component);
        const roots = elementChildren(templateBody)
          .map((root) => drawnRoot(root))
          .filter(({ element }) => element.rawName !== 'slot');

        if (roots.length === 0) return;
        if (
          roots.some(({ element }) => staticClasses(element).includes(expected))
        )
          return;

        const [{ element, through }] = roots;
        const present = staticClasses(element);

        context.report({
          data: {
            component,
            expected,
            found: present.length ? ` — it has "${present.join(' ')}"` : '',
            through,
          },
          messageId: through ? 'missingInside' : 'missing',
          node: element.startTag,
        });
      },
    };
  },
  meta: {
    defaultOptions: [{ drawsOwnRoot: [] }],
    docs: { description: "Root element carries the component's own name." },
    messages: {
      missing: MISSING,
      missingInside: `${MISSING} It was looked for inside <{{through}}>; if <{{through}}> draws an element of its own, list it in drawsOwnRoot.`,
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
