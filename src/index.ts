#!/usr/bin/env node

import { existsSync, statSync, realpathSync } from "fs";
import { spawnSync } from "child_process";
import { resolve } from "path";
import {
  traverseDirectory,
  generateAsciiTree,
  generateJsonTree,
  generateMarkdownTree,
  DEFAULT_IGNORES,
} from "./tree-generator";
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
  treeviz --copy
`.trim();

function update() {
  const currentVersion = VERSION;
  console.log(`Current version: ${currentVersion}`);
  console.log("Checking for updates to latest version...");

  try {
    const viewResult = spawnSync("npm", ["view", "treeviz-cli", "version"], {
      encoding: "utf-8",
    });

    if (viewResult.status !== 0) {
      throw new Error("Failed to check version");
    }

    const latest = viewResult.stdout.trim();

    if (latest === currentVersion) {
      console.log(`Already on the latest version (${currentVersion}).`);
      process.exit(0);
    }

    const installResult = spawnSync(
      "npm",
      ["install", "-g", "treeviz-cli@latest"],
      { stdio: "pipe" }
    );

    if (installResult.status !== 0) {
      throw new Error("Failed to install");
    }

    console.log(
      `Successfully updated from ${currentVersion} to version ${latest}`
    );
  } catch {
    console.error("Error: Failed to update treeviz-cli.");
    process.exit(1);
  }
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  let targetPath = ".";
  let extraIgnores: string[] = [];
  let useDefaultIgnores = true;
  let copyToClipboard = false;
  let maxDepth = Infinity;
  let followSymlinks = false;
  let format = "ascii";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "update") {
      update();
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
  };
}

function main() {
  const {
    targetPath,
    extraIgnores,
    useDefaultIgnores,
    copyToClipboard,
    maxDepth,
    followSymlinks,
    format,
  } = parseArgs(process.argv);

  const fullPath = resolve(targetPath);

  if (!existsSync(fullPath)) {
    console.error(`Error: Path does not exist: ${fullPath}`);
    process.exit(1);
  }

  if (!statSync(fullPath).isDirectory()) {
    console.error(`Error: Not a directory: ${fullPath}`);
    process.exit(1);
  }

  // Path traversal protection: ensure the resolved path doesn't escape via symlinks
  const realPath = realpathSync(fullPath);
  if (realPath !== fullPath && !realPath.startsWith(resolve("."))) {
    console.error(
      `Error: Path resolves outside the current directory: ${realPath}`
    );
    process.exit(1);
  }

  const ignoreList = [
    ...(useDefaultIgnores ? DEFAULT_IGNORES : []),
    ...extraIgnores,
  ];

  const tree = traverseDirectory(
    fullPath,
    ignoreList,
    maxDepth,
    0,
    followSymlinks
  );

  let output: string;
  switch (format) {
    case "json":
      output = generateJsonTree(tree);
      break;
    case "markdown":
      output = generateMarkdownTree(tree);
      break;
    default:
      output = generateAsciiTree(tree);
  }

  console.log(output);

  if (copyToClipboard) {
    const pbcopy = spawnSync("pbcopy", [], { input: output });
    if (pbcopy.status === 0) {
      console.log("\n✓ Copied to clipboard");
    } else {
      const xclip = spawnSync("xclip", ["-selection", "clipboard"], {
        input: output,
      });
      if (xclip.status === 0) {
        console.log("\n✓ Copied to clipboard");
      } else {
        console.error(
          "\n✗ Could not copy to clipboard (pbcopy/xclip not found)"
        );
      }
    }
  }
}

main();
