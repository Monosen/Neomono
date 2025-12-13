# Change Log

All notable changes to the "neomono" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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
