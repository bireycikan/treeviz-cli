import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { traverseDirectory, MAX_ENTRIES } from "../src/traverser";

// =============================================================================
// Security tests
//
// Verifies max entry limit prevents resource exhaustion on huge directories.
// =============================================================================

describe("max entry limit", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "treeviz-security-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test("MAX_ENTRIES constant is defined", () => {
    expect(MAX_ENTRIES).toBe(10_000);
  });

  test("entryCount tracks total entries traversed", () => {
    // Create 5 files
    for (let i = 0; i < 5; i++) {
      writeFileSync(join(tempDir, `file-${i}.txt`), "");
    }
    mkdirSync(join(tempDir, "sub"));
    writeFileSync(join(tempDir, "sub", "nested.txt"), "");

    const counter = { value: 0 };
    traverseDirectory(tempDir, [], Infinity, 0, false, new Set(), counter);

    // 5 files + 1 dir + 1 nested file = 7
    expect(counter.value).toBe(7);
  });

  test("stops traversal when entry limit is reached", () => {
    // Create more files than limit allows (use a small counter to simulate)
    for (let i = 0; i < 10; i++) {
      writeFileSync(join(tempDir, `file-${i}.txt`), "");
    }

    // Start counter near the limit to simulate hitting it
    const counter = { value: MAX_ENTRIES - 3 };
    const result = traverseDirectory(
      tempDir,
      [],
      Infinity,
      0,
      false,
      new Set(),
      counter
    );

    // Should have at most 3 children (the limit was reached after 3 more entries)
    expect(result.children!.length).toBeLessThanOrEqual(3);
  });
});
