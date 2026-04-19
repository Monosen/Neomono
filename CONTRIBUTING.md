# Contributing to Neomono

Thanks for your interest in improving Neomono! This guide covers the minimum you need to get productive.

## Development

```bash
git clone https://github.com/Monosen/Neomono.git
cd Neomono
npm install
```

### Run the extension locally

1. Open the repository in VS Code.
2. Press `F5` to launch an **Extension Development Host** with Neomono loaded.
3. Pick the theme: `Ctrl+K Ctrl+T` → **Neomono**.
4. Run `Developer: Inspect Editor Tokens and Scopes` to see how scopes map to colors.

### Validate the theme

```bash
npm run validate:theme
```

This checks that the theme parses as JSON, has no duplicate keys, and every color is a valid hex value.

### Package a `.vsix`

```bash
npm run package
```

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
