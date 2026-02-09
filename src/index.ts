#!/usr/bin/env node

import { existsSync, statSync } from "fs";
import { execSync } from "child_process";
import { resolve } from "path";
import {
  traverseDirectory,
  generateAsciiTree,
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

Options:
  -i, --ignore <folders>  Comma-separated folders to ignore (added to defaults)
  --no-default-ignores    Disable the default ignore list
  -c, --copy              Copy output to clipboard
  -h, --help              Show this help message
  -v, --version           Show version

Default ignores:
  ${DEFAULT_IGNORES.join(", ")}

Examples:
  treeviz
  treeviz ./src
  treeviz --ignore .env,coverage
  treeviz --no-default-ignores
  treeviz --copy
`.trim();

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  let targetPath = ".";
  let extraIgnores: string[] = [];
  let useDefaultIgnores = true;
  let copyToClipboard = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

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

    if (arg === "-i" || arg === "--ignore") {
      const next = args[++i];
      if (!next) {
        console.error("Error: --ignore requires a value");
        process.exit(1);
      }
      extraIgnores = next.split(",").map((s) => s.trim());
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

  return { targetPath, extraIgnores, useDefaultIgnores, copyToClipboard };
}

function main() {
  const { targetPath, extraIgnores, useDefaultIgnores, copyToClipboard } =
    parseArgs(process.argv);

  const fullPath = resolve(targetPath);

  if (!existsSync(fullPath)) {
    console.error(`Error: Path does not exist: ${fullPath}`);
    process.exit(1);
  }

  if (!statSync(fullPath).isDirectory()) {
    console.error(`Error: Not a directory: ${fullPath}`);
    process.exit(1);
  }

  const ignoreList = [
    ...(useDefaultIgnores ? DEFAULT_IGNORES : []),
    ...extraIgnores,
  ];

  const tree = traverseDirectory(fullPath, ignoreList);
  const output = generateAsciiTree(tree);

  console.log(output);

  if (copyToClipboard) {
    try {
      execSync("pbcopy", { input: output });
      console.log("\n✓ Copied to clipboard");
    } catch {
      try {
        execSync("xclip -selection clipboard", { input: output });
        console.log("\n✓ Copied to clipboard");
      } catch {
        console.error("\n✗ Could not copy to clipboard (pbcopy/xclip not found)");
      }
    }
  }
}

main();
