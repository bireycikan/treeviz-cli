import { spawnSync } from "child_process";

export function copyToClipboard(output: string) {
  const pbcopy = spawnSync("pbcopy", [], { input: output });
  if (pbcopy.status === 0) {
    console.log("\n✓ Copied to clipboard");
  } else {
    const xclip = spawnSync("xclip", ["-selection", "clipboard"], {
      input: output,
    });
    if (xclip.status === 0) {
      console.log("\n✓ Copied to clipboard");
    } else {
      console.error("\n✗ Could not copy to clipboard (pbcopy/xclip not found)");
    }
  }
}
