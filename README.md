# @treeviz/cli

Generate ASCII directory trees from the terminal. Zero dependencies, powered by Bun.

## Installation

```bash
bun add -g @treeviz/cli
```

## Usage

```bash
# Current directory
treeviz

# Specific path
treeviz ./src

# Add custom ignores
treeviz --ignore .env,coverage

# Disable default ignores
treeviz --no-default-ignores

# Copy output to clipboard
treeviz --copy
```

## Options

| Option | Alias | Description |
|--------|-------|-------------|
| `[path]` | | Directory to visualize (default: `.`) |
| `--ignore <folders>` | `-i` | Comma-separated folders to add to ignore list |
| `--no-default-ignores` | | Disable the default ignore list |
| `--copy` | `-c` | Copy output to clipboard |
| `--help` | `-h` | Show help |
| `--version` | `-v` | Show version |

## Default Ignores

`node_modules`, `.git`, `.next`, `.husky`, `.turbo`, `dist`, `build`, `.DS_Store`

## Web Version

Try the browser-based version at [treeviz.dev](https://treeviz.dev) — select a folder and get the same output with zero uploads.
