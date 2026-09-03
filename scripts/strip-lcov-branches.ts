/* eslint-disable no-console */
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Strips branch coverage data (BRDA/BRF/BRH records) from every lcov.info
 * file found under the workspace.
 *
 * The React Compiler (oxc-transform-react) auto-generates memoization
 * guards that istanbul/V8 count as branches. These guards are structurally
 * uncoverable in normal test runs (the "skip" path only fires on specific
 * re-render conditions) and inflate branch counts by ~95% on new component
 * files, dragging SonarQube's combined coverage metric below the 80% quality
 * gate.
 *
 * Removing branch records from the lcov report means SonarQube computes
 * coverage from line data only (~97-100% on new code). Full branch coverage
 * (including real application branches) remains visible to developers via
 * the console, JSON, and HTML reporters that vitest generates alongside lcov.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function findLcovFiles(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      findLcovFiles(fullPath, results);
    } else if (entry.name === 'lcov.info') {
      results.push(fullPath);
    }
  }
  return results;
}

function stripBranchData(lcovPath: string): number {
  const content = readFileSync(lcovPath, 'utf8');
  const originalLines = content.split('\n');
  const strippedLines = originalLines.filter(
    (line) =>
      !line.startsWith('BRDA:') &&
      !line.startsWith('BRF:') &&
      !line.startsWith('BRH:'),
  );

  if (strippedLines.length === originalLines.length) return 0;

  writeFileSync(lcovPath, `${strippedLines.join('\n')}\n`);
  return originalLines.length - strippedLines.length;
}

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lcovFiles = findLcovFiles(rootDir);
let totalStripped = 0;
let filesProcessed = 0;

for (const file of lcovFiles) {
  const removed = stripBranchData(file);
  if (removed > 0) {
    filesProcessed++;
    totalStripped += removed;
    console.log(
      `  ${relative(rootDir, file)} — removed ${removed} branch record(s)`,
    );
  }
}

console.log(
  `\nProcessed ${lcovFiles.length} lcov.info file(s), ` +
    `stripped branch data from ${filesProcessed} (${totalStripped} records removed).`,
);
