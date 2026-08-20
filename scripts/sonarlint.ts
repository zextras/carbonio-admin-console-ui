/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable no-console */
import { execSync } from 'child_process';

import { colorLog, type ColorName } from './utils';

const SONAR_URL = 'https://sonar.zextras.tools';
const PROJECT_KEY = 'carbonio-admin-console-ui';
const PAGE_SIZE = 500;

type Severity = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';

const SEVERITY_COLORS: Record<Severity, ColorName> = {
	BLOCKER: 'red',
	CRITICAL: 'red',
	MAJOR: 'orange',
	MINOR: 'yellow',
	INFO: 'gray',
};

type SonarIssue = {
	key: string;
	rule: string;
	severity: Severity;
	component: string;
	project: string;
	line?: number;
	message: string;
	textRange?: {
		startLine: number;
		endLine: number;
		startOffset: number;
		endOffset: number;
	};
};

type ParsedArgs = {
	app?: string;
	file?: string;
	severity?: string;
	rule?: string;
	branch?: string;
	pr?: string;
	help: boolean;
};

function parseArgs(args: string[]): ParsedArgs {
	const parsed: ParsedArgs = { help: false };
	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case '--app':
				parsed.app = args[++i];
				break;
			case '--file':
				parsed.file = args[++i];
				break;
			case '--severity':
				parsed.severity = args[++i]?.toUpperCase();
				break;
			case '--rule':
				parsed.rule = args[++i];
				break;
			case '--branch':
				parsed.branch = args[++i];
				break;
			case '--pr':
				parsed.pr = args[++i];
				break;
			case '--help':
			case '-h':
				parsed.help = true;
				break;
		}
	}
	return parsed;
}

function printHelp(): void {
	console.log(`
Usage: pnpm sonarlint [options]

Fetch unresolved SonarQube issues from the current git branch or pull request.

Options:
  --app <module>       Filter by module (e.g. admin-ui-cos, admin-ui-domains)
  --file <pattern>     Filter by file path substring
  --severity <levels>  Filter by severity (BLOCKER, CRITICAL, MAJOR, MINOR, INFO)
                       Comma-separated for multiple: --severity BLOCKER,CRITICAL
  --rule <S-number>    Filter by rule (e.g. S7735)
  --branch <name>      Override auto-detected git branch
  --pr <number>        Query by pull request number (auto-detected from current branch)
  --help, -h           Show this help

Environment:
  SONAR_API_KEY        SonarQube API token (required)

Examples:
  pnpm sonarlint
  pnpm sonarlint --pr
  pnpm sonarlint --pr 1211
  pnpm sonarlint --app admin-ui-cos
  pnpm sonarlint --file cos-list-panel.tsx
  pnpm sonarlint --severity BLOCKER,CRITICAL
  pnpm sonarlint --rule S7735
  pnpm sonarlint --branch main --app admin-ui-cos
`);
}

function getGitBranch(): string {
	try {
		return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
	} catch {
		colorLog('Warning: Could not detect git branch, using "main"', 'orange');
		return 'main';
	}
}

function getPullRequestNumber(): string | undefined {
	try {
		const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
		const output = execSync(`gh pr list --head "${branch}" --json number --jq ".[0].number"`, {
			encoding: 'utf-8',
		}).trim();
		return output || undefined;
	} catch {
		return undefined;
	}
}

function stripProjectKey(component: string): string {
	return component.replace(new RegExp(`^${PROJECT_KEY}:`), '');
}

async function fetchIssues(
	token: string,
	branch?: string,
	pullRequest?: string,
	severities?: string,
	rule?: string,
): Promise<Array<SonarIssue>> {
	const allIssues: Array<SonarIssue> = [];
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const params = new URLSearchParams({
			componentKeys: PROJECT_KEY,
			resolved: 'false',
			ps: String(PAGE_SIZE),
			p: String(page),
			additionalFields: '_all',
		});

		if (pullRequest) {
			params.set('pullRequest', pullRequest);
		} else if (branch) {
			params.set('branch', branch);
		}

		if (severities) {
			params.set('severities', severities);
		}
		if (rule) {
			const ruleKey =
				rule.includes(':') ? rule : `typescript:${rule.replace(/^S/, 'S')}`;
			params.set('rules', ruleKey);
		}

		const url = `${SONAR_URL}/api/issues/search?${params.toString()}`;
		const response = await fetch(url, {
			headers: {
				Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
			},
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('Authentication failed. Check your SONAR_API_KEY.');
			}
			throw new Error(`SonarQube API error: ${response.status} ${response.statusText}`);
		}

		const data = (await response.json()) as {
			issues: Array<SonarIssue>;
			total: number;
		};
		const issues = data.issues ?? [];
		allIssues.push(...issues);

		const total = data.total ?? 0;
		hasMore = allIssues.length < total && issues.length === PAGE_SIZE;
		page++;
	}

	return allIssues;
}

const APP_PATHS: Record<string, string> = {
	'admin-ui-backup': 'apps/admin-ui-backup/',
	'admin-ui-bootstrap': 'apps/admin-ui-bootstrap/',
	'admin-ui-cos': 'apps/admin-ui-cos/',
	'admin-ui-dashboard': 'apps/admin-ui-dashboard/',
	'admin-ui-domains': 'apps/admin-ui-domains/',
	'admin-ui-legalhold': 'apps/admin-ui-legalhold/',
	'admin-ui-mta': 'apps/admin-ui-mta/',
	'admin-ui-notifications': 'apps/admin-ui-notifications/',
	'admin-ui-operations': 'apps/admin-ui-operations/',
	'admin-ui-privacy': 'apps/admin-ui-privacy/',
	'admin-ui-storage': 'apps/admin-ui-storage/',
	'admin-ui-subscription': 'apps/admin-ui-subscription/',
	'ui-components': 'packages/ui-components/',
	'ui-shared': 'packages/ui-shared/',
};

function filterByApp(issues: Array<SonarIssue>, app: string): Array<SonarIssue> {
	const appPath = APP_PATHS[app] ?? `apps/${app}/`;
	return issues.filter((i) => stripProjectKey(i.component).startsWith(appPath));
}

function groupByFile(issues: Array<SonarIssue>): Map<string, Array<SonarIssue>> {
	const groups = new Map<string, Array<SonarIssue>>();
	for (const issue of issues) {
		const filePath = stripProjectKey(issue.component);
		const existing = groups.get(filePath) ?? [];
		existing.push(issue);
		groups.set(filePath, existing);
	}
	return groups;
}

function formatRule(rule: string): string {
	const short = rule.replace('typescript:', '').replace('javascript:', '');
	return short;
}

function printIssues(issues: Array<SonarIssue>, fileFilter?: string): number {
	let filtered = issues;
	if (fileFilter) {
		const filter = fileFilter.toLowerCase();
		filtered = issues.filter((i) => stripProjectKey(i.component).toLowerCase().includes(filter));
	}

	if (filtered.length === 0) {
		colorLog('No issues found.', 'green');
		return 0;
	}

	const grouped = groupByFile(filtered);
	const sortedFiles = [...grouped.keys()].sort();
	let totalIssues = 0;

	for (const filePath of sortedFiles) {
		const fileIssues = grouped.get(filePath) ?? [];
		console.log('');
		colorLog(`  ${filePath} (${fileIssues.length})`, 'cyan');

		const sorted = [...fileIssues].sort((a, b) => (a.line ?? 0) - (b.line ?? 0));

		for (const issue of sorted) {
			const line = issue.line ?? issue.textRange?.startLine ?? '?';
			const color = SEVERITY_COLORS[issue.severity] ?? 'reset';
			const severity = issue.severity.padEnd(8);
			const rule = formatRule(issue.rule);
			colorLog(`    ${line}:${severity}${rule}  ${issue.message}`, color);
			totalIssues++;
		}
	}

	return totalIssues;
}

async function main(): Promise<void> {
	const args = parseArgs(process.argv.slice(2));

	if (args.help) {
		printHelp();
		return;
	}

	const token = process.env.SONAR_API_KEY;
	if (!token) {
		colorLog('Error: SONAR_API_KEY environment variable is not set.', 'red');
		console.log('Generate a token at https://sonar.zextras.tools/account/security');
		process.exit(1);
	}

	let prNumber: string | undefined;
	let branch: string | undefined;

	if (args.pr !== undefined) {
		prNumber = args.pr || getPullRequestNumber();
		if (!prNumber) {
			colorLog('Error: Could not auto-detect PR number. Use --pr <number>', 'red');
			process.exit(1);
		}
	} else if (args.branch) {
		branch = args.branch;
	} else {
		prNumber = getPullRequestNumber();
		if (!prNumber) {
			branch = getGitBranch();
		}
	}

	colorLog(`\nSonarQube: ${SONAR_URL}`, 'gray');
	colorLog(`Project:   ${PROJECT_KEY}`, 'gray');
	if (prNumber) {
		colorLog(`PR:        #${prNumber}`, 'gray');
	} else {
		colorLog(`Branch:    ${branch}`, 'gray');
	}
	if (args.app) colorLog(`Module:    ${args.app}`, 'gray');
	if (args.severity) colorLog(`Severity:  ${args.severity}`, 'gray');
	if (args.rule) colorLog(`Rule:      ${args.rule}`, 'gray');
	if (args.file) colorLog(`File:      ${args.file}`, 'gray');
	console.log('');

	colorLog('Fetching issues...', 'blue');
	let issues = await fetchIssues(token, branch, prNumber, args.severity, args.rule);

	if (args.app) {
		issues = filterByApp(issues, args.app);
	}

	const total = printIssues(issues, args.file);

	console.log('');
	const summaryParts: Array<string> = [];
	if (args.app) summaryParts.push(`app=${args.app}`);
	if (args.file) summaryParts.push(`file=${args.file}`);
	if (args.severity) summaryParts.push(`severity=${args.severity}`);
	if (args.rule) summaryParts.push(`rule=${args.rule}`);
	const summarySuffix = summaryParts.length > 0 ? ` (${summaryParts.join(', ')})` : '';

	const ref = prNumber ? `PR #${prNumber}` : `branch "${branch}"`;
	if (total > 0) {
		colorLog(`Found ${total} issue${total !== 1 ? 's' : ''}${summarySuffix} on ${ref}`, 'orange');
	} else {
		colorLog(`No issues found${summarySuffix} on ${ref}`, 'green');
	}
}

main().catch((err: Error) => {
	colorLog(`Error: ${err.message}`, 'red');
	process.exit(1);
});
