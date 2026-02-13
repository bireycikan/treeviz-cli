#!/usr/bin/env node

import { existsSync, statSync, realpathSync, writeFileSync } from "fs";
import { resolve } from "path";
import { parseArgs } from "./cli";
import { traverseDirectory, DEFAULT_IGNORES } from "./traverser";
import {
  generateAsciiTree,
  generateJsonTree,
  generateMarkdownTree,
} from "./formatters";
import { copyToClipboard } from "./clipboard";

function main() {
  const {
    targetPath,
    extraIgnores,
    useDefaultIgnores,
    copyToClipboard: shouldCopy,
    maxDepth,
    followSymlinks,
    format,
    outputFile,
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

  if (outputFile) {
    writeFileSync(resolve(outputFile), output);
    console.log(`\n✓ Written to ${outputFile}`);
  }

  if (shouldCopy) {
    copyToClipboard(output);
  }
}

main();
