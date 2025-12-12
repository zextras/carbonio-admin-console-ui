#!/usr/bin/env node
 

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
	blue: '\x1b[0;34m',
	yellow: '\x1b[0;33m',
	red: '\x1b[0;31m',
	reset: '\x1b[0m'
};

function log(message, color = 'reset') {
	// eslint-disable-next-line no-console
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
	log(`${step}`, 'blue');
}

function logError(message) {
	log(`${message}`, 'red');
}

function logWarning(message) {
	log(`${message}`, 'yellow');
}

function findRootDir(currentDir) {
	let dir = currentDir;

	while (dir !== path.dirname(dir)) {
		// Stop at filesystem root
		const packageJsonPath = path.join(dir, 'package.json');
		if (fs.existsSync(packageJsonPath)) {
			try {
				const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
				if (packageJson.workspaces || packageJson.name === 'admin-ui') {
					return dir;
				}
			} catch (error) {
				// Invalid package.json, continue searching
			}
		}
		dir = path.dirname(dir);
	}
}

function performReset() {
	const steps = [
		{
			name: 'Removing root node_modules',
			command: 'rm -rf node_modules'
		},
		{
			name: 'Removing app node_modules',
			command: 'rm -rf apps/*/node_modules'
		},
		{
			name: 'Removing lock file',
			command: 'rm -rf pnpm-lock.yaml'
		},
		{
			name: 'Removing turbo cache',
			command: 'rm -rf .turbo'
		},
		{
			name: 'Pruning pnpm store',
			command: 'pnpm store prune --force'
		},
		{
			name: 'Installing dependencies',
			command: 'pnpm install'
		}
	];

	const currentDir = process.cwd();
	let rootDir;

	try {
		rootDir = findRootDir(currentDir);

		if (currentDir !== rootDir) {
			process.chdir(rootDir);
			logWarning(`Switched to root directory: ${rootDir}`);
		}

		logStep('Starting monorepo reset...');
		log(`Working directory: ${rootDir}`, 'blue');

		for (const step of steps) {
			logStep(step.name);
			try {
				execSync(step.command, {
					stdio: 'inherit',
					cwd: rootDir
				});
			} catch (error) {
				logError(`Failed: ${step.name}`);
				throw error;
			}
		}
	} catch (error) {
		logError('Reset failed. Please check the error above and try again.');
		process.exit(1);
	}
}

performReset();
