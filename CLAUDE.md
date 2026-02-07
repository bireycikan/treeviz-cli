# treeviz-cli

## Overview
CLI tool that generates ASCII directory trees from the terminal. Standalone package published as `treeviz-cli` on npm. Zero dependencies, powered by Bun.

## Tech
- **Runtime**: Bun
- **Language**: TypeScript (strict)
- **Package manager**: Bun

## Project Structure
```
src/
├── index.ts          # Entry point — arg parsing, clipboard, output
├── tree-generator.ts # fs-based directory traversal + ASCII generation
└── types.ts          # TreeNode interface
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
- Default ignores: `node_modules`, `.git`, `.next`, `.husky`, `.turbo`, `dist`, `build`, `.DS_Store`

## CLI Flags
- `[path]` — directory to visualize (default: `.`)
- `-i, --ignore <folders>` — comma-separated additional ignores
- `--no-default-ignores` — disable default ignore list
- `-c, --copy` — copy output to clipboard
- `-h, --help` / `-v, --version`

## Related
- Web version: `/Users/bireycikan/Developer/tree-viz` (Next.js app, same tree logic but uses File System Access API)
