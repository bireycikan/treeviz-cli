import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { traverseDirectory } from "../src/traverser";
import { generateAsciiTree } from "../src/formatters";

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
