#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from "child_process";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const remoteHost = process.argv[2];

if (!remoteHost) {
  console.error(
    "❌ Error: Please provide the remote host as a command-line argument.",
  );
  console.log("Usage: node deploy.js <remote_host>");
  process.exit(1);
}

// --- CONFIGURATION ---
const CONFIG = {
  remoteUser: "root",
  remoteHost: remoteHost,
  remoteDest: "/tmp",
  artifactsDir: "./artifacts/ubuntu-jammy",
  packagePattern: "carbonio-admin-console-ui",
};

// Helper to run shell commands with live output
const run = (command) => {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { stdio: "inherit", encoding: "utf-8" });
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}`);
    process.exit(1);
  }
};

const main = () => {
  console.log(`🚀 Starting deployment to host: **${CONFIG.remoteHost}**`);

  // 1. Build the unified package and create .deb files
  console.log("🔨 Starting Build...");
  run("pnpm build:unified -- --dev");

  // 2. Create the .deb packages
  console.log("📦 Packaging...");
  run("./scripts/build_packages.sh");

  // 3. find the newest .deb file in the artifacts directory
  console.log("🔍 Searching for the newest artifact...");

  const filesInDir = readdirSync(CONFIG.artifactsDir);

  const matchingFiles = filesInDir
    .filter(
      (file) => file.startsWith(CONFIG.packagePattern) && file.endsWith(".deb"),
    )
    .map((file) => {
      const filePath = join(CONFIG.artifactsDir, file);
      return {
        name: file,
        path: filePath,
        time: statSync(filePath).mtimeMs,
      };
    })
    .sort((a, b) => b.time - a.time);

  const newestArtifact = matchingFiles[0];

  if (!newestArtifact) {
    console.error(
      `❌ Could not find a .deb file in ${CONFIG.artifactsDir} matching the pattern.`,
    );
    process.exit(1);
  }

  const debFile = newestArtifact.name;

  if (!debFile) {
    console.error(`❌ Could not find a .deb file in ${CONFIG.artifactsDir}`);
    process.exit(1);
  }

  const localPath = join(CONFIG.artifactsDir, debFile);
  console.log(`✅ Found artifact: ${debFile}`);

  // 4. SCP the file
  console.log("⬆️ Uploading to server...");
  run(
    `scp ${localPath} ${CONFIG.remoteUser}@${CONFIG.remoteHost}:${CONFIG.remoteDest}`,
  );

  // 5. SSH and Install
  console.log("🛠️ Installing on remote...");
  const remotePath = `${CONFIG.remoteDest}/${debFile}`;
  run(
    `ssh ${CONFIG.remoteUser}@${CONFIG.remoteHost} "apt install ${remotePath} --reinstall -y"`,
  );

  console.log("\n✨ Deployment Complete!");
};

main();
