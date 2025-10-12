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
	if (window.__ZAPP_HMR_EXPORT__ && typeof window.__ZAPP_HMR_EXPORT__[PACKAGE_NAME] === 'function') {
		window.__ZAPP_HMR_EXPORT__[PACKAGE_NAME](App);
	} else {
		console.warn('Shell bootstrap not found, app may not load correctly');
	}
}

bootApp();

if (import.meta.hot) {
	import.meta.hot.accept('./app', bootApp);
}
