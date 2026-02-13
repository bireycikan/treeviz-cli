# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [1.8.1] - 2026-02-13

### Added

- MIT LICENSE file
- Comprehensive README rewrite — project motivation, AI workflow examples, output format demos, security details, and contributing guide

## [1.8.0] - 2026-02-13

### Added

- CHANGELOG.md with full version history
- GitHub Actions workflow for automated npm publishing with trusted publishing (OIDC) and provenance
- Automated GitHub Release creation from changelog

### Changed

- Reorganized `src/` into focused modules (`cli.ts`, `traverser.ts`, `formatters.ts`, `clipboard.ts`, `commands/update.ts`)
- Split test suite into separate files per feature (`ascii-tree`, `traversal`, `depth`, `symlink`, `format`, `security`)

## [1.7.0] - 2026-02-13

### Added

- Output to file flag (`-o, --output <file>`)

## [1.6.0] - 2026-02-13

### Added

- Path traversal protection — validates resolved paths don't escape CWD via symlinks
- Max entry limit (10,000) to prevent resource exhaustion on huge directories

### Changed

- Replace `execSync` with `spawnSync` for clipboard and update operations (security hardening)

## [1.5.0] - 2026-02-13

### Added

- Output format support (`-f, --format <type>`) — `ascii` (default), `json`, `markdown`

## [1.4.0] - 2026-02-13

### Added

- Symlink safety — symlinks are skipped by default to prevent traversal outside the project
- `--follow-symlinks` flag to opt into following symbolic links
- Cycle detection to prevent infinite loops from circular symlinks

## [1.3.0] - 2026-02-13

### Added

- Depth limiting flag (`-d, --depth <n>`) to cap directory traversal depth

## [1.2.1] - 2026-02-12

### Added

- `.claude` folder to default ignores

## [1.2.0] - 2026-02-11

### Added

- Unit tests for `traverseDirectory` and `generateAsciiTree` using Bun test runner

## [1.1.1] - 2026-02-10

### Added

- `update` command to self-update treeviz-cli to the latest version

## [1.1.0] - 2026-02-09

### Added

- Prettier for code formatting
- Husky and lint-staged for pre-commit hooks
- ESLint for linting

### Changed

- Switch to Node-compatible APIs for broader runtime support
- Version is now read dynamically from `package.json`

## [1.0.3] - 2026-02-09

### Fixed

- Version display now reflects actual package version dynamically

## [1.0.2] - 2026-02-07

### Fixed

- Package name and CLI binary name corrections
- README browser version link

## [1.0.0] - 2026-02-07

### Added

- Initial release
- ASCII directory tree generation from the terminal
- Box-drawing characters for tree rendering
- Default ignore list (`node_modules`, `.git`, `.next`, `.husky`, `.turbo`, `dist`, `build`, `.DS_Store`)
- Custom ignore support (`-i, --ignore`)
- `--no-default-ignores` flag
- Clipboard copy support (`-c, --copy`) via `pbcopy` / `xclip`
- Help (`-h`) and version (`-v`) flags
