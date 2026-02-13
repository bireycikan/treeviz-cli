import { describe, test, expect } from "bun:test";
import type { TreeNode } from "../src/types";
import { generateAsciiTree } from "../src/tree-generator";

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
