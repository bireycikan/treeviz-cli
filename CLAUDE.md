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
├── src/                    # Source code
│   ├── index.ts            # CLI entrypoint — arg parsing, validation, clipboard, main()
│   ├── tree-generator.ts   # Core logic — recursive traversal and ASCII tree rendering
│   └── types.ts            # TypeScript interfaces (TreeNode)
├── .gitignore              # Git ignore rules
├── bun.lock                # Bun lockfile
├── CLAUDE.md               # Project context for Claude Code
├── package.json            # Package metadata, scripts, and bin config
├── README.md               # Documentation and usage guide
└── tsconfig.json           # TypeScript compiler options
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
- `-d, --depth <n>` — limit directory traversal depth
- `-i, --ignore <folders>` — comma-separated additional ignores
- `--no-default-ignores` — disable default ignore list
- `--follow-symlinks` — follow symbolic links (skipped by default)
- `-c, --copy` — copy output to clipboard
- `-h, --help` / `-v, --version`

## Related

- Web version: `/Users/bireycikan/Developer/tree-viz` (Next.js app, same tree logic but uses File System Access API)
