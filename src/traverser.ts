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

export const MAX_ENTRIES = 10_000;

export function traverseDirectory(
  dirPath: string,
  ignoreList: string[] = DEFAULT_IGNORES,
  maxDepth: number = Infinity,
  currentDepth: number = 0,
  followSymlinks: boolean = false,
  visitedPaths: Set<string> = new Set(),
  entryCount: { value: number } = { value: 0 }
): TreeNode {
  // Seed the visited set with the initial directory to detect cycles back to root
  if (followSymlinks && visitedPaths.size === 0) {
    visitedPaths.add(realpathSync(dirPath));
  }

  const entries = readdirSync(dirPath, { withFileTypes: true });
  const children: TreeNode[] = [];

  for (const entry of entries) {
    if (ignoreList.includes(entry.name)) continue;

    // Max entry limit to prevent resource exhaustion
    if (entryCount.value >= MAX_ENTRIES) {
      console.error(
        `Warning: Entry limit reached (${MAX_ENTRIES}). Tree output is truncated.`
      );
      break;
    }
    entryCount.value++;

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
            visitedPaths,
            entryCount
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
