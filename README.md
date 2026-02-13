# treeviz-cli

Generate ASCII directory trees from the terminal. Zero dependencies, powered by Bun.

## Installation

```bash
# npm
npm install -g treeviz-cli

# yarn
yarn global add treeviz-cli

# pnpm
pnpm add -g treeviz-cli

# bun
bun add -g treeviz-cli
```

Or run it directly without installing:

```bash
npx treeviz-cli
bunx treeviz-cli
```

## Usage

```bash
# Current directory
treeviz

# Specific path
treeviz ./src

# Limit depth
treeviz --depth 2

# Output as JSON
treeviz --format json

# Output as Markdown
treeviz --format markdown

# Add custom ignores
treeviz --ignore .env,coverage

# Disable default ignores
treeviz --no-default-ignores

# Follow symbolic links (skipped by default)
treeviz --follow-symlinks

# Copy output to clipboard
treeviz --copy

# Update to the latest version
treeviz update
```

## Commands

| Command  | Description                              |
| -------- | ---------------------------------------- |
| `update` | Update treeviz-cli to the latest version |

## Options

| Option                 | Alias | Description                                   |
| ---------------------- | ----- | --------------------------------------------- |
| `[path]`               |       | Directory to visualize (default: `.`)         |
| `--format <type>`      | `-f`  | Output format: `ascii`, `json`, `markdown`    |
| `--depth <n>`          | `-d`  | Limit directory traversal depth               |
| `--ignore <folders>`   | `-i`  | Comma-separated folders to add to ignore list |
| `--no-default-ignores` |       | Disable the default ignore list               |
| `--follow-symlinks`    |       | Follow symbolic links (skipped by default)    |
| `--copy`               | `-c`  | Copy output to clipboard                      |
| `--help`               | `-h`  | Show help                                     |
| `--version`            | `-v`  | Show version                                  |

## Default Ignores

`node_modules`, `.claude`, `.git`, `.next`, `.husky`, `.turbo`, `dist`, `build`, `.DS_Store`

## Web Version

Try the browser-based version at [treeviz.dev](https://treeviz.birey.dev) — select a folder and get the same output with zero uploads.
