import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type { TreeNode } from "../src/types";
import { traverseDirectory, generateAsciiTree } from "../src/tree-generator";

// =============================================================================
// generateAsciiTree — Pure unit tests (no filesystem needed)
//
// We hand-craft TreeNode objects and assert the ASCII output.
// This is the easiest kind of test: pure input → output, no side effects.
// =============================================================================

describe("generateAsciiTree", () => {
  test("renders a single file inside a directory", () => {
    // The simplest possible tree: one root dir with one file
    const tree: TreeNode = {
      name: "project",
      type: "directory",
      children: [{ name: "index.ts", type: "file" }],
    };

    const output = generateAsciiTree(tree);

    // └── is the "last item" connector (no siblings below)
    expect(output).toBe("project/\n└── index.ts\n");
  });

  test("renders multiple files with correct connectors", () => {
    const tree: TreeNode = {
      name: "src",
      type: "directory",
      children: [
        { name: "a.ts", type: "file" },
        { name: "b.ts", type: "file" },
        { name: "c.ts", type: "file" },
      ],
    };

    const output = generateAsciiTree(tree);

    // ├── for non-last items, └── for last item
    expect(output).toBe("src/\n├── a.ts\n├── b.ts\n└── c.ts\n");
  });

  test("renders nested directories with correct indentation", () => {
    const tree: TreeNode = {
      name: "root",
      type: "directory",
      children: [
        {
          name: "src",
          type: "directory",
          children: [{ name: "index.ts", type: "file" }],
        },
        { name: "README.md", type: "file" },
      ],
    };

    const output = generateAsciiTree(tree);

    // Directories get a trailing /
    // Nested items get prefix indentation (│ for continuation, spaces for last)
    expect(output).toBe("root/\n├── src/\n│   └── index.ts\n└── README.md\n");
  });

  test("renders an empty directory", () => {
    const tree: TreeNode = {
      name: "empty",
      type: "directory",
      children: [],
    };

    const output = generateAsciiTree(tree);

    // Just the root name, no children lines
    expect(output).toBe("empty/\n");
  });

  test("renders deeply nested structure", () => {
    const tree: TreeNode = {
      name: "a",
      type: "directory",
      children: [
        {
          name: "b",
          type: "directory",
          children: [
            {
              name: "c",
              type: "directory",
              children: [{ name: "deep.txt", type: "file" }],
            },
          ],
        },
      ],
    };

    const output = generateAsciiTree(tree);

    expect(output).toBe("a/\n└── b/\n    └── c/\n        └── deep.txt\n");
  });
});

// =============================================================================
// traverseDirectory — Integration tests (uses real filesystem)
//
// We create a temporary directory with a known structure, run traverseDirectory,
// and assert the resulting TreeNode matches what we expect.
//
// beforeEach/afterEach create and clean up temp dirs so tests are isolated.
// =============================================================================

describe("traverseDirectory", () => {
  let tempDir: string;

  // Before each test, create a fresh temp directory
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "treeviz-test-"));
  });

  // After each test, remove it so we don't leak files
  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test("returns correct structure for flat directory", () => {
    // Create: tempDir/a.txt, tempDir/b.txt
    writeFileSync(join(tempDir, "a.txt"), "");
    writeFileSync(join(tempDir, "b.txt"), "");

    const result = traverseDirectory(tempDir, []);

    expect(result.type).toBe("directory");
    expect(result.children).toHaveLength(2);
    expect(result.children![0].name).toBe("a.txt");
    expect(result.children![1].name).toBe("b.txt");
  });

  test("sorts directories before files", () => {
    // Create a file and a directory — directory should come first
    writeFileSync(join(tempDir, "z-file.txt"), "");
    mkdirSync(join(tempDir, "a-dir"));

    const result = traverseDirectory(tempDir, []);

    expect(result.children![0].name).toBe("a-dir");
    expect(result.children![0].type).toBe("directory");
    expect(result.children![1].name).toBe("z-file.txt");
    expect(result.children![1].type).toBe("file");
  });

  test("ignores specified folders", () => {
    mkdirSync(join(tempDir, "node_modules"));
    mkdirSync(join(tempDir, "src"));
    writeFileSync(join(tempDir, "index.ts"), "");

    const result = traverseDirectory(tempDir, ["node_modules"]);

    const names = result.children!.map(c => c.name);
    expect(names).not.toContain("node_modules");
    expect(names).toContain("src");
    expect(names).toContain("index.ts");
  });

  test("traverses nested directories recursively", () => {
    // Create: tempDir/src/utils/helper.ts
    mkdirSync(join(tempDir, "src", "utils"), { recursive: true });
    writeFileSync(join(tempDir, "src", "utils", "helper.ts"), "");

    const result = traverseDirectory(tempDir, []);

    const src = result.children!.find(c => c.name === "src");
    expect(src).toBeDefined();
    expect(src!.type).toBe("directory");

    const utils = src!.children!.find(c => c.name === "utils");
    expect(utils).toBeDefined();

    expect(utils!.children![0].name).toBe("helper.ts");
  });

  test("handles empty directory", () => {
    const result = traverseDirectory(tempDir, []);

    expect(result.type).toBe("directory");
    expect(result.children).toHaveLength(0);
  });
});

// =============================================================================
// traverseDirectory — Depth limiting tests
//
// Verifies that the maxDepth parameter correctly caps how deep the traversal
// goes. Directories beyond the limit appear as empty (no children).
// =============================================================================

describe("traverseDirectory depth limiting", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "treeviz-depth-"));
    // Create structure: root/a/b/c/deep.txt
    mkdirSync(join(tempDir, "a", "b", "c"), { recursive: true });
    writeFileSync(join(tempDir, "a", "b", "c", "deep.txt"), "");
    writeFileSync(join(tempDir, "root.txt"), "");
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test("depth 0 shows only root-level entries without expanding directories", () => {
    const result = traverseDirectory(tempDir, [], 0);

    const dirA = result.children!.find(c => c.name === "a");
    expect(dirA).toBeDefined();
    expect(dirA!.type).toBe("directory");
    // Directory listed but not traversed — no children
    expect(dirA!.children).toBeUndefined();

    // Root-level file is still present
    expect(result.children!.find(c => c.name === "root.txt")).toBeDefined();
  });

  test("depth 1 traverses one level deep", () => {
    const result = traverseDirectory(tempDir, [], 1);

    const dirA = result.children!.find(c => c.name === "a");
    expect(dirA!.children).toBeDefined();

    const dirB = dirA!.children!.find(c => c.name === "b");
    expect(dirB).toBeDefined();
    expect(dirB!.type).toBe("directory");
    // b is at depth 1, so it's listed but not expanded
    expect(dirB!.children).toBeUndefined();
  });

  test("depth 2 traverses two levels deep", () => {
    const result = traverseDirectory(tempDir, [], 2);

    const dirC = result
      .children!.find(c => c.name === "a")!
      .children!.find(c => c.name === "b")!
      .children!.find(c => c.name === "c");

    expect(dirC).toBeDefined();
    expect(dirC!.type).toBe("directory");
    // c is at depth 2, listed but not expanded
    expect(dirC!.children).toBeUndefined();
  });

  test("depth 3 reaches the deepest file", () => {
    const result = traverseDirectory(tempDir, [], 3);

    const dirC = result
      .children!.find(c => c.name === "a")!
      .children!.find(c => c.name === "b")!
      .children!.find(c => c.name === "c");

    expect(dirC!.children).toBeDefined();
    expect(dirC!.children!.find(c => c.name === "deep.txt")).toBeDefined();
  });

  test("Infinity depth behaves same as no limit", () => {
    const limited = traverseDirectory(tempDir, [], Infinity);
    const unlimited = traverseDirectory(tempDir, []);

    expect(generateAsciiTree(limited)).toBe(generateAsciiTree(unlimited));
  });
});

// =============================================================================
// traverseDirectory — Symlink safety tests
//
// Verifies that symlinks are skipped by default, followed when opted in,
// and that circular symlinks don't cause infinite loops.
// =============================================================================

describe("traverseDirectory symlink handling", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "treeviz-symlink-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test("skips symlinks by default", () => {
    mkdirSync(join(tempDir, "real-dir"));
    writeFileSync(join(tempDir, "real-dir", "file.txt"), "");
    symlinkSync(join(tempDir, "real-dir"), join(tempDir, "link-dir"));
    writeFileSync(join(tempDir, "real-file.txt"), "");
    symlinkSync(join(tempDir, "real-file.txt"), join(tempDir, "link-file.txt"));

    const result = traverseDirectory(tempDir, []);
    const names = result.children!.map(c => c.name);

    expect(names).toContain("real-dir");
    expect(names).toContain("real-file.txt");
    expect(names).not.toContain("link-dir");
    expect(names).not.toContain("link-file.txt");
  });

  test("follows symlinks when followSymlinks is true", () => {
    mkdirSync(join(tempDir, "real-dir"));
    writeFileSync(join(tempDir, "real-dir", "file.txt"), "");
    symlinkSync(join(tempDir, "real-dir"), join(tempDir, "link-dir"));

    const result = traverseDirectory(tempDir, [], Infinity, 0, true);
    const names = result.children!.map(c => c.name);

    expect(names).toContain("real-dir");
    expect(names).toContain("link-dir");

    const linkDir = result.children!.find(c => c.name === "link-dir");
    expect(linkDir!.children!.find(c => c.name === "file.txt")).toBeDefined();
  });

  test("prevents infinite loops from circular symlinks", () => {
    // Create: a/ -> symlink to parent (circular)
    mkdirSync(join(tempDir, "a"));
    writeFileSync(join(tempDir, "a", "file.txt"), "");
    symlinkSync(tempDir, join(tempDir, "a", "loop"));

    // Should not hang or throw — the cycle is detected and skipped
    const result = traverseDirectory(tempDir, [], Infinity, 0, true);

    const dirA = result.children!.find(c => c.name === "a");
    expect(dirA).toBeDefined();
    expect(dirA!.children!.find(c => c.name === "file.txt")).toBeDefined();
    // The circular "loop" symlink should be skipped (already visited)
    expect(dirA!.children!.find(c => c.name === "loop")).toBeUndefined();
  });

  test("skips broken symlinks gracefully", () => {
    writeFileSync(join(tempDir, "real.txt"), "");
    symlinkSync(join(tempDir, "nonexistent"), join(tempDir, "broken-link"));

    // Should not throw
    const result = traverseDirectory(tempDir, [], Infinity, 0, true);
    const names = result.children!.map(c => c.name);

    expect(names).toContain("real.txt");
    expect(names).not.toContain("broken-link");
  });
});
