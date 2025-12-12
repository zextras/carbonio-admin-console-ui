/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { server } from 'admin-ui-test-utils';
import { noop } from 'lodash-es';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

vi.stubGlobal('__CARBONIO_DEV__', false);
vi.stubGlobal('BASE_PATH', '');

window.matchMedia = function matchMedia(query: string): MediaQueryList {
	return {
		matches: false,
		media: query,
		onchange: null,
		addListener: noop, // Deprecated
		removeListener: noop, // Deprecated
		addEventListener: noop,
		removeEventListener: noop,
		dispatchEvent: (): boolean => true
	};
};

window.fetch = require('node-fetch');
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
