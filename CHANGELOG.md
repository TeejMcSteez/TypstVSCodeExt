# Change Log

All notable changes to the "typstlangsupport" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [V0.0.1]

- Initial release

### Added: Features

+ V0.0.1 Added basic Syntax Highlighting still need to match many patterns
+ V0.0.1 Added preview window that compiles .typ to .pdf into tempdir and displays it in sidebar
+ V0.0.1 Added basic favicon for .typ file
+ V0.0.1 Added full math support
+ Added label highlighting
+ V0.0.1 Added backtick rendering

### Added: Files

+ V0.0.1 Syntaxes - typst.tmLanguage.json
+ V0.0.1 icons - favicon-16x16.png, typst-icon-theme.json
+ V0.0.1 Language Configuration (basic for closing brackets etc.) - language-configuration.json

### Changed

+ V0.0.1 package.json
    - Added new preview command to command pallete
    - Added language for language config
    - Added grammar for syntax config
    - Added icons for theme config

## [V0.0.2]

- Cursor integration

### Added: Features

+ Extension now works in cursor imports

### Added: Files

+ LICENSE.md to stop vsce yelling at me about no license

### Changed

+ VSCode engine & types from v1.99.0 -> v1.96.0 to support Cursor

## [V0.0.3]

- Configuration Settings

### Added: Features

+ Extension now has setting so one can edit output format (pdf, png, svg, html)

### Changed

+ package.json to reflect settings configuration
+ extensions.ts to handle getting the output config from the vscode setttings
+ typstlangsupport-0.0.3.vsix updated new version

## [V0.0.4]

### Added: Features

+ Linting support
    - Math expressions
    - Invalid references and links
    - Unclosed braces

### Added: Files

+ linter.ts with linting rules

### Changed

+ extensions.ts to import linter and push document changes via subscriptions to linter

### TODO

+ add raw text linting config
+ add highlight on pagebreak or maybe italics to signify a page break (optional)
+ add highlight on emoji operators ( ex: \u{1ffff} )
+ add highlight to function parameters (optional)
