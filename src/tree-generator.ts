import { readdirSync } from "fs";
import { join, basename } from "path";
import type { TreeNode } from "./types";

export const DEFAULT_IGNORES = [
  "node_modules",
  ".git",
  ".next",
  ".husky",
  ".turbo",
  "dist",
  "build",
  ".DS_Store",
];

export function traverseDirectory(
  dirPath: string,
  ignoreList: string[] = DEFAULT_IGNORES
): TreeNode {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const children: TreeNode[] = [];

  for (const entry of entries) {
    if (ignoreList.includes(entry.name)) continue;

    if (entry.isDirectory()) {
      const childNode = traverseDirectory(
        join(dirPath, entry.name),
        ignoreList
      );
      children.push(childNode);
    } else {
      children.push({ name: entry.name, type: "file" });
    }
  }

  // Sort: directories first, then alphabetical
  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return {
    name: basename(dirPath),
    type: "directory",
    children,
  };
}

export function generateAsciiTree(
  node: TreeNode,
  prefix: string = "",
  isRoot: boolean = true
): string {
  let result = "";

  if (isRoot) {
    result += node.name + "/\n";
  }

  const children = node.children ?? [];

  children.forEach((child, index) => {
    const isLast = index === children.length - 1;
    // Box-drawing: U+251C ├  U+2514 └  U+2500 ─  U+2502 │
    const connector = isLast ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 ";
    const childPrefix = isLast ? "    " : "\u2502   ";

    const suffix = child.type === "directory" ? "/" : "";
    result += prefix + connector + child.name + suffix + "\n";

    if (child.type === "directory" && child.children?.length) {
      result += generateAsciiTree(child, prefix + childPrefix, false);
    }
  });

  return result;
}
