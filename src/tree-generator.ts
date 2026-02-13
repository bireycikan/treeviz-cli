import { readdirSync, realpathSync } from "fs";
import { join, basename } from "path";
import type { TreeNode } from "./types";

export const DEFAULT_IGNORES = [
  "node_modules",
  ".claude",
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
  ignoreList: string[] = DEFAULT_IGNORES,
  maxDepth: number = Infinity,
  currentDepth: number = 0,
  followSymlinks: boolean = false,
  visitedPaths: Set<string> = new Set()
): TreeNode {
  // Seed the visited set with the initial directory to detect cycles back to root
  if (followSymlinks && visitedPaths.size === 0) {
    visitedPaths.add(realpathSync(dirPath));
  }

  const entries = readdirSync(dirPath, { withFileTypes: true });
  const children: TreeNode[] = [];

  for (const entry of entries) {
    if (ignoreList.includes(entry.name)) continue;

    const fullPath = join(dirPath, entry.name);

    // Skip symlinks by default to prevent traversal outside the project
    // and infinite loops from symlink cycles
    if (entry.isSymbolicLink()) {
      if (!followSymlinks) continue;

      // When following symlinks, resolve the real path and check for cycles
      try {
        const realPath = realpathSync(fullPath);
        if (visitedPaths.has(realPath)) continue;
        visitedPaths.add(realPath);
      } catch {
        // Broken symlink — skip it
        continue;
      }
    }

    if (entry.isDirectory() || (entry.isSymbolicLink() && followSymlinks)) {
      if (currentDepth < maxDepth) {
        try {
          const childNode = traverseDirectory(
            fullPath,
            ignoreList,
            maxDepth,
            currentDepth + 1,
            followSymlinks,
            visitedPaths
          );
          children.push(childNode);
        } catch {
          // Permission denied or broken symlink target — list but don't expand
          children.push({ name: entry.name, type: "directory" });
        }
      } else {
        children.push({ name: entry.name, type: "directory" });
      }
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
