/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import 'vitest-browser-react';

import { resetMockWorker, startMockWorker, stopMockWorker } from 'admin-ui-test-utils';
import { beforeAll, afterAll, vi, afterEach } from 'vitest';

vi.stubGlobal('__CARBONIO_DEV__', false);
vi.stubGlobal('BASE_PATH', '');

beforeAll(async () => {
	await startMockWorker();
	vi.mock('@zextras/admin-ui-bootstrap');
});

beforeEach(() => {
	resetMockWorker();
});

afterAll(() => {
	stopMockWorker();
	vi.clearAllMocks();
});

afterEach(() => {
	vi.unstubAllGlobals();
});
