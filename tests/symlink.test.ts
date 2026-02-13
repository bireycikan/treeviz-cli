import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { traverseDirectory } from "../src/tree-generator";

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
