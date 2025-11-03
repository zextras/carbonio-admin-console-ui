/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './index.css';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';

import LoadingView from './boot/splash';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

window.addEventListener('contextmenu', (ev) => {
	if (
		!(
			['IMG', 'A'].find(
				// @ts-ignore
				(name) => ev?.target?.tagName === name
			) ||
			ev.view?.getSelection?.()?.type === 'Range' ||
			// @ts-ignore
			ev.path?.find((element) =>
				element.classList?.find?.((cl: string) => cl === 'carbonio-bypass-context-menu')
			)
		)
	)
		ev.preventDefault();
});

// @ts-ignore works as intended, but it's tampering with the window
window.__CARBONIO_DEV__ = !!new URL(window.location).searchParams.get('dev');
const Bootstrapper = lazy(() => import('./boot/bootstrapper'));

// @ts-ignore
if (import.meta.hot) {
	// @ts-ignore
	import.meta.hot.accept();
}

const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(
	<Suspense fallback={<LoadingView />}>
		<Bootstrapper key="boot" />
	</Suspense>
);
