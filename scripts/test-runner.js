#!/usr/bin/env node

import { execSync } from "child_process";

const args = process.argv.slice(2);

if (args.length === 0) {
  execSync("turbo run test", { stdio: "inherit", cwd: process.cwd() });
} else {
  const testPattern = args[0];

  const turboCommand = `turbo run test --filter="@zextras/admin-ui-*" -- --run ${testPattern}`;
  execSync(turboCommand, { stdio: "inherit", cwd: process.cwd() });
}
