# Change Log

All notable changes to the "neomono" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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

