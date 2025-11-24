#!/usr/bin/env node

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Test script to validate ESM build output
 * Checks that the build produces correct ESM modules
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const projectRoot = process.cwd();
const commitHash = process.env.COMMIT_HASH || execSync('git rev-parse HEAD').toString().trim();
const distDir = join(projectRoot, 'dist', 'esm', commitHash);

let errors = 0;
let warnings = 0;

function error(message) {
	console.error(`❌ ERROR: ${message}`);
	errors++;
}

function warn(message) {
	console.warn(`⚠️  WARNING: ${message}`);
	warnings++;
}

function success(message) {
	console.log(`✅ ${message}`);
}

function info(message) {
	console.log(`ℹ️  ${message}`);
}

console.log('🧪 Testing ESM build output...\n');

// Test 1: Build directory is correctly generated
if (!existsSync(distDir)) {
	error(`Build directory does not exist: ${distDir}`);
	console.log('\n❌ Tests failed. Run "pnpm build:esm" first.');
	process.exit(1);
}
success('Build directory exists');

// Test 2: Find entry point file
const files = readdirSync(distDir);
const jsFiles = files.filter((f) => f.endsWith('.js') && !f.endsWith('.map'));
const entryFile = jsFiles.find((f) => f.startsWith('index.'));

if (entryFile) {
	success(`Entry point found: ${entryFile}`);
} else {
	error('Entry point file (index.*.js) not found');
	info(`Available JS files: ${jsFiles.join(', ')}`);
}

// Test 3: Check entry file is ESM format
if (entryFile) {
	const entryPath = join(distDir, entryFile);
	const content = readFileSync(entryPath, 'utf-8');

	// Check for ES module syntax
	const hasImport = /^import\s+/m.test(content);
	const hasExport = /^export\s+/m.test(content);
	const hasESMExportDefault = /export\s*{\s*\w+\s+as\s+default\s*}/m.test(content);

	if (hasImport || hasExport || hasESMExportDefault) {
		success('Entry file uses ES module syntax');
	} else {
		error('Entry file does not use ES module syntax (no import/export found)');
	}

	// Check file size is reasonable (not empty, not too large)
	const stats = statSync(entryPath);
	if (stats.size === 0) {
		error('Entry file is empty');
	} else if (stats.size < 50) {
		warn('Entry file is very small - might be incomplete');
	} else {
		success(`Entry file size: ${(stats.size / 1024).toFixed(2)} KB`);
	}
}

// Test 4: Check for chunk files (code splitting)
const chunkFiles = files.filter((f) => f.includes('.chunk.') && f.endsWith('.js'));
if (chunkFiles.length > 0) {
	success(`Code splitting enabled: ${chunkFiles.length} chunk(s) found`);
	for (const chunk of chunkFiles) {
		info(`  - ${chunk}`);
	}

	// Verify chunks are also ESM format
	const firstChunk = join(distDir, chunkFiles[0]);
	const chunkContent = readFileSync(firstChunk, 'utf-8');
	const hasImportInChunk = /^import\s+/m.test(chunkContent);
	const hasExportInChunk = /^export\s+/m.test(chunkContent);

	if (hasImportInChunk || hasExportInChunk) {
		success('Chunk files use ES module syntax');
	} else {
		warn('Chunk files may not be using ES module syntax');
	}
} else {
	warn('No chunk files found - code splitting may not be working');
}

// Test 5: Check for source maps
const mapFiles = files.filter((f) => f.endsWith('.js.map'));
if (mapFiles.length > 0) {
	success(`Source maps generated: ${mapFiles.length} file(s)`);
} else {
	warn('No source maps found');
}

// Test 6: Check total bundle size
const totalSize = files
	.filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
	.reduce((sum, f) => sum + statSync(join(distDir, f)).size, 0);

info(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
if (totalSize > 5 * 1024 * 1024) {
	warn('Bundle size is quite large (>5MB) - check if all dependencies are externalized');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary:');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
	console.log('✅ All tests passed! ESM build is valid.');
	process.exit(0);
} else {
	console.log(`❌ Errors: ${errors}`);
	console.log(`⚠️  Warnings: ${warnings}`);

	if (errors > 0) {
		console.log('\n❌ Tests failed. Please fix the errors above.');
		process.exit(1);
	} else {
		console.log('\n⚠️  Tests passed with warnings. Review warnings above.');
		process.exit(0);
	}
}
