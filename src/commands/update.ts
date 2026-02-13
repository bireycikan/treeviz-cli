import { spawnSync } from "child_process";

export function update(currentVersion: string) {
  console.log(`Current version: ${currentVersion}`);
  console.log("Checking for updates to latest version...");

  try {
    const viewResult = spawnSync("npm", ["view", "treeviz-cli", "version"], {
      encoding: "utf-8",
    });

    if (viewResult.status !== 0) {
      throw new Error("Failed to check version");
    }

    const latest = viewResult.stdout.trim();

    if (latest === currentVersion) {
      console.log(`Already on the latest version (${currentVersion}).`);
      process.exit(0);
    }

    const installResult = spawnSync(
      "npm",
      ["install", "-g", "treeviz-cli@latest"],
      { stdio: "pipe" }
    );

    if (installResult.status !== 0) {
      throw new Error("Failed to install");
    }

    console.log(
      `Successfully updated from ${currentVersion} to version ${latest}`
    );
  } catch {
    console.error("Error: Failed to update treeviz-cli.");
    process.exit(1);
  }
}
