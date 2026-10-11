# eslint-plugin-house

House ESLint rules as one tested package, installed in other repositories
from GitHub by tag or commit. Plain ES modules: what is in `lib/` and `bin/`
is what a consumer runs.

## Working agreement

- **Two long-lived branches.** `develop` takes pull requests, `main` takes
  releases.
- **Every rule ships with a test.** The same goes for every preset and for
  the bin. Each option, branch and guard has a case that fails when it is
  removed; remove it once to see the case fail.
- **`npm run verify` before any pull request.** It lints, then runs the tests
  on ESLint 10 and on ESLint 9.39.
- **No build step or install scripts, ever.** No `prepare`, `install`,
  `preinstall`, `postinstall`, `prepack` or `build` script and no workspaces:
  with any of them npm prepares a git dependency by running `npm install`
  inside it. `tests/package.test.js` holds this.
- **Nothing private in a public repo.** Lint rules, tests and docs only. No
  project, client, product or person names, no local paths, nothing copied
  from application code. Examples use generic names.

## Where things are

- `lib/rules/` one file per rule; `lib/presets/` one file per preset, beside
  the `files.js` and `options.js` they share; `lib/index.js` is the only entry
  point. A module under `lib/` that no entry point reaches fails
  `tests/package.test.js`.
- `tests/` holds every test, in files that end in `.test.js`. Rules are tested
  with ESLint's `RuleTester`, presets by linting a folder under
  `tests/fixtures/`.
- `node --test` runs more than `*.test.js`: also `*-test.*`, `*_test.*`,
  `test-*`, `test.*` and every script in a folder named `test`. No fixture may
  have such a name; `tests/fixtures.test.js` holds this.
- Tests import ESLint from `tests/eslint.js`, never from `eslint`. That file
  picks the major from `ESLINT_MAJOR`; ESLint 9.39 is installed under the
  alias `eslint-9`.

## When a change touches a rule or preset

- Update its section in `README.md` in the same change.
- `tests/readme.test.js` lints a fixture with the README's example that merges
  the `time` selectors, and checks the peer ranges the README states. Keep that
  example a whole config file.
- A new tool directive goes in `lib/directives.js`, with a row in
  `tests/directives.test.js` and a mention in the README list.
- Changing the supported ESLint range means running the tests on the new
  lowest version before stating it in `peerDependencies`.
