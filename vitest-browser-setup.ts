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

// Import stores at module level to avoid dynamic import issues in tests
// This will fail gracefully if running from within bootstrap app
let storesModule: any = null;
let storesImportFailed = false;

// Use top-level await to load stores before tests start
try {
	storesModule = await import('@zextras/admin-ui-bootstrap');
} catch (error) {
	// Running from within bootstrap app or import failed
	storesImportFailed = true;
	console.debug('Could not import stores module, store resets will be skipped', error);
}

beforeAll(async () => {
	// Ensure stores module is loaded before starting MSW
	// This prevents race conditions in CI environments
	let retries = 0;
	while (!storesModule && !storesImportFailed && retries < 10) {
		await new Promise((resolve) => setTimeout(resolve, 100));
		retries++;
	}

	await startMockWorker();
});

beforeEach(async () => {
	vi.useFakeTimers();
	resetMockWorker();

	// Reset all Zustand stores to initial state before each test
	// This prevents state leakage between tests
	if (!storesImportFailed && storesModule) {
		const {
			useAdminConfigStore,
			useBucketServersListStore,
			useDomainStore,
			useGlobalConfigStore,
			useServerStore
		} = storesModule;

		useAdminConfigStore.setState({ config: [], userId: '' });
		useDomainStore.setState({
			domain: {},
			domainWithoutConfig: {},
			cosList: [],
			domainView: '',
			domainList: [],
			isDomainSupportDelegatedAdmin: false,
			closeDomainBanner: '',
			isQuickAccess: false,
			isCertificateAvailbale: false
		});
		useServerStore.setState({
			server: {},
			serverList: [],
			serverView: '',
			mtaServerList: []
		});
		useBucketServersListStore.setState({
			allServersList: [],
			volumeList: []
		});
		useGlobalConfigStore.setState({
			globalConfig: {},
			globalConfigList: [],
			globalConfigView: '',
			globalCarbonioSendAnalytics: false
		});
	}
});

afterAll(() => {
	stopMockWorker();
	vi.clearAllMocks();
	resetMockWorker();
});

afterEach(async () => {
	vi.unstubAllGlobals();
	resetMockWorker();
	vi.useRealTimers();
});
