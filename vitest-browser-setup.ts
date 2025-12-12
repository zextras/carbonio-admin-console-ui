/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import 'vitest-browser-react';

import { resetMockWorker, startMockWorker, stopMockWorker } from 'admin-ui-test-utils';
import { afterAll, afterEach, beforeAll, beforeEach,vi } from 'vitest';

vi.stubGlobal('__CARBONIO_DEV__', false);
vi.stubGlobal('BASE_PATH', '');

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
