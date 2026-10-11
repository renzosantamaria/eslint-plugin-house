# eslint-plugin-house

House ESLint rules shared across my projects: comments, dates and module
boundaries. One tested package instead of a copy of each rule in every
repository.

It holds five rules, five presets that return flat-config blocks, and one
command for stylesheets that ESLint does not read. There is no build step:
what is in `lib/` and `bin/` is what runs.

- ESLint `^9.39.0 || ^10.9.0`, flat config. The test suite runs on 9.39.0 and
  on 10.12.0, and was run once on 10.9.0.
- `vue-eslint-parser` `^10.4.1` is an optional peer. Only the three Vue rules
  need it, so a project without Vue installs nothing extra.
- Developed and tested on Node 22.

## Install

The package is installed from GitHub, pinned to a tag or to a commit.

```bash
npm install --save-dev github:renzosantamaria/eslint-plugin-house#v1.0.0
npm install --save-dev github:renzosantamaria/eslint-plugin-house#<full commit sha>
```

npm resolves a tag to its commit and writes that commit into
`package-lock.json`. A git dependency has no integrity hash there, so the
pinned commit is the guarantee. The package has no install scripts, so npm
runs nothing when it installs it. Only `bin/`, `lib/`, `package.json` and this
file are installed.

## Use

Every preset is a function that returns an array of flat-config blocks. Spread
it into the config array, or into the arguments of a helper such as
`tseslint.config(...)` or `withNuxt(...)`.

```js
import { comments, pure, specs, time, vue } from 'eslint-plugin-house';

export default [
  ...comments(),
  ...specs(),
  ...vue(),
  ...time({ utils: ['src/utils/time.ts'] }),
  ...pure({
    folder: 'src/domain',
    banned: { imports: ['vue'], globals: ['window'] },
  }),
];
```

In a project with `.vue` files, `vue()` and `time()` count on the project's own
config to set the Vue parser and to register the `vue` plugin, as
`withNuxt(...)` and the flat configs of `eslint-plugin-vue` do. Where
`eslint-plugin-vue` is installed but not registered, pass `vue: false` to
`time()`.

The default export is the plugin itself, for wiring a rule by hand:

```js
import house from 'eslint-plugin-house';

export default [
  {
    files: ['app/components/**/*.vue'],
    plugins: { house },
    rules: { 'house/component-root-class': 'error' },
  },
];
```

## Rules

### Tool directives

A comment that a tool reads is not a comment to shorten or remove. The comment
rules leave these alone:

- ESLint: `eslint-disable`, `eslint-enable`, `eslint-disable-line`,
  `eslint-disable-next-line`, `eslint`, `eslint-env`, `global`, `globals` and
  `exported`. As in ESLint itself, only the two `-line` forms count in a `//`
  comment, so `// global state lives here` is prose.
- TypeScript: `@ts-check`, `@ts-nocheck`, `@ts-ignore`, `@ts-expect-error`,
  `/// <reference />`, `/// <amd-module />`, `/// <amd-dependency />`, and a
  `@type` annotation in a `/** */` block, the only place TypeScript reads it.
- Test runners: `@vitest-environment`, `@jest-environment` and their
  `-options` forms, as a `//` line or a docblock.
- Coverage: `v8 ignore`, `c8 ignore`, `istanbul ignore`.
- Others: `prettier-ignore`, `@vite-ignore`, `@__PURE__`, `#__PURE__` and the
  shebang line.
- In a Vue template: `<!-- eslint-disable -->` and its `-line`, `-next-line`
  and `eslint-enable` forms, `<!-- prettier-ignore -->`,
  `<!-- prettier-ignore-attribute -->`, and the four that `vue-tsc` reads:
  `<!-- @vue-expect-error -->`, `<!-- @vue-ignore -->`, `<!-- @vue-skip -->` and
  `<!-- @vue-generic -->`.

### `house/short-comments`

Caps the length of a comment. ESLint hands a rule every `//` line as a comment
of its own, so a rule that measures one comment at a time lets any run of `//`
lines through. This rule counts a run as one comment: consecutive lines that
hold nothing but a `//` comment. A blank line, a line of code or a directive
ends the run.

| Option | Default | Meaning                                         |
| ------ | ------- | ----------------------------------------------- |
| `max`  | `3`     | The most lines one comment may take. Minimum 1. |

```js
// Reported with the default: one comment of four lines.
// The total is rounded once, after the tax is added,
// because rounding each line first drifts by a cent
// on long orders.
const total = round(net + tax);
```

```js
rules: { 'house/short-comments': ['error', { max: 5 }] }
```

### `house/no-comments`

Reports every comment that is not a tool directive. A run of `//` lines is
reported once. Meant for spec files, where the name of the test is the
documentation. No options.

```js
// Reported: say it in the name of the test.
it('adds the tax after the discount', () => {});

// @ts-expect-error Not reported: TypeScript reads this one.
price('ten');
```

### `house/no-template-comments`

Reports HTML comments in a Vue single-file component: inside `<template>` and
between the blocks of the file, also when the component has no `<template>`.
Needs `vue-eslint-parser`; on any other file it does nothing. JavaScript
comments inside a template expression are not reported. No options.

```vue
<template>
  <!-- Reported: explain in the script block or with a better name. -->
  <p class="user-card">{{ name }}</p>
</template>
```

### `house/no-style-comments`

Reports every comment in the `<style>` blocks of a Vue single-file component:
`/* */` in any block, and `//` in a block whose `lang` is `scss`, `sass`,
`less`, `styl` or `stylus`. Text inside a string or an unquoted `url()` is not
a comment. Both end with their line at the latest, so one that is never closed
hides nothing below it. Where `//` opens a comment, an address on a line of its
own inside `url()` needs quotes. Needs `vue-eslint-parser`. No options.

```vue
<style scoped lang="scss">
.user-card {
  color: red; // Reported.
}
</style>
```

For stylesheets that are files of their own, see
[`house-stylesheets`](#house-stylesheets).

### `house/component-root-class`

The root element of a component carries the name of the component in
kebab-case, so a class in the browser says which file drew it:
`UserCard.vue` has a root with class `user-card`. Needs `vue-eslint-parser`.

The name is the file name up to its first dot, so `MapView.client.vue` is
`map-view`. A run of capitals is one word: `FAQList.vue` is `faq-list` and
`AButton.vue` is `a-button`.

The rule looks for the element the component actually draws. It looks past a
`<template>` wrapper and past a child component (any tag that starts with a
capital), up to five levels, to the first element inside. A named slot of a
child component, such as `<template #fallback>`, is passed over when the
component has other content. A `<slot />` draws no element, so it is no root
and a component that only hands on its slot is not reported. With several
roots, one of them carrying the name is enough. Only a static `class` counts.

| Option         | Default | Meaning                                                                                                                                         |
| -------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `drawsOwnRoot` | `[]`    | Names of components that draw an element of their own and put the class they are given on it. The rule stops at them instead of looking inside. |

```vue
<template>
  <NuxtLink class="user-card" to="/users">
    <span>Ada</span>
  </NuxtLink>
</template>
```

```js
rules: {
  'house/component-root-class': ['error', { drawsOwnRoot: ['NuxtLink', 'BaseButton'] }],
}
```

Without the option the rule looks inside `NuxtLink` and reports the `<span>`.
The message then says that it looked inside `<NuxtLink>` and names the option.

## Presets

### `comments(options)`

`house/short-comments` on every linted file. `options` goes to the rule.

```js
...comments(),
...comments({ max: 5 }),
```

### `specs({ files })`

`house/no-comments` on spec files.

| Option  | Default                                                         |
| ------- | --------------------------------------------------------------- |
| `files` | `['**/*.{spec,test,e2e-spec}.{js,mjs,cjs,jsx,ts,mts,cts,tsx}']` |

`files` is a list of at least one glob.

```js
...specs(),
...specs({ files: ['**/*.spec.ts', 'e2e/**/*.ts'] }),
```

### `vue()`

`house/no-template-comments` and `house/no-style-comments` on `**/*.vue`. It
takes no options and does not set the parser: the project's own config does
that.

```js
...vue(),
```

### `time({ utils, vue })`

A date is formatted in one place, where the time zone is explicit. This preset
bans `toLocaleString`, `toLocaleDateString`, `toLocaleTimeString` and
`Intl.DateTimeFormat`, with or without `new`, everywhere except the listed
utility files. It is built on ESLint's own `no-restricted-syntax`.

| Option  | Default                                  | Meaning                                                                                                           |
| ------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `utils` | required                                 | Globs of the files that may format dates. At least one.                                                           |
| `vue`   | whether `eslint-plugin-vue` is installed | `true` or `false`. `true` also sets `vue/no-restricted-syntax` on `**/*.vue`, which reaches template expressions. |

```js
...time({ utils: ['src/utils/time.ts'] }),
```

The selector cannot tell a date from a number, so `price.toLocaleString()` is
reported too. Use `Intl.NumberFormat` for numbers.

The `vue` block needs the `vue` plugin to be registered by the project's
config, as `@nuxt/eslint` and `eslint-plugin-vue`'s own configs do. Pass
`vue: false` if it is installed but not used.

In flat config the last block that sets a rule wins, so the preset and a
project's own `no-restricted-syntax` replace each other. A project with a list
of its own keeps the preset first, for the block that covers templates, and
sets the core rule after it: its own list in every file, both lists outside the
utility files.

```js
import { time, timeSelectors } from 'eslint-plugin-house';

const utils = ['src/utils/time.ts'];
const own = [{ selector: 'ForInStatement', message: 'No for...in.' }];

export default [
  ...time({ utils }),
  { rules: { 'no-restricted-syntax': ['error', ...own] } },
  {
    ignores: utils,
    rules: { 'no-restricted-syntax': ['error', ...own, ...timeSelectors] },
  },
];
```

A project that also sets `vue/no-restricted-syntax` merges that list the same
way, in a block for `**/*.vue`.

### `pure({ folder, banned })`

Keeps a folder free of frameworks and of the rest of the project, so what is
in it can be tested without either. It is built on ESLint's own
`no-restricted-imports` and `no-restricted-globals`.

| Option           | Default  | Meaning                                                                                          |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `folder`         | required | The folder, as a plain path with forward slashes. Script files in it, at any depth, are covered. |
| `banned.imports` | `[]`     | Modules the folder may not import, as gitignore-style patterns: `'vue'`, `'@nestjs/*'`, `'~/*'`. |
| `banned.globals` | `[]`     | Globals the folder may not touch: `'window'`, `'process'`.                                       |

```js
...pure({
  folder: 'src/domain',
  banned: { imports: ['vue', '@nestjs/*'], globals: ['window', 'process'] },
}),
```

`folder` is relative to ESLint's base path: the folder of the config file, or
the working directory when ESLint is started with `--config`. An absolute path,
a backslash or a `..` is refused. A folder that matches no file cannot be told
from a clean one, so a misspelt name is not detected.

In `banned.imports` a plain name such as `'vue'` bans the module and what is
under it, `vue/server-renderer`, and not a file of the folder's own that is
imported as `./vue`. A pattern with a wildcard and no slash, such as `'*.vue'`,
matches at any depth. `node:events` is a name of its own, to list beside
`events`.

Whatever is banned, a relative import that leaves the folder is reported:

```js
// src/domain/tax/vat.js
import { round } from '../money.js';
import { client } from '../../http/client.js'; // Reported: outside src/domain.
```

- The core rule reads `import` and `export ... from` statements. It does not
  read `require()` or `import()` calls.
- An import through an alias (`~/`, `@/`) leaves the folder unseen. List the
  alias in `banned.imports`.
- Where functions are imported automatically, as in Nuxt, the framework and the
  project's own composables are globals with no import statement. List them in
  `banned.globals`.
- Only the `../` that a path opens with are counted. A path that steps into a
  folder and then climbs twice, `./tax/../../http/client.js`, is reported
  whether it leaves or not, and so is one that leaves and comes back by name,
  `../../domain/money.js`.
- A file more than four folders below `folder` is held to the rule of the
  fourth: an import that climbs five levels or more is reported, also when it
  stays inside. The message says so.
- The preset sets `no-restricted-imports` for the folder, and
  `no-restricted-globals` when a global is banned. The last block that sets a
  rule wins: the preset replaces what an earlier block set for these files, and
  a later block replaces the preset. A project with entries of its own for
  these rules repeats them in `banned.imports` and `banned.globals`.

## `house-stylesheets`

ESLint does not read `.scss` and `.css` files, so comments in them get a
command of their own. It searches the given files and folders, lists every
comment, and fails when it finds one.

```bash
npx house-stylesheets app/assets
```

```
app/assets/main.scss:12:3: No comments in stylesheets.
```

| Exit code | Meaning                                                                |
| --------- | ---------------------------------------------------------------------- |
| `0`       | No comments in the stylesheets that were read.                         |
| `1`       | At least one comment.                                                  |
| `2`       | No path was given, a path does not exist, or a file could not be read. |

Only `.css` and `.scss` files are read. Any other file is passed over, also
when it is named on the command line. `//` counts in `.scss` and not in `.css`.
`node_modules`, folders whose name starts with a dot and symbolic links inside
a folder are skipped; a link named on the command line is followed. A string or
a `url(` that is never closed ends with its line, as in
[`house/no-style-comments`](#houseno-style-comments).

## Adopting a rule over a backlog

A rule that fails on hundreds of existing lines can still hold for new code.
ESLint's bulk suppressions record today's violations in
`eslint-suppressions.json`, per file and per rule, and stop reporting them.

Record the violations of one rule, or of every rule set to `error`:

```bash
npx eslint . --suppress-rule house/short-comments
npx eslint . --suppress-all
```

Commit `eslint-suppressions.json`. From then on a plain `npx eslint .` passes
as long as no file has more violations of a rule than were recorded. One new
violation in a recorded file brings back every violation of that rule in that
file.

When recorded violations are fixed, ESLint exits with code 2 and asks for the
file to be pruned, so the count cannot be used up again:

```bash
npx eslint . --prune-suppressions
```

`--pass-on-unpruned-suppressions` turns that exit into a pass. Two limits: the
count is per file, so a suppressed file can swap one violation for another
unseen, and renaming a file brings its violations back.

## Development

```bash
npm ci
npm run verify
```

`verify` lints the package with its own rules and with Prettier, then runs the
tests twice: on ESLint 10 and on ESLint 9.39. `npm run format` rewrites the
files Prettier complains about. See `CLAUDE.md` for the working
agreement.
