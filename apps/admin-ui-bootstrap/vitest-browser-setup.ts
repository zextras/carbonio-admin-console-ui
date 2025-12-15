/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

(globalThis as any).__CARBONIO_DEV__ = false;
(globalThis as any).BASE_PATH = '';

import 'vitest-browser-react';

import { resetMockWorker, startMockWorker, stopMockWorker } from 'admin-ui-test-utils';
import { beforeAll, afterAll, vi, afterEach, beforeEach } from 'vitest';

const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
});

beforeAll(async () => {
	await startMockWorker();
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
