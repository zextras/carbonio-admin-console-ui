/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import 'vitest-browser-react';

import { resetMockWorker, startMockWorker, stopMockWorker } from 'admin-ui-test-utils';
import { beforeAll, afterAll, vi, afterEach, beforeEach } from 'vitest';

// Mock only the history functions at the top level (vi.mock is hoisted)
vi.mock('@zextras/admin-ui-bootstrap', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@zextras/admin-ui-bootstrap')>();
	return {
		...actual,
		replaceHistory: vi.fn(),
		pushHistory: vi.fn()
	};
});

vi.stubGlobal('__CARBONIO_DEV__', false);
vi.stubGlobal('BASE_PATH', '');

beforeAll(async () => {
	await startMockWorker();
	
	// Suppress MSW internal errors that occur during cleanup
	window.addEventListener('unhandledrejection', (event) => {
		// Suppress MSW deserializeRequest errors that occur during cleanup
		if (event.reason?.message?.includes('Cannot read properties of undefined')) {
			event.preventDefault();
			console.warn('Suppressed MSW cleanup error:', event.reason.message);
		}
	});
});

beforeEach(() => {
	resetMockWorker();
});

afterAll(() => {
	stopMockWorker();
	vi.clearAllMocks();
	resetMockWorker();
});

afterEach(() => {
	vi.unstubAllGlobals();
	resetMockWorker();
});
