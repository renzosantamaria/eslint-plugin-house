import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import vueParser from 'vue-eslint-parser';

import { ESLint } from '../eslint.js';

export const parseVue = {
  files: ['**/*.vue'],
  languageOptions: { parser: vueParser },
};

const locateFixture = (name) =>
  fileURLToPath(new URL(`../fixtures/${name}/`, import.meta.url));

export const loadEslintFor = (fixture, config) =>
  new ESLint({
    cwd: locateFixture(fixture),
    overrideConfig: config,
    overrideConfigFile: true,
  });

export async function lintFixture(fixture, config) {
  const results = await loadEslintFor(fixture, config).lintFiles(['.']);

  return results
    .flatMap(({ filePath, messages }) =>
      messages.map(({ line, message, ruleId }) => ({
        message,
        where: `${relative(locateFixture(fixture), filePath)}:${line} ${ruleId}`,
      })),
    )
    .sort((a, b) => (a.where < b.where ? -1 : 1));
}

export const reportsIn = async (fixture, config) =>
  (await lintFixture(fixture, config)).map(({ where }) => where);
