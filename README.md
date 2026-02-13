# treeviz-cli

Generate clean, readable directory trees from the terminal — designed to give AI models instant understanding of your project structure.

[![npm version](https://img.shields.io/npm/v/treeviz-cli)](https://www.npmjs.com/package/treeviz-cli)
[![license](https://img.shields.io/npm/l/treeviz-cli)](https://github.com/bireycikan/treeviz-cli/blob/main/LICENSE)

## Why treeviz?

AI coding assistants like Claude, ChatGPT, and Copilot are powerful. But they're blind to your project's file structure. Without knowing which files exist and how they're organized, AI models waste tokens asking questions, hallucinate paths, or give advice that doesn't fit your codebase.

**treeviz solves this.** One command generates a structured snapshot of your project that you can paste into any AI prompt, save to a context file (like `CLAUDE.md` or `AGENTS.md`), or pipe into your workflow. The result: AI models understand your project from the first message.

### The problem

```
You: "Add a login page"
AI:  "Sure! Create src/pages/Login.tsx..."
You: "We don't have a pages folder. We use app/ with Next.js App Router."
AI:  "Oh, I see. Let me try again..."
```

### The fix

```
You: "Here's my project structure:
     [paste treeviz output]
     Add a login page."
AI:  "I can see you're using Next.js App Router. I'll create app/login/page.tsx..."
```

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

## Quick Start

```bash
# Current directory
treeviz

# Specific path
treeviz ./src

# Limit depth to 2 levels
treeviz --depth 2

# Save to a file
treeviz --output tree.txt

# Copy to clipboard (paste straight into AI chat)
treeviz --copy
```

## Output Formats

### ASCII (default)

```bash
treeviz
```

```
my-app/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Header.tsx
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── utils/
│       └── helpers.ts
├── package.json
├── tsconfig.json
└── README.md
```

### JSON

```bash
treeviz --format json
```

```json
{
  "name": "my-app",
  "type": "directory",
  "children": [
    {
      "name": "src",
      "type": "directory",
      "children": [
        { "name": "components", "type": "directory", "children": [...] },
        { "name": "app", "type": "directory", "children": [...] }
      ]
    },
    { "name": "package.json", "type": "file" }
  ]
}
```

### Markdown

```bash
treeviz --format markdown
```

```markdown
- my-app/
  - src/
    - components/
      - Button.tsx
      - Header.tsx
    - app/
      - layout.tsx
      - page.tsx
  - package.json
  - README.md
```

## Using treeviz with AI Models

### Paste into AI chat

The fastest way — copy the output and paste it at the top of your prompt:

```bash
treeviz --copy
```

Then in your AI chat:

```
Here's my project structure:

my-app/
├── src/
│   ├── components/
│   ...

[Your question here]
```

### Save to a context file

Many AI tools support project-level context files. Generate a tree and include it:

```bash
# For Claude Code
treeviz --output tree.txt
# Then paste into CLAUDE.md under "## Project Structure"

# For Cursor, Windsurf, or any AI editor
treeviz --output tree.txt
# Reference in your .cursorrules, .windsurfrules, or similar
```

### Automate with a pre-commit hook

Keep your context file always up to date:

```bash
# In your pre-commit hook or CI step
treeviz --output tree.txt
```

### Pipe into other tools

```bash
# Feed into clipboard for quick paste
treeviz | pbcopy

# Append to an existing context file
treeviz >> CLAUDE.md

# Save JSON for programmatic use
treeviz --format json --output structure.json
```

## Commands

| Command  | Description                              |
| -------- | ---------------------------------------- |
| `update` | Update treeviz-cli to the latest version |

```bash
treeviz update
```

## Options

| Option                 | Alias | Description                                          |
| ---------------------- | ----- | ---------------------------------------------------- |
| `[path]`               |       | Directory to visualize (default: `.`)                |
| `--format <type>`      | `-f`  | Output format: `ascii` (default), `json`, `markdown` |
| `--depth <n>`          | `-d`  | Limit directory traversal depth                      |
| `--ignore <folders>`   | `-i`  | Comma-separated folders to add to the ignore list    |
| `--no-default-ignores` |       | Disable the default ignore list                      |
| `--follow-symlinks`    |       | Follow symbolic links (skipped by default)           |
| `--output <file>`      | `-o`  | Write output to a file                               |
| `--copy`               | `-c`  | Copy output to clipboard                             |
| `--help`               | `-h`  | Show help                                            |
| `--version`            | `-v`  | Show version                                         |

## Default Ignores

treeviz automatically skips common noise directories so your tree stays clean and relevant:

`node_modules`, `.claude`, `.git`, `.next`, `.husky`, `.turbo`, `dist`, `build`, `.DS_Store`

You can add more with `--ignore` or disable defaults entirely with `--no-default-ignores`.

## Security

treeviz is designed to be safe by default:

- **Symlinks are skipped** — prevents traversal outside the project directory. Opt in with `--follow-symlinks`.
- **Cycle detection** — when following symlinks, circular references are detected and skipped to prevent infinite loops.
- **Path traversal protection** — resolved paths that escape the working directory are rejected.
- **Entry limit** — trees are capped at 10,000 entries to prevent resource exhaustion on massive directories.

## Platform Support

- **macOS** — clipboard via `pbcopy`
- **Linux** — clipboard via `xclip` (install with `sudo apt install xclip`)
- **Windows** — works for tree generation; clipboard support coming soon

## Contributing

Contributions are welcome! The project uses:

- **Bun** as the runtime and test runner
- **TypeScript** with strict mode
- **ESLint** + **Prettier** for code quality
- **Husky** + **lint-staged** for pre-commit hooks

```bash
# Clone the repo
git clone https://github.com/bireycikan/treeviz-cli.git
cd treeviz-cli

# Install dependencies
bun install

# Run locally
bun run dev

# Run tests
bun test

# Build
bun run build
```

## License

[MIT](https://github.com/bireycikan/treeviz-cli/blob/main/LICENSE)
