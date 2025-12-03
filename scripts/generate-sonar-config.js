#!/usr/bin/env node
/* eslint-disable no-console */
//
// SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only
//

const fs = require('fs');
const path = require('path');

const colors = {
	green: '\x1b[0;32m',
	blue: '\x1b[0;34m',
	yellow: '\x1b[0;33m',
	red: '\x1b[0;31m',
	reset: '\x1b[0m'
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function logWarning(message) {
	log(`Warning: ${message}`, 'yellow');
}

function logError(message) {
	log(`Error: ${message}`, 'red');
}

function logSuccess(message) {
	log(message, 'green');
}

function logInfo(message) {
	log(message, 'blue');
}

// Common properties template for all admin-ui modules
const commonTemplate = {
	testInclusions: '**/*.test.**,**/mocks/**/*,**/test*.*.ts*,**/mock*.ts*,**/types/*,**/tests/**',
	exclusions:
		'**/*.test.*,**/mocks/**/*,**/test*.*.ts*,**/mock*.ts*,**/types/*,**/node_modules/**,pnpm*',
	cpdExclusions: '**/*.test.*',
	coverageExclusions: '**/*.test.*,**/mocks/**/*,**/test*.ts*,**/mock*.ts*,**/types/*,**/*.d.ts',
	lcovReportPaths: 'coverage/lcov.info',
	sources: 'src/',
	typescriptConfig: 'tsconfig.json',
	tests: 'src/'
};

// Special case overrides
const specialCases = {
	'admin-ui-sdk': {
		projectBaseDir: 'packages/sdk',
		sources: 'scripts/',
		typescriptConfig: null,
		tests: null,
		excludeCoverage: true,
		exclusions:
			'**/*.test.*,**/mocks/**/*,**/test*.*.ts*,**/mock*.ts*,**/types/*,**/node_modules/**,pnpm*'
	}
};

function validateModuleDirectory(moduleName, basePath) {
	const fullPath = path.join(basePath, moduleName);

	if (!fs.existsSync(fullPath)) {
		logError(`Directory does not exist: ${fullPath}`);
		return false;
	}

	if (!fs.statSync(fullPath).isDirectory()) {
		logError(`Path is not a directory: ${fullPath}`);
		return false;
	}

	const packageJsonPath = path.join(fullPath, 'package.json');
	if (!fs.existsSync(packageJsonPath)) {
		logWarning(`No package.json found in: ${fullPath}`);
		return false;
	}

	return true;
}

function readModuleMetadata(moduleName, basePath) {
	const fullPath = path.join(basePath, moduleName);
	const packageJsonPath = path.join(fullPath, 'package.json');

	try {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
		return {
			name: moduleName,
			displayName: packageJson.name || moduleName,
			carbonioConfig: packageJson.carbonio || {}
		};
	} catch (error) {
		logWarning(`Could not read package.json for ${moduleName}: ${error.message}`);
		return {
			name: moduleName,
			displayName: moduleName,
			carbonioConfig: {}
		};
	}
}

function discoverSonarModules() {
	const rootDir = __dirname;
	const appsDir = path.join(rootDir, '..', 'apps');
	const packagesDir = path.join(rootDir, '..', 'packages');

	const modules = [];

	// Discover admin-ui-* directories in apps/
	if (fs.existsSync(appsDir)) {
		const adminUiDirs = fs
			.readdirSync(appsDir)
			.filter(
				(dir) => dir.startsWith('admin-ui-') && fs.statSync(path.join(appsDir, dir)).isDirectory()
			);

		for (const dir of adminUiDirs) {
			if (validateModuleDirectory(dir, appsDir)) {
				const metadata = readModuleMetadata(dir, appsDir);
				modules.push({
					...metadata,
					projectBaseDir: `apps/${dir}`,
					type: 'admin-ui'
				});
			}
		}
	}

	// Always include admin-ui-sdk as special case
	const sdkPath = path.join(packagesDir, 'sdk');
	if (fs.existsSync(sdkPath)) {
		if (validateModuleDirectory('sdk', packagesDir)) {
			const metadata = readModuleMetadata('sdk', packagesDir);
			modules.push({
				...metadata,
				name: 'admin-ui-sdk',
				projectBaseDir: 'packages/sdk',
				type: 'sdk'
			});
		}
	} else {
		logWarning('SDK module not found at packages/sdk');
	}

	// Sort modules: admin-ui components first, then SDK, alphabetically within each group
	modules.sort((a, b) => {
		if (a.type !== b.type) {
			return a.type === 'admin-ui' ? -1 : 1;
		}
		return a.name.localeCompare(b.name);
	});

	return modules;
}

function generateModuleProperties(module) {
	const specialCase = specialCases[module.name];
	const properties = { ...commonTemplate };

	// Apply special case overrides if any
	if (specialCase) {
		Object.assign(properties, specialCase);
	}

	// Generate module-specific properties
	const moduleProps = [
		`${module.name}.sonar.projectKey=carbonio-admin-console-ui:${module.name}`,
		`${module.name}.sonar.projectBaseDir=${module.projectBaseDir}`
	];

	// Add sources
	if (properties.sources) {
		moduleProps.push(`${module.name}.sonar.sources=${properties.sources}`);
	}

	// Add TypeScript configuration (only for non-SDK modules)
	if (properties.typescriptConfig) {
		const tsConfigProperty = 'sonar.typescript.tsconfigPath';
		moduleProps.push(`${module.name}.${tsConfigProperty}=${properties.typescriptConfig}`);
	}

	// Add tests (only for non-SDK modules)
	if (properties.tests) {
		moduleProps.push(`${module.name}.sonar.tests=${properties.tests}`);
		moduleProps.push(`${module.name}.sonar.test.inclusions=${properties.testInclusions}`);
	}

	// Add exclusions
	moduleProps.push(`${module.name}.sonar.exclusions=${properties.exclusions}`);
	moduleProps.push(`${module.name}.sonar.cpd.exclusions=${properties.cpdExclusions}`);

	// Add coverage (only for non-SDK modules)
	if (!properties.excludeCoverage) {
		moduleProps.push(
			`${module.name}.sonar.javascript.lcov.reportPaths=${properties.lcovReportPaths}`
		);
		moduleProps.push(`${module.name}.sonar.coverage.exclusions=${properties.coverageExclusions}`);
	}

	return moduleProps.join('\n');
}

function generateSonarProperties(modules) {
	const moduleNames = modules.map((m) => m.name).join(',');

	const content = [
		'sonar.projectKey=carbonio-admin-console-ui',
		'sonar.projectName=Admin UI monorepo',
		'',
		`# Define the modules`,
		`sonar.modules=${moduleNames}`,
		''
	];

	// Add properties for each module
	for (const module of modules) {
		content.push(`# Properties for the '${module.name}' module`);
		content.push(generateModuleProperties(module));
		content.push('');
	}

	return content.join('\n');
}

function main() {
	const args = process.argv.slice(2);
	const validateOnly = args.includes('--validate-only');
	const rootDir = path.join(__dirname, '..');
	const outputPath = path.join(rootDir, 'sonar-project.properties');

	logInfo('=== Sonar Configuration Generator ===');

	// Discover modules
	const modules = discoverSonarModules();

	if (modules.length === 0) {
		logError('No admin-ui modules found!');
		process.exit(1);
	}

	logInfo(`Found ${modules.length} modules: ${modules.map((m) => m.name).join(', ')}`);

	// Generate properties
	const generatedContent = generateSonarProperties(modules);

	if (validateOnly) {
		logInfo('=== Validation Mode ===');

		if (!fs.existsSync(outputPath)) {
			logError('sonar-project.properties does not exist');
			process.exit(1);
		}

		const existingContent = fs.readFileSync(outputPath, 'utf8');

		if (existingContent.trim() === generatedContent.trim()) {
			logSuccess('✓ Generated configuration matches existing file');
			process.exit(0);
		} else {
			logError('✗ Generated configuration differs from existing file');
			logInfo('Run the script without --validate-only to update the file');
			process.exit(1);
		}
	}

	// Write new configuration
	fs.writeFileSync(outputPath, generatedContent);

	logSuccess(`✓ Generated sonar configuration: ${outputPath}`);
	logInfo(`Configured modules: ${modules.map((m) => m.name).join(', ')}`);

	// Show summary of special cases handled
	const specialModules = modules.filter((m) => specialCases[m.name]);
	if (specialModules.length > 0) {
		logInfo(`Applied special case handling for: ${specialModules.map((m) => m.name).join(', ')}`);
	}
}

if (require.main === module) {
	main();
}

module.exports = {
	generateSonarProperties
};
