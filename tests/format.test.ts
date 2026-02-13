import { describe, test, expect } from "bun:test";
import type { TreeNode } from "../src/types";
import {
  generateAsciiTree,
  generateJsonTree,
  generateMarkdownTree,
} from "../src/tree-generator";

// =============================================================================
// Output format tests
//
// Verifies that JSON and Markdown formatters produce correct output from
// TreeNode objects. Also ensures ASCII output remains unchanged.
// =============================================================================

const sampleTree: TreeNode = {
  name: "project",
  type: "directory",
  children: [
    {
      name: "src",
      type: "directory",
      children: [
        { name: "index.ts", type: "file" },
        { name: "utils.ts", type: "file" },
      ],
    },
    { name: "README.md", type: "file" },
  ],
};

describe("generateJsonTree", () => {
  test("produces valid JSON matching the TreeNode structure", () => {
    const output = generateJsonTree(sampleTree);
    const parsed = JSON.parse(output);

    expect(parsed.name).toBe("project");
    expect(parsed.type).toBe("directory");
    expect(parsed.children).toHaveLength(2);
    expect(parsed.children[0].name).toBe("src");
    expect(parsed.children[0].children).toHaveLength(2);
    expect(parsed.children[1].name).toBe("README.md");
  });

  test("handles empty directory", () => {
    const tree: TreeNode = {
      name: "empty",
      type: "directory",
      children: [],
    };

    const output = generateJsonTree(tree);
    const parsed = JSON.parse(output);

    expect(parsed.name).toBe("empty");
    expect(parsed.children).toHaveLength(0);
  });

  test("output is pretty-printed with 2-space indentation", () => {
    const tree: TreeNode = {
      name: "root",
      type: "directory",
      children: [{ name: "file.txt", type: "file" }],
    };

    const output = generateJsonTree(tree);

    expect(output).toContain("\n");
    expect(output).toBe(JSON.stringify(tree, null, 2));
  });
});

describe("generateMarkdownTree", () => {
  test("produces correct nested markdown list", () => {
    const output = generateMarkdownTree(sampleTree);

    const expected = [
      "- project/",
      "- src/",
      "  - index.ts",
      "  - utils.ts",
      "- README.md",
      "",
    ].join("\n");

    expect(output).toBe(expected);
  });

  test("handles empty directory", () => {
    const tree: TreeNode = {
      name: "empty",
      type: "directory",
      children: [],
    };

    const output = generateMarkdownTree(tree);

    expect(output).toBe("- empty/\n");
  });

  test("handles deeply nested structure", () => {
    const tree: TreeNode = {
      name: "root",
      type: "directory",
      children: [
        {
          name: "a",
          type: "directory",
          children: [
            {
              name: "b",
              type: "directory",
              children: [{ name: "deep.txt", type: "file" }],
            },
          ],
        },
      ],
    };

    const output = generateMarkdownTree(tree);

    const expected = ["- root/", "- a/", "  - b/", "    - deep.txt", ""].join(
      "\n"
    );

    expect(output).toBe(expected);
  });
});

describe("format consistency", () => {
  test("all three formats handle the same tree without errors", () => {
    const ascii = generateAsciiTree(sampleTree);
    const json = generateJsonTree(sampleTree);
    const markdown = generateMarkdownTree(sampleTree);

    expect(ascii).toContain("project/");
    expect(json).toContain('"project"');
    expect(markdown).toContain("- project/");
  });
});
