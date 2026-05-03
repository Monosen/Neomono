# Contributing to Neomono

Thanks for your interest in improving Neomono! This guide covers the minimum you need to get productive.

## Development

This project uses **pnpm** as its package manager (see `packageManager` in `package.json`).
If you don't have it installed: `npm install -g pnpm` or `corepack enable`.

```bash
git clone https://github.com/Monosen/Neomono.git
cd Neomono
pnpm install
```

### Run the extension locally

1. Open the repository in VS Code.
2. Press `F5` to launch an **Extension Development Host** with Neomono loaded.
3. Pick the theme: `Ctrl+K Ctrl+T` → **Neomono**.
4. Run `Developer: Inspect Editor Tokens and Scopes` to see how scopes map to colors.

### Validate everything

```bash
pnpm run validate
```

This runs the linter, theme validation (JSON / duplicate keys / hex colors),
i18n synchronization checks and command registration checks.

Individual scripts:

```bash
pnpm run lint
pnpm run validate:theme
pnpm run validate:i18n
pnpm run validate:commands
pnpm run validate:tokencolors
```

### Updating tokenColors

`tokenColors` are snapshot-tested under `themes/__snapshots__/`. If you
intentionally change a `scope`, `foreground`, or `fontStyle` in either theme,
update the snapshot:

```bash
pnpm run snapshot:tokencolors:update
```

Then commit the regenerated `.snap.json` files alongside the theme change.

If you ever want to add proper tokenization tests against a real grammar
(TypeScript, Python, ...), `vscode-tmgrammar-test` is already installed; place
fixtures under `tests/grammar/` and call `pnpm exec vscode-tmgrammar-test`.

### Run tests

```bash
pnpm test
```

Tests are precompiled with `tsc` automatically via the `pretest` script (so each
test file becomes its own `out/test/**/*.js`, which is what `vscode-test` expects).

### Build / bundle

The production bundle is produced by **esbuild** (single minified `out/extension.js`):

```bash
pnpm run build         # production bundle
pnpm run build:dev     # sourcemaps, no minify
pnpm run watch         # rebuild on change
pnpm run typecheck     # tsc --noEmit (no output, just types)
```

### Package a `.vsix`

```bash
pnpm run package
```

`vsce package` triggers `vscode:prepublish` (validate + esbuild bundle) and
runs with `--no-dependencies` because everything runtime-needed is already in
the bundle.

### Logs / debugging

Open the **Output** panel in VS Code (`View → Output`) and select **Neomono** in
the dropdown to see all `log.info` / `log.warn` / `log.error` from the extension.
Attach this when reporting bugs.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) in English or Spanish:

```
<type>(<scope>): <description>
```

Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`, `build`.

Examples:

- `feat(theme): add neon pink for JSX attributes`
- `fix(glow): prevent duplicate imports on enable`
- `docs(readme): clarify Custom CSS install steps`

## Updating colors

- Workbench colors live in `themes/Neomono-color-theme.json` → `colors`.
- Token colors live in the same file → `tokenColors`.
- Use the inspect-scopes command to identify the right TextMate scope before adding a new entry.

## Releasing (maintainers)

1. Bump `version` in `package.json` and update `CHANGELOG.md`.
2. Commit with `chore(release): vX.Y.Z`.
3. `git tag vX.Y.Z && git push --tags`.
4. GitHub Actions publishes the VSIX to the VS Code Marketplace (`VSCE_PAT`) and Open VSX (`OVSX_PAT`).
