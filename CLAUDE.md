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

- `lib/rules/` one file per rule; `lib/presets/` one file per preset;
  `lib/index.js` is the only entry point.
- `tests/` holds every test. Test files end in `.test.js`, which is what
  `node --test` picks up. Rules are tested with ESLint's `RuleTester`,
  presets by linting a folder under `tests/fixtures/`.
- No fixture may be named `*.test.*`, `test-*` or `test.*`: `node --test`
  would run it.
- Tests import ESLint from `tests/eslint.js`, never from `eslint`. That file
  picks the major from `ESLINT_MAJOR`; ESLint 9.39 is installed under the
  alias `eslint-9`.

## When a change touches a rule or preset

- Update its section in `README.md` in the same change.
- A new tool directive goes in `lib/directives.js`, with a row in
  `tests/directives.test.js` and a mention in the README list.
- Changing the supported ESLint range means running the tests on the new
  lowest version before stating it in `peerDependencies`.
