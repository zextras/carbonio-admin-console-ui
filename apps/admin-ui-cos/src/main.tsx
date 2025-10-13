/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import App from './app';

declare global {
	const PACKAGE_NAME: string;
	
	interface Window {
		__ZAPP_HMR_EXPORT__: Record<string, (app: unknown) => void>;
	}
	
	interface ImportMeta {
		hot?: {
			accept: (module: string, callback: () => void) => void;
		};
	}
}

async function bootApp() {
	console.log('[COS Module] Attempting to boot...', {
		PACKAGE_NAME,
		hasWindow: typeof window !== 'undefined',
		hasZappExport: !!window.__ZAPP_HMR_EXPORT__,
		hasFunction: window.__ZAPP_HMR_EXPORT__ && typeof window.__ZAPP_HMR_EXPORT__[PACKAGE_NAME] === 'function'
	});
	
	if (window.__ZAPP_HMR_EXPORT__ && typeof window.__ZAPP_HMR_EXPORT__[PACKAGE_NAME] === 'function') {
		console.log('[COS Module] Registering app with shell...');
		window.__ZAPP_HMR_EXPORT__[PACKAGE_NAME](App);
		console.log('[COS Module] App registered successfully');
	} else {
		console.error('[COS Module] Shell bootstrap not found, app may not load correctly', {
			available: window.__ZAPP_HMR_EXPORT__ ? Object.keys(window.__ZAPP_HMR_EXPORT__) : 'none'
		});
	}
}

bootApp();

if (import.meta.hot) {
	import.meta.hot.accept('./app', bootApp);
}
