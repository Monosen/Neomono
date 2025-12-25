# Change Log

All notable changes to the "neomono" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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
