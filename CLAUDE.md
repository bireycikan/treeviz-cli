# treeviz-cli

## Overview

CLI tool that generates ASCII directory trees from the terminal. Standalone package published as `treeviz-cli` on npm. Zero dependencies, powered by Bun.

## Tech

- **Runtime**: Bun
- **Language**: TypeScript (strict)
- **Package manager**: Bun

## Project Structure

```
treeviz-cli/
├── .github/
│   └── workflows/
│       └── publish.yml         # CI/CD publish workflow
├── .vscode/
│   └── settings.json           # VS Code workspace settings
├── src/                        # Source code
│   ├── commands/
│   │   └── update.ts           # Self-update command
│   ├── cli.ts                  # Arg parsing, help text, version display
│   ├── clipboard.ts            # Clipboard copy (pbcopy/xclip)
│   ├── formatters.ts           # ASCII, JSON, and Markdown tree formatters
│   ├── index.ts                # CLI entrypoint — main() orchestration
│   ├── traverser.ts            # Recursive directory traversal, ignores, entry limit
│   └── types.ts                # TypeScript interfaces (TreeNode)
├── tests/                      # Test files
│   ├── ascii-tree.test.ts      # ASCII rendering tests
│   ├── depth.test.ts           # Depth limiting tests
│   ├── format.test.ts          # JSON/Markdown format tests
│   ├── security.test.ts        # Max entry limit tests
│   ├── symlink.test.ts         # Symlink safety tests
│   └── traversal.test.ts       # Directory traversal tests
├── .gitignore                  # Git ignore rules
├── bun.lock                    # Bun lockfile
├── CHANGELOG.md                # Release changelog
├── CLAUDE.md                   # Project context for Claude Code
├── eslint.config.mjs           # ESLint configuration
├── lint-staged.config.mjs      # Lint-staged configuration
├── package.json                # Package metadata, scripts, and bin config
├── prettier.config.mjs         # Prettier configuration
├── README.md                   # Documentation and usage guide
└── tsconfig.json               # TypeScript compiler options
```

## Commands

- `bun run dev` — run CLI directly via `bun run src/index.ts`
- `bun run build` — bundle to `dist/index.js` targeting Bun
- `bun publish --access public` — publish to npm

## Key Implementation Details

- Box-drawing characters use Unicode escapes (`\u251C`, `\u2500`, `\u2514`, `\u2502`) to avoid encoding issues
- `traverseDirectory` uses `fs.readdirSync` with `{ withFileTypes: true }` for sync recursive traversal
- Sorting: directories first, then alphabetical
- Clipboard: `pbcopy` (macOS) with `xclip` fallback (Linux)
- Default ignores: `node_modules`, `.claude`, `.git`, `.next`, `.husky`, `.turbo`, `dist`, `build`, `.DS_Store`

## CLI Flags

- `[path]` — directory to visualize (default: `.`)
- `-f, --format <type>` — output format: `ascii` (default), `json`, `markdown`
- `-d, --depth <n>` — limit directory traversal depth
- `-i, --ignore <folders>` — comma-separated additional ignores
- `--no-default-ignores` — disable default ignore list
- `--follow-symlinks` — follow symbolic links (skipped by default)
- `-o, --output <file>` — write output to a file
- `-c, --copy` — copy output to clipboard
- `-h, --help` / `-v, --version`

## Related

- Web version: `/Users/bireycikan/Developer/tree-viz` (Next.js app, same tree logic but uses File System Access API)
