import { describe, it } from 'node:test';

const PACKAGES = { 9: 'eslint-9', 10: 'eslint' };

export const major = process.env.ESLINT_MAJOR || '10';

if (!Object.hasOwn(PACKAGES, major)) {
  throw new Error(
    `ESLINT_MAJOR must be one of ${Object.keys(PACKAGES).join(', ')}; got "${major}".`,
  );
}

export const { ESLint, Linter, RuleTester } = await import(PACKAGES[major]);

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
