/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { lazy,Suspense } from 'react';
import ReactDOM from 'react-dom/client';

import LoadingView from './boot/splash';

window.addEventListener('contextmenu', (ev) => {
	if (
		!(
			['IMG', 'A'].find(
				// @ts-expect-error - needs a fix
				(name) => ev?.target?.tagName === name
			) ||
			ev.view?.getSelection?.()?.type === 'Range' ||
			// @ts-expect-error - needs a fix
			ev.path?.find((element) =>
				element.classList?.find?.((cl: string) => cl === 'carbonio-bypass-context-menu')
			)
		)
	)
		ev.preventDefault();
});

// @ts-expect-error - needs a fix works as intended, but it's tampering with the window
window.__CARBONIO_DEV__ = !!new URL(window.location).searchParams.get('dev');
const Bootstrapper = lazy(() => import('./boot/bootstrapper'));

// Hot Module Replacement (only active during dev server, not in builds)
if (import.meta.hot) {
	import.meta.hot.accept();
}

const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(
	<Suspense fallback={<LoadingView />}>
		<Bootstrapper key="boot" />
	</Suspense>
);
