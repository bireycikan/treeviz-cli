import { DEFAULT_IGNORES } from "./traverser";
import { update } from "./commands/update";
import pkg from "../package.json";

const VERSION = pkg.version;

const HELP = `
treeviz - Generate ASCII directory trees

Usage:
  treeviz [path] [options]

Arguments:
  path                    Directory to visualize (default: current directory)

Commands:
  update                  Update treeviz-cli to the latest version

Options:
  -f, --format <type>     Output format: ascii (default), json, markdown
  -d, --depth <n>         Limit directory traversal depth
  -i, --ignore <folders>  Comma-separated folders to ignore (added to defaults)
  --no-default-ignores    Disable the default ignore list
  --follow-symlinks       Follow symbolic links (skipped by default)
  -o, --output <file>     Write output to a file
  -c, --copy              Copy output to clipboard
  -h, --help              Show this help message
  -v, --version           Show version

Default ignores:
  ${DEFAULT_IGNORES.join(", ")}

Examples:
  treeviz
  treeviz ./src
  treeviz --depth 2
  treeviz --format json
  treeviz --format markdown
  treeviz --ignore .env,coverage
  treeviz --no-default-ignores
  treeviz --output tree.txt
  treeviz --copy
`.trim();

export function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  let targetPath = ".";
  let extraIgnores: string[] = [];
  let useDefaultIgnores = true;
  let copyToClipboard = false;
  let maxDepth = Infinity;
  let followSymlinks = false;
  let format = "ascii";
  let outputFile = "";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "update") {
      update(VERSION);
      process.exit(0);
    }

    if (arg === "-h" || arg === "--help") {
      console.log(HELP);
      process.exit(0);
    }

    if (arg === "-v" || arg === "--version") {
      console.log(`treeviz v${VERSION}`);
      process.exit(0);
    }

    if (arg === "--no-default-ignores") {
      useDefaultIgnores = false;
      continue;
    }

    if (arg === "-c" || arg === "--copy") {
      copyToClipboard = true;
      continue;
    }

    if (arg === "--follow-symlinks") {
      followSymlinks = true;
      continue;
    }

    if (arg === "-f" || arg === "--format") {
      const next = args[++i];
      const validFormats = ["ascii", "json", "markdown"];
      if (!next || !validFormats.includes(next)) {
        console.error(
          `Error: --format requires one of: ${validFormats.join(", ")}`
        );
        process.exit(1);
      }
      format = next;
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      const next = args[++i];
      if (!next) {
        console.error("Error: --output requires a file path");
        process.exit(1);
      }
      outputFile = next;
      continue;
    }

    if (arg === "-d" || arg === "--depth") {
      const next = args[++i];
      if (!next || isNaN(Number(next)) || Number(next) < 0) {
        console.error("Error: --depth requires a non-negative integer");
        process.exit(1);
      }
      maxDepth = parseInt(next, 10);
      continue;
    }

    if (arg === "-i" || arg === "--ignore") {
      const next = args[++i];
      if (!next) {
        console.error("Error: --ignore requires a value");
        process.exit(1);
      }
      extraIgnores = next.split(",").map(s => s.trim());
      continue;
    }

    // Positional argument = path
    if (!arg.startsWith("-")) {
      targetPath = arg;
      continue;
    }

    console.error(`Unknown option: ${arg}`);
    console.error('Run "treeviz --help" for usage');
    process.exit(1);
  }

  return {
    targetPath,
    extraIgnores,
    useDefaultIgnores,
    copyToClipboard,
    maxDepth,
    followSymlinks,
    format,
    outputFile,
  };
}
