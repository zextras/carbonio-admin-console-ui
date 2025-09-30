/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { server } from 'admin-ui-test-utils';
import { beforeEach, beforeAll, afterAll, afterEach } from 'vitest';

beforeEach(() => {
	// cleanup local storage
	window.localStorage.clear();
});

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'warn' });
});

afterAll(() => {
	server.close();
});

afterEach(() => {
	server.events.removeAllListeners();
	server.resetHandlers();
});
