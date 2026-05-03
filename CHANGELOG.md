# Change Log

All notable changes to the "neomono" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added

#### Theme

- **Coverage expanded from 163 to 399 workbench colors** (~145% increase, bringing parity with Dracula/Dark+ Pro).
- **Integrated terminal**: background, foreground, selection, cursor, 16 ANSI colors (normal + bright) mapped to the Neomono palette.
- **Editor line numbers**: `editorLineNumber.foreground`, `activeForeground`, `dimmedForeground`.
- **Bracket pair colorization**: 6 rainbow colors for `editorBracketHighlight` and `editorBracketPairGuide` (normal + active), plus unexpected bracket foreground.
- **Minimap**: background, slider, gutter (added/modified/deleted), match highlights.
- **Diff editor**: inserted/removed text and line backgrounds, unchanged regions, gutter and overview colors.
- **Merge conflicts**: current/incoming/common headers and content, overview ruler indicators.
- **Peek view**: border, editor match highlight, result list, title bar.
- **Breadcrumbs**: background, foreground, focus, active selection, picker.
- **Sticky scroll**: background, hover, border, shadow.
- **Inlay hints and ghost text** (type hints, Copilot/Cursor suggestions): foreground, type, parameter variants.
- **Inline chat (AI)**: background, border, shadow, input styles, diff colors for accepted/rejected changes.
- **Command Center** (title bar search): full styling including active and inactive states.
- **Testing**: icon states, message decorations, peek border, covered/uncovered gutter highlights.
- **Settings editor**: headers, inputs, dropdowns, checkboxes, focus row, modified indicator.
- **Extensions view**: button variants, remote badges, star/verified/preRelease/sponsor icons.
- **Debug icons** (full): breakpoints (5 variants), start/pause/stop/disconnect/restart/step/continue.
- **Debug token expressions**: name, value, string, boolean, number, error.
- **Debug view and stack frame**: state labels, value changed highlight, exception widget.
- **Chat** (extended): slash commands, avatars, edited file indicator.
- **Banners, dropdowns, CodeLens, LightBulb, fold, comment gutter**: assorted foreground/background tokens for better ergonomics.
- **Advanced testing/debug colors**: ~20 new keys added to both Neomono and Neomono Deep themes (retired icons, coverage badges, minimap coverage, inline values, exception labels, etc.).

#### Glow (Neon Dreams)

- **Self-contained**: no longer depends on the Custom CSS and JS Loader extension. Patching is done directly into VS Code's `workbench.html` (similar to Synthwave '84).
- **Automatic checksum fixing**: after modifying VS Code core files, checksums in `product.json` are recalculated automatically to suppress the "corrupt installation" warning.
- **Real brightness control**: `neomono.neonDreams.brightness` (0.0–1.0) is converted to a 2-digit hex alpha and injected into glow `text-shadow` colors at build time.
- **Live brightness updates**: when `neomono.neonDreams.brightness` or `.glow` change in settings, the glow JS is regenerated automatically (debounced 250ms) and a "Reload Window" notification appears — no need to re-run `Enable Neon Dreams`.
- **Glow disable without losing chrome**: `neomono.neonDreams.glow` lets you disable the text-shadow effect while keeping editor chrome updates.
- **New command** `Neomono: Toggle Neon Dreams`.
- **Custom CSS Loader migration cleanup**: old `vscode_custom_css.imports` entries are automatically removed when migrating from the previous method.

#### Reactor Glow

- **Reactor Glow**: reactive UI that changes colors based on active-file diagnostics and debug state (priority: debug > error > warning > normal). Configurable intensity and per-element targeting (status bar, activity bar, title bar, panel title, editor diagnostics, tab border, editor background tint).
- **`neomono.resetReactorCustomizations` command** — removes every Reactor-managed key from the user's `workbench.colorCustomizations` (including the scoped `[Neomono]` and `[Neomono Deep]` maps). Useful when uninstalling or starting from a clean slate.
- **3 lifecycle commands**: `Enable Reactor Glow`, `Disable Reactor Glow`, `Toggle Reactor Glow`.
- **7 settings**: `enabled`, `intensity`, `affectStatusBar`, `affectActivityBar`, `affectTitleBar`, `affectPanelTitle`, `affectEditorDiagnostics`, `affectEditorBackground`, `affectTabBorder`.
- **`activationEvents: ["onStartupFinished"]`** so Reactor Glow actually starts when VS Code opens, not only when a Neomono command is run.

#### Build & DX

- **Internationalization (i18n)** for command titles, settings descriptions, and runtime messages via `package.nls.json` and `vscode.l10n` bundles (English / Spanish).
- `npm run validate:theme` script that checks JSON, duplicate keys, and hex colors.
- **`pretest` script** that compiles TypeScript before running `vscode-test`.
- **`validate` umbrella script** that runs lint + theme + i18n + commands validation in one shot.
- **`packageManager` field** pinning pnpm 9 (with `.npmrc` storing `store-dir=./.pnpm-store`).
- **esbuild bundling**: production build now bundles `src/extension.ts` and all internal dependencies into a single minified `out/extension.js` (~17 KB). The published VSIX no longer ships unbundled `.js` files or `node_modules/` (`vsce package --no-dependencies`). Activation is a single `require`, ~50–70% smaller VSIX, faster cold start.
- **`scripts/build.js`** wraps esbuild and supports `--dev` (sourcemaps, no minify) and `--watch`. New scripts: `pnpm build`, `pnpm build:dev`, `pnpm watch`, `pnpm typecheck`, `pnpm clean`. `tsc` is still used for tests (`pretest: compile`) and as a type-only check in CI.
- **Dependabot** (`.github/dependabot.yml`) opens weekly PRs grouped by area (`eslint`, `@types/*`, `@vscode/*`) for npm and GitHub Actions deps. Zero recurring maintenance.
- **Release notes auto-generated from `CHANGELOG.md`**: `scripts/extract-changelog.js` extracts a single section by header (`Unreleased` or a tagged version) and the `release.yml` workflow uses it as the GitHub Release body, with VS Code commit-based notes appended underneath.
- **Reactor Glow is now opt-in**. `neomono.reactor.enabled` defaults to `false`. The first time the user opens VS Code with a Neomono theme active, a one-shot notification asks "Enable Reactor Glow?" (state persisted in `globalState`). This matches Synthwave/Dracula's recommendation of never modifying user settings on install without consent.
- **Unified logger** (`src/logger.ts`): all `console.warn` / `console.error` calls in `glow.ts` and `reactor.ts` now go through `log.info` / `log.warn` / `log.error`, which write to a dedicated VS Code OutputChannel called **Neomono**. Users can open it from the Output panel and copy/paste it into bug reports. Channel is created lazily and disposed in `deactivate()`.
- **Unit tests for `generateGlowJs`** covering brightness clamping (`-1`, `0`, `0.5`, `1`, `99`), `DISABLE_GLOW` flag, IIFE shape, full Neomono / Neomono Deep token coverage, and `MARKER_REGEX` non-greediness across multiple patches.
- **Shared test helpers** (`src/test/suite/_helpers.ts`) — replaces the duplicated `findProjectRoot` previously copied into every test file.
- GitHub Actions workflows for CI (validate + package `.vsix`) and Release (publish to VS Code Marketplace and Open VSX on tag `v*`).
- `CONTRIBUTING.md`, issue templates (bug, theme request) and pull request template.
- `license`, `homepage`, `bugs`, `keywords`, and `engines.node` fields in `package.json`.
- **Security & internals section** added to `README.md` / `README.es.md` documenting exactly which files Neon Dreams modifies and how to undo them by hand.

### Changed

#### Build & DX

- **CI/Release workflows migrated from npm to pnpm** with `pnpm/action-setup@v4`, `cache: pnpm`, and `--frozen-lockfile` for deterministic builds. Tests now run under `xvfb-run` so `vscode-test` works in headless GitHub Actions runners.
- **CI now runs the full lint/tsc/test loop on a Node matrix `[18, 20, 22]`**; theme/i18n/commands validation and `.vsix` packaging run once on Node 20.
- **`engines.vscode` lowered to `^1.85.0`** (and `@types/vscode` aligned) to widen the supported VS Code range; no APIs newer than 1.85 are used.
- **Aligned dev dependency versions**: `@types/node` to `^20.17.0` (matches CI Node 20) and `typescript` to `^5.7.2` (stable, broader plugin support).
- **Real ESLint coverage for TypeScript**: added `typescript-eslint`, rewrote `eslint.config.js` with separate flat-config blocks for `scripts/*.js` (CommonJS) and `src/**/*.ts` (typescript-eslint recommended), and tightened the `lint` script with `--max-warnings 0` so warnings can no longer slip into `master` unnoticed. Previously ESLint was silently ignoring `src/**/*.ts`.
- **Glow runtime extracted from a string-builder into a real template**: `src/templates/glow-runtime.js` is plain ES2015 JavaScript, copied verbatim to `out/templates/` at compile time by `scripts/copy-templates.js`, and parameterised through two named placeholders (`__TOKEN_REPLACEMENTS_JSON__`, `__DISABLE_GLOW__`). `generateGlowJs` now reads the file once (cached) and substitutes the placeholders with `replaceAll`. No more 80 lines of hand-escaped JS source built with `'\\t'` concatenation.
- **Double-injection guard** on `window.__neomonoGlowInstalled__` so the runtime never patches the DOM twice if VS Code re-renders its workbench.
- **Tighter error handling**: `updateColorCustomizations`, `enableReactor`, `disableReactor` and `resetReactorCustomizations` now catch and surface failures of `workbench.colorCustomizations.update`. The cached "last applied" signature is no longer set when the write fails, so the next refresh retries instead of believing the broken state was applied. Three new error i18n keys added (`reactor.toggleError`, `reactor.customizationsResetError`).
- **Pure helper extracted**: `computeResetCustomizations(existing)` from `resetReactorCustomizations`. Makes the reset logic unit-testable without touching VS Code state.
- **JSDoc** added to every exported function in `src/glow.ts` and `src/reactor.ts` (`enableGlow`, `disableGlow`, `toggleGlow`, `activateGlow`, `isGlowPatched`, `MARKER_REGEX`, `START_MARKER`, `END_MARKER`, `activateReactor`, `deactivateReactor`, `toggleReactor`).
- **New tests** for `computeResetCustomizations` (strips managed keys, no-op without managed keys), `activateGlow` (registers a real disposable on the context), and the runtime template (no unresolved `__FOO__` placeholders, contains the double-injection guard).
- **`.vscodeignore` and `.gitignore`** tightened to exclude `*.tsbuildinfo`, `.npmrc`, source maps and other build leftovers from both the repo and the published VSIX.
- **Test imports** now go through TypeScript (`import * as glow from '../../glow'`) instead of `require('out/...')`. Compilation of tests is guaranteed by the new `pretest` script.

#### Theme & glow

- **`reactor.ts` refactor**: replaced 5 nested ternaries with `stateAccent`, `stateActivityBackground`, `stateTitleBarBackground`, `stateEditorBackground` helpers. Same outputs (covered by existing tests), much smaller surface for future bugs.
- **`themes/neomono-glow.css` and `themes/neomono-deep-glow.css`** are now flagged in their headers as legacy/migration-only files. The runtime glow lives entirely in `src/glow.ts`.
- `neomono-glow.css` is now scoped to the Neomono theme to avoid leaking the glow into other themes.
- Notifications are now suppressed when `neomono.neonDreams.showNotifications` is `false`.
- Neon Dreams activation no longer requires an external extension; the reload notification now says "Reload VS Code" instead of "Reload Custom CSS".

### Fixed

- **`scripts/validate-commands.js`** was looking for `src/extension.js` but the source is `extension.ts` — the script always failed once invoked. Now it correctly inspects `src/extension.ts`.
- **Silent `catch {}` blocks** in `glow.ts` (checksum read/write, product.json parsing, toggle fallback, Custom CSS Loader cleanup) now log a `console.warn` so failures leave a trace.
- `fixChecksums()` now resolves paths with the `out/` prefix correctly (VS Code stores relative paths without `out/` in `product.json` but files live under `out/`).
- `cleanupCustomCssImports()` no longer crashes with "not a registered configuration" when Custom CSS Loader is not installed.
- Glow effect now uses token CSS interception (MutationObserver on `.vscode-tokens-styles`) instead of static CSS selectors, making it robust against VS Code DOM changes.
- `package.json` corruption issue (missing `devDependencies`) resolved.

## [0.0.8] - 2026-02-23

### Fixed

- Improved panel/chat separators visibility in Antigravity by adding missing border color tokens
- Added explicit borders for sidebar and editor split views (`sideBar.border`, `editorGroup.border`, `editorGroupHeader.border`, `sideBySideEditor.horizontalBorder`, `sideBySideEditor.verticalBorder`)
- Added chat-related border/background tokens for clearer request container separation (`chat.requestBorder`, `chat.requestBackground`)
- Added `contrastBorder` for better UI divider consistency across workbench surfaces

## [0.0.7] - 2025-12-25

### Added

- JSX text content coloring (White #f8f8f2) to differentiate text content from tags

### Changed

- Debug Toolbar background color changed from Pink to Dark Purple (#44475a) for better theme integration
- Active Tab styling refined: removed borders and switched to a semi-transparent purple background (#bd93f960) with white text for a softer, integrated look

## [0.0.6] - 2025-12-20

### Added

- 70 new color properties for comprehensive VS Code UI coverage (expanded from 88 to 158 total properties)
- Editor selection and highlighting colors
- Find and search match highlighting with orange accents
- Line highlight and indent guide colors
- Cursor colors (bright white for visibility)
- Bracket matching colors with cyan borders
- Error squiggles (red), warning squiggles (orange), info squiggles (cyan), and hint squiggles (green)
- Editor widget colors (autocomplete, hover, parameter hints)
- Git gutter decorations (modified/orange, added/green, deleted/red)
- Git file decorations (modified, deleted, untracked, ignored, conflicting)
- Overview ruler indicators for Git changes and errors/warnings
- Debug toolbar with pink background
- Debug console message colors (info/cyan, warning/orange, error/red)
- Notification center and toast styling
- Badge colors (pink background)
- Progress bar color (purple)
- Scrollbar styling with subtle transparency

### Changed

- Updated indent guide properties from deprecated versions to current standard
- Improved theme completeness from basic (88 properties) to production-ready (158 properties)

### Fixed

- Replaced deprecated `editorIndentGuide.background` with `editorIndentGuide.background1`
- Replaced deprecated `editorIndentGuide.activeBackground` with `editorIndentGuide.activeBackground1`

## [0.0.5] - 2025-12-20

### Added

- Comprehensive UI color customizations for better theme consistency
- Custom colors for focus borders (cyan `#8be9fd`)
- Sidebar section header styling with purple accents
- Title bar and menu bar custom colors
- Input field styling with dark backgrounds
- Quick Input/Command Palette customization
- List and selection styling with purple highlights
- Button styling with cyan backgrounds
- Text link colors matching theme palette
- Status bar with purple background (`#bd93f9`)
- Panel and panel section header styling
- Tab bar customization with purple active borders

### Changed

- Replaced all default gray UI elements with theme-consistent colors
- Improved visual consistency across all VS Code interface elements
- Enhanced contrast and readability throughout the interface

## [0.0.4] - 2025-12-15

### Added

- Script to dynamically switch README badges between VS Code Marketplace and Open VSX
- NPM scripts for badge switching (`badges:vscode` and `badges:ovsx`)

### Changed

- Replaced Open VSX rating badge with GitHub stars badge for better compatibility
- Condensed README content for improved readability
- Updated VSCode engine version to `^1.80.0` for compatibility with latest features

### Fixed

- Badge display issues for Open VSX marketplace

## [0.0.3] - 2025-12-13

### Added

- Publisher information in package.json (`Monosen`)
- Custom icon for the extension (`neomono-icon.jpg`)
- Gallery banner with purple theme color (`#bd93f9`)
- Repository information in package.json

### Changed

- Updated Neomono icon from PNG to JPG format for improved compatibility and consistency
- Improved branding and visual identity

## [0.0.2] - 2025-12-13

### Changed

- Refactored the Neon Dreams effects system to use Custom CSS and JS Loader
- Removed dependency on the `fs` module which required administrator permissions
- Improved user experience with bilingual support (English/Spanish)
- Added automatic detection of the Custom CSS and JS Loader extension

### Fixed

- Fixed permission issue (EACCES) when enabling Neon Dreams
- Fixed "command 'extension.reloadCustomCSS' not found" error when extension is not installed
- Improved compatibility with VS Code updates

### Added

- Button to automatically install the Custom CSS and JS Loader extension
- Smart detection of required extension status
- Documentation about the "[Unsupported]" message in the README
- Code examples for multiple languages: Go, Rust, Java, C#, PHP, Ruby, TypeScript, Bash, SQL, JSON
- Supported languages section in the README
- Spanish translations for README and examples documentation (README.es.md)

## [0.0.1] - 2025-12-13

### Added

- Initial release of Neomono theme
- Dark theme with vibrant neon accents
- Commands to enable/disable Neon Dreams effects
- Comprehensive language examples (Python, React, CSS, HTML, JavaScript)
- Project icon and README documentation
