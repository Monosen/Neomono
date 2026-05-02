# Change Log

All notable changes to the "neomono" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added

- **Theme coverage expanded from 163 to 399 workbench colors** (~145% increase, bringing parity with Dracula/Dark+ Pro)
- **Integrated terminal**: background, foreground, selection, cursor, 16 ANSI colors (normal + bright) mapped to the Neomono palette
- **Editor line numbers**: `editorLineNumber.foreground`, `activeForeground`, `dimmedForeground`
- **Bracket pair colorization**: 6 rainbow colors for `editorBracketHighlight` and `editorBracketPairGuide` (normal + active), plus unexpected bracket foreground
- **Minimap**: background, slider, gutter (added/modified/deleted), match highlights
- **Diff editor**: inserted/removed text and line backgrounds, unchanged regions, gutter and overview colors
- **Merge conflicts**: current/incoming/common headers and content, overview ruler indicators
- **Peek view**: border, editor match highlight, result list, title bar
- **Breadcrumbs**: background, foreground, focus, active selection, picker
- **Sticky scroll**: background, hover, border, shadow
- **Inlay hints and ghost text** (type hints, Copilot/Cursor suggestions): foreground, type, parameter variants
- **Inline chat (AI)**: background, border, shadow, input styles, diff colors for accepted/rejected changes
- **Command Center** (title bar search): full styling including active and inactive states
- **Testing**: icon states, message decorations, peek border, covered/uncovered gutter highlights
- **Settings editor**: headers, inputs, dropdowns, checkboxes, focus row, modified indicator
- **Extensions view**: button variants, remote badges, star/verified/preRelease/sponsor icons
- **Debug icons** (full): breakpoints (5 variants), start/pause/stop/disconnect/restart/step/continue
- **Debug token expressions**: name, value, string, boolean, number, error
- **Debug view and stack frame**: state labels, value changed highlight, exception widget
- **Chat** (extended): slash commands, avatars, edited file indicator
- **Banners**: background, foreground, icon
- **Dropdowns**: background, foreground, border, list background
- **Editor CodeLens, LightBulb, fold, comment gutter**: foreground colors for better ergonomics
- Internationalization (i18n) for command titles, settings descriptions, and runtime messages via `package.nls.json` and `vscode.l10n` bundles (English / Spanish)
- New command `Neomono: Toggle Neon Dreams`
- Settings `neomono.neonDreams.autoReload` and `neomono.neonDreams.showNotifications`
- Script `npm run validate:theme` that checks JSON, duplicate keys, and hex colors
- GitHub Actions workflows for CI (validate + package `.vsix`) and Release (publish to VS Code Marketplace and Open VSX on tag `v*`)
- `CONTRIBUTING.md`, issue templates (bug, theme request) and pull request template
- `license`, `homepage`, `bugs`, `keywords`, `activationEvents`, and `engines.node` fields in `package.json`
- **Reactor Glow**: reactive UI that changes colors based on active-file diagnostics and debug state (priority: debug > error > warning > normal). Configurable intensity and per-element targeting (status bar, activity bar, title bar, panel title, editor diagnostics, tab border, editor background tint)
- **Neon Dreams is now self-contained**: no longer depends on the Custom CSS and JS Loader extension. Patching is done directly into VS Code's `workbench.html` (similar to Synthwave '84)
- **Automatic checksum fixing**: after modifying VS Code core files, checksums in `product.json` are recalculated automatically to suppress the "corrupt installation" warning
- **Real glow brightness control**: `neomono.neonDreams.brightness` (0.0–1.0) is converted to a 2-digit hex alpha and injected into glow `text-shadow` colors at build time
- **Glow disable without losing chrome**: `neomono.neonDreams.glow` setting lets you disable the text-shadow effect while keeping editor chrome updates
- **Advanced testing/debug colors**: ~20 new keys added to both Neomono and Neomono Deep themes (retired icons, coverage badges, minimap coverage, inline values, exception labels, etc.)
- **3 new Reactor Glow commands**: `Neomono: Enable Reactor Glow`, `Disable Reactor Glow`, `Toggle Reactor Glow`
- **7 Reactor Glow settings**: `enabled`, `intensity`, `affectStatusBar`, `affectActivityBar`, `affectTitleBar`, `affectPanelTitle`, `affectEditorDiagnostics`, `affectEditorBackground`, `affectTabBorder`
- **Custom CSS Loader migration cleanup**: old `vscode_custom_css.imports` entries are automatically removed when migrating from the previous method
- New i18n strings for all new features (English / Spanish)

### Changed

- `neomono-glow.css` is now scoped to the Neomono theme to avoid leaking the glow into other themes
- `.vscodeignore` now excludes `examples/`, `scripts/`, `.github/`, `README.es.md` and other dev-only files from the published `.vsix`
- Notifications are now suppressed when `neomono.neonDreams.showNotifications` is `false`
- Neon Dreams activation no longer requires an external extension; the reload notification now says "Reload VS Code" instead of "Reload Custom CSS"

### Fixed

- `fixChecksums()` now resolves paths with the `out/` prefix correctly (VS Code stores relative paths without `out/` in `product.json` but files live under `out/`)
- `cleanupCustomCssImports()` no longer crashes with "not a registered configuration" when Custom CSS Loader is not installed
- Glow effect now uses token CSS interception (MutationObserver on `.vscode-tokens-styles`) instead of static CSS selectors, making it robust against VS Code DOM changes
- `package.json` corruption issue (missing `devDependencies`) resolved

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
