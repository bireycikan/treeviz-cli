import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs";
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
